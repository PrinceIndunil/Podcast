const mongoose = require("mongoose");
require("dotenv").config();

async function dropIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.collection("podcasts");
        const indexes = await collection.indexes();

        const indexesToDrop = ["frontImage_1", "description_1", "audioFile_1", "title_1"];

        for (const indexName of indexesToDrop) {
            const hasIndex = indexes.some(idx => idx.name === indexName);
            if (hasIndex) {
                console.log(`Dropping index: ${indexName}`);
                await collection.dropIndex(indexName);
                console.log(`Index ${indexName} dropped successfully`);
            } else {
                console.log(`Index ${indexName} not found`);
            }
        }

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error dropping index:", error);
        process.exit(1);
    }
}

dropIndex();
