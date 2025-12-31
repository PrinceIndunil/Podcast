const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Uploads audio to Gemini and generates insights
 * @param {string} filePath - Local path to the audio file
 * @param {string} mimeType - e.g., "audio/mp3"
 */
async function generatePodcastInsights(filePath, mimeType = "audio/mp3") {
    try {
        console.log("AI Service: Uploading file to Gemini...");

        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: path.basename(filePath),
        });

        const fileUri = uploadResult.file.uri;
        console.log(`AI Service: File uploaded to ${fileUri}`);

        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === "PROCESSING") {
            console.log("AI Service: Processing audio...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === "FAILED") {
            throw new Error("Audio processing failed by Gemini.");
        }

        console.log("AI Service: Audio processed. Generating insights...");

        const prompt = `
            You are an expert podcast assistant. Listen to this audio and provide:
            1. A full transcript (plain text).
            2. A concise summary (max 3 sentences).
            3. Key highlights with timestamps (e.g., "02:30").
            4. The overall emotional tone/mood (1-2 words, e.g., "Inspirational", "Tense", "Humorous", "Relaxing").

            RETURN ONLY RAW JSON in this format (no markdown code blocks):
            {
                "transcript": "...",
                "summary": "...",
                "highlights": [
                    { "timestamp": "MM:SS", "topic": "Topic description" }
                ],
                "mood": "Mood"
            }
        `;

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResult.file.mimeType,
                    fileUri: uploadResult.file.uri
                }
            },
            { text: prompt }
        ]);

        const responseText = result.response.text();
        console.log("AI Service: Response received.");

        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const insights = JSON.parse(jsonString);

        return insights;

    } catch (error) {
        console.error("AI Service Error:", error);
        return null; 
    }
}

/**
 * Generates a response to a user query based on the podcast transcript
 * @param {string} transcript - The podcast transcript
 * @param {string} query - The user's question
 * @param {Array} history - Previous messages for context [{role: 'user'|'model', text: '...'}]
 */
async function generateChatResponse(transcript, query, history = []) {
    try {
        const chatModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const systemPrompt = `
            You are an AI Podcast Assistant for the "MyTube" platform. 
            You have access to the transcript of the podcast episode the user is currently listening to.
            
            TRANSCRIPT:
            """
            ${transcript}
            """
            
            INSTRUCTIONS:
            1. Answer the user's questions ONLY using the information in the transcript provided above.
            2. If the user asks for a summary, provide a concise but comprehensive one.
            3. If the user asks about the "last 5 minutes", estimate based on the transcript's length if timestamps aren't available, or focus on the concluding sections.
            4. If the answer is not in the transcript, politely say you don't know based on this episode.
            5. Keep your tone helpful, engaging, and concise.
        `;

        const chat = chatModel.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I am ready to answer questions about this podcast based on the transcript." }] },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ]
        });

        const result = await chat.sendMessage(query);
        return result.response.text();

    } catch (error) {
        console.error("AI Chat Error:", error);
        return "I'm sorry, I'm having trouble processing that request right now.";
    }
}

module.exports = { generatePodcastInsights, generateChatResponse };
