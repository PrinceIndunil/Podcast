const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_IDS = {
    ALICE: "21m00Tcm4TlvDq8ikWAM", 
    BOB: "AZnzlk1XvdvUeBnXmlld" 
};

/**
 * Generates a full podcast or episode from a topic
 * @param {string} topic 
 * @param {boolean} isDeepDive - If true, generates a technical/detailed segment
 * @param {string} podcastTitle - Context for deep dive
 * @returns {Promise<string>} Path to the generated audio file
 */
async function generateAIPodcast(topic, isDeepDive = false, podcastTitle = "") {
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY in server/.env");

    if (!process.env.ELEVENLABS_API_KEY) console.warn("Missing ELEVENLABS_API_KEY. Using gTTS fallback.");

    const sessionDir = path.join(__dirname, "../temp", uuidv4());
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    try {
        const type = isDeepDive ? "Deep Dive Episode" : "Podcast Intro";
        console.log(`[AI Host] Generating ${type} for topic: "${topic}"...`);

        const script = await generateScript(topic, isDeepDive, podcastTitle);
        console.log(`[AI Host] Script generated with ${script.length} lines.`);

        const audioFiles = [];
        for (let i = 0; i < script.length; i++) {
            const line = script[i];
            const voiceId = line.speaker === "Alice" ? VOICE_IDS.ALICE : VOICE_IDS.BOB;
            const fileName = path.join(sessionDir, `segment_${i.toString().padStart(3, '0')}.mp3`);

            console.log(`[AI Host] Synthesizing line ${i + 1}/${script.length} (${line.speaker})...`);
            await generateVoice(line.text, voiceId, fileName);
            audioFiles.push(fileName);
        }

        console.log("[AI Host] Merging audio files...");
        const outputFileName = `ai_podcast_${Date.now()}.mp3`;
        const outputPath = path.join(__dirname, "../uploads", outputFileName);

        if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        await mergeAudioFiles(audioFiles, outputPath);
        console.log(`[AI Host] Podcast generated at: ${outputPath}`);

        fs.rmSync(sessionDir, { recursive: true, force: true });

        const transcriptText = script.map(line => `${line.speaker}: ${line.text}`).join("\n");

        return {
            audioPath: `uploads/${outputFileName}`,
            transcript: transcriptText
        };

    } catch (error) {
        console.error("[AI Host] Creation failed:", error);
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
        throw error;
    }
}

async function generateScript(topic, isDeepDive = false, podcastTitle = "") {
    let prompt = "";

    if (isDeepDive) {
        prompt = `
            Context: This is a follow-up "Deep Dive" episode for the podcast titled "${podcastTitle}".
            Subject: "${topic}".
            Goal: Teach this topic deeply. Skip general introductions. 
            Focus on technical details, advanced concepts, "how-it-works" under the hood, and practical implementation details.
            
            Characters: 
            - Alice (Host, Enthusiastic, asking very specific technical questions)
            - Bob (Expert, provides detailed, informative, and logical explanations)

            Format: JSON Array of objects.
            Example:
            [
                { "speaker": "Alice", "text": "So Bob, let's talk about the specific architecture of ${topic}." },
                { "speaker": "Bob", "text": "Sure Alice. The core mechanism relies on three main layers..." }
            ]
            
            Keep sentences relatively short for better TTS flow.
            RETURN ONLY RAW JSON.
        `;
    } else {
        prompt = `
            Write a short, engaging podcast script (approx 2 minutes) about: "${topic}".
            Characters: 
            - Alice (Host, enthusiastic, curious)
            - Bob (Expert, calm, informative)

            Format: JSON Array of objects.
            Example:
            [
                { "speaker": "Alice", "text": "Welcome back! Today we are talking about AI." },
                { "speaker": "Bob", "text": "That's right Alice. It is a fascinating topic." }
            ]
            
            Keep sentences relatively short for better TTS flow.
            RETURN ONLY RAW JSON.
        `;
    }

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("[AI Host] Script Generation failed (Gemini Error). Using Fallback Script.", error.message);

        return [
            { "speaker": "Alice", "text": `Welcome to our ${isDeepDive ? "deep dive" : "special episode"} about ${topic}!` },
            { "speaker": "Bob", "text": "It is great to be here, Alice. This is a very interesting subject." },
            { "speaker": "Alice", "text": "We are experiencing some connection issues with our script writer today." },
            { "speaker": "Bob", "text": "That is correct. But thanks to our backup system, we can still bring you this broadcast." },
            { "speaker": "Alice", "text": `Stay tuned for more updates on ${topic} in the next episode!` }
        ];
    }
}

async function generateVoice(text, voiceId, outputPath) {
    try {
        if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes("your_key")) {
            throw new Error("Missing ElevenLabs Key");
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const response = await axios({
            method: "POST",
            url: url,
            data: {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: { stability: 0.5, similarity_boost: 0.5 }
            },
            headers: {
                "Accept": "audio/mpeg",
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            },
            responseType: "stream"
        });

        return new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(outputPath);
            response.data.pipe(fileStream);
            fileStream.on("finish", resolve);
            fileStream.on("error", reject);
        });

    } catch (error) {
        console.log(`[AI Host] ElevenLabs failed (${error.message}). Using FREE gTTS Fallback...`);

        const gTTS = require("gtts");
        const gtts = new gTTS(text, "en");

        return new Promise((resolve, reject) => {
            gtts.save(outputPath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

function mergeAudioFiles(inputFiles, outputPath) {
    return new Promise((resolve, reject) => {
        const command = ffmpeg();

        inputFiles.forEach(file => {
            command.input(file);
        });

        command
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputPath))
            .mergeToFile(outputPath, path.dirname(outputPath));
    });
}

module.exports = { generateAIPodcast };
