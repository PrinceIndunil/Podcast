const mongoose = require("mongoose");

const liveSessionSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    status: {
        type: String,
        enum: ["live", "ended"],
        default: "live"
    },
    viewers: {
        type: Number,
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    agoraChannel: {
        type: String,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model("liveSession", liveSessionSchema);
