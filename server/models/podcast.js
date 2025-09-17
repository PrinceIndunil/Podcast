const mongoose = require("mongoose");

// Episode schema
const episodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    audioFile: {
        type: String,
        required: true
    },
    episodeNumber: {
        type: Number,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: null
    },
    episodeImage: {
        type: String,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Podcast schema
const podcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    frontImage: {
        type: String,
        required: true
    },
    audioFile: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    episodes: {
      type: [episodeSchema],
      default: [] 
    },
    totalEpisodes: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    language: {
        type: String,
        default: "English"
    },
    explicit: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Update totalEpisodes count before saving
podcastSchema.pre('save', function(next) {
    this.totalEpisodes = this.episodes?.length || 0;
    next();
});

// Virtual for getting episode count
podcastSchema.virtual('episodeCount').get(function() {
    return this.episodes?.length || 0;
});

// Ensure virtual fields are serialized
podcastSchema.set('toJSON', { virtuals: true });
podcastSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("podcasts", podcastSchema);