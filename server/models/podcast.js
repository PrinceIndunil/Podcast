const mongoose = require("mongoose");

const podcasts = new mongoose.Schema({
    frontImage: {
        type: String,
        // Ensure that the frontImage URL is unique (if that's your requirement)
        unique: true, 
        required: true,  // Ensures that the podcast must have a front image
    },
    audioFile: {
        type: String,
        // Ensure that the audioFile URL is unique (if that's your requirement)
        unique: true, 
        required: true,  // Ensures that the podcast must have an audio file
    },
    title: {
        type: String,
        // You might want to remove the `unique: true` if multiple podcasts can have the same title
        unique: true,  
        required: true,  // Ensures that the podcast must have a title
    },
    description: {
        type: String,
        // You might want to remove `unique: true` here too if multiple podcasts can have the same description
        unique: true,  
        required: true,  // Ensures that the podcast must have a description
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",  // This links the podcast to a user
        required: true,  // Ensure the podcast has a user associated with it (creator)
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "category",  // This links the podcast to a category
    },
}, { timestamps: true });  // Adds `createdAt` and `updatedAt` fields automatically

module.exports = mongoose.model("podcasts", podcasts);
