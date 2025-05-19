const mongoose = require("mongoose");

const podcasts = new mongoose.Schema({
  frontImage: {
    type: String,
    unique: true,
    required: true,
  },
  audioFile: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "category",
  },

  // ✅ Add the following fields:
  episodes: {
    type: Number,
    default: 1, // You can adjust based on how episodes are managed
  },
  totalDuration: {
    type: Number, // in seconds
    default: 0,
  },
  listeners: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("podcasts", podcasts);
