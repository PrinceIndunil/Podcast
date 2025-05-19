const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true, // unique: false (multiple users can have same password hash)
    },

    profilePic: {
      type: String,
      default: "default-profile.png",
    },

    podcasts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "podcasts",
      },
    ],

    watchedPodcasts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "podcasts",
      },
    ],

    playHistory: [
      {
        podcast: { type: mongoose.Types.ObjectId, ref: "podcasts" },
        playedAt: { type: Date, default: Date.now },
      },
    ],

    lastPlayed: {
      podcast: { type: mongoose.Types.ObjectId, ref: "podcasts" },
      time: { type: Number, default: 0 }, // in seconds
    },

    progress: [
      {
        podcast: { type: mongoose.Types.ObjectId, ref: "podcasts" },
        time: { type: Number, default: 0 }, // in seconds
      },
    ],

    watchHistory: {
      type: Map,
      of: {
        progress: Number,
        duration: Number,
        watchedAt: Date,
      },
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
