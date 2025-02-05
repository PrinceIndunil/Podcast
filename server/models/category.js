const mongoose = require("mongoose");

const category = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        required: true,
    },
    color: {
        type: String,
        default: "transparent", // You can define default colors if needed
    },
    image: {
        type: String,
        default: "", // Path to the category's image
    },
    podcasts: [
        {
            type: mongoose.Types.ObjectId,
            ref: "podcasts",
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("category", category, "categories");
