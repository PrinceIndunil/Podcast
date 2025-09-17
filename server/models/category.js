const mongoose = require("mongoose");

const category = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        required: true,
    },
    color: {
        type: String,
        default: "transparent",
    },
    image: {
        type: String,
        default: "", 
    },
    podcasts: [
        {
            type: mongoose.Types.ObjectId,
            ref: "podcasts",
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("category", category, "categories");
