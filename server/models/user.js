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
      required: function(){
        return !this.isGoogleUser;
      }
    },

    profilePic: {
      type: String,
      default: "default-profile.png",
    },

    googleId: {
      type: String,
      default: null,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    podcasts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "podcasts",
      },
    ],

    watchedPodcasts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'podcasts'
    }],
    
    watchHistory: {
        type: mongoose.Schema.Types.Mixed, 
        default: {}
    },
    
    savedPodcasts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'podcasts'
    }],

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
