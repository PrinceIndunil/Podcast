const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listAvailableModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("No API Key found");
        return;
    }

    try {
        console.log("--- Testing with DEFAULT (v1beta) ---");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("--- Testing with gemini-flash-latest (v1beta) ---");
        const modelLatest = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        try {
            const result = await modelLatest.generateContent("test");
            console.log("SUCCESS: gemini-flash-latest works!");
        } catch (e) {
            console.log(`FAILED: gemini-flash-latest - ${e.message}`);
        }

        console.log("\n--- Testing with v1 API ---");
        const modelV1 = genAI.getGenerativeModel({ model: "gemini-flash-latest" }, { apiVersion: 'v1' });
        try {
            const result = await modelV1.generateContent("test");
            console.log("SUCCESS: v1 works!");
        } catch (e) {
            console.log(`FAILED: v1 - ${e.message}`);
        }

        console.log("\n--- Testing with gemini-pro (v1) ---");
        const modelProV1 = genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: 'v1' });
        try {
            const result = await modelProV1.generateContent("test");
            console.log("SUCCESS: gemini-pro v1 works!");
        } catch (e) {
            console.log(`FAILED: gemini-pro v1 - ${e.message}`);
        }
    } catch (error) {
        console.error("Error during listing:", error);
    }
}

listAvailableModels();
