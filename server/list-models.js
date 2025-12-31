const axios = require("axios");
require("dotenv").config();

async function listModelsDirectly() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    try {
        console.log("Fetching models from v1beta...");
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("Available Models (v1beta):");
        response.data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`));
    } catch (error) {
        console.error("Error fetching v1beta models:", error.response ? error.response.status : error.message);
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    }

    try {
        console.log("\nFetching models from v1...");
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        console.log("Available Models (v1):");
        response.data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`));
    } catch (error) {
        console.error("Error fetching v1 models:", error.response ? error.response.status : error.message);
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

listModelsDirectly();
