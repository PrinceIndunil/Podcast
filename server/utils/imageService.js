const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * Generates a unique cover image for a podcast based on its topic
 * @param {string} topic 
 * @returns {Promise<string>} Relative path to the saved image
 */
async function generateTopicImage(topic) {
    try {
        console.log(`[AI Image] Generating cover for: "${topic}"...`);

        const enhancedPrompt = `Professional podcast cover art about ${topic}, cinematic lighting, high quality digital illustration, vibrant colors, tech-focused, no text, centered composition`;
        const encodedPrompt = encodeURIComponent(enhancedPrompt);

        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream',
            timeout: 30000 
        });

        const fileName = `ai_cover_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, "../uploads", fileName);

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`[AI Image] Cover saved at: ${filePath}`);
                resolve(`uploads/${fileName}`);
            });
            writer.on('error', (err) => {
                console.error("[AI Image] Stream Error:", err);
                reject(err);
            });
        });

    } catch (error) {
        console.error("[AI Image] Generation failed:", error.message);
        return "uploads/ai_cover_placeholder.jpg";
    }
}

module.exports = { generateTopicImage };
