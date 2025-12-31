const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const LiveSession = require("../models/liveSession");
const Podcast = require("../models/podcast");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

router.post("/live/start", authMiddleware, async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const hostId = req.user._id;

        await LiveSession.updateMany(
            { host: hostId, status: "live" },
            { status: "ended", endedAt: Date.now() }
        );

        const agoraChannel = `live_${hostId}_${Date.now()}`;

        const appId = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = 3600 * 2; // 2 hours
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        let token = "";
        if (appId && appCertificate) {
            token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, agoraChannel, 0, role, privilegeExpiredTs);
        }

        const sessionData = {
            host: hostId,
            title,
            description,
            agoraChannel,
            status: "live"
        };

        if (category && category.trim() !== "") {
            sessionData.category = category;
        }

        const newSession = new LiveSession(sessionData);
        await newSession.save();

        res.status(200).json({
            message: "Live session started",
            session: newSession,
            agoraToken: token,
            appId: appId
        });
    } catch (error) {
        console.error("Start live error:", error);
        res.status(500).json({ message: "Server error starting live session" });
    }
});

router.post("/live/join/:id", async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);
        if (!session || session.status === "ended") {
            return res.status(404).json({ message: "Live session not found" });
        }

        const appId = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        const role = RtcRole.SUBSCRIBER;
        const expirationTimeInSeconds = 3600 * 2;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        let token = "";
        if (appId && appCertificate) {
            token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, session.agoraChannel, 0, role, privilegeExpiredTs);
        }

        session.viewers += 1;
        await session.save();

        res.status(200).json({
            session,
            agoraToken: token,
            appId: appId
        });
    } catch (error) {
        res.status(500).json({ message: "Error joining live session" });
    }
});

router.post("/live/end/:id", authMiddleware, upload, async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: "Session not found" });

        if (session.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to end this session" });
        }

        session.status = "ended";
        session.endedAt = Date.now();
        await session.save();

        try {
            const audioFile = req.files && req.files["audioFile"] ? req.files["audioFile"][0].path : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

            const archivePodcast = new Podcast({
                title: `[Live] ${session.title}`,
                description: session.description || "A recorded live broadcast.",
                category: session.category || "676676cf7446549419a4e334",
                frontImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
                audioFile: audioFile,
                user: session.host,
                episodes: [],
                isActive: true
            });
            await archivePodcast.save();
        } catch (archiveError) {
            console.error("Failed to archive live session:", archiveError);
        }

        res.status(200).json({ message: "Live session ended and archived" });
    } catch (error) {
        res.status(500).json({ message: "Error ending live session" });
    }
});

router.get("/live/active", async (req, res) => {
    try {
        const sessions = await LiveSession.find({ status: "live" })
            .populate("host", "username")
            .populate("category", "categoryName");
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching active sessions" });
    }
});

module.exports = router;
