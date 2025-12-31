const authMiddleware = require("../middleware/authMiddleware");
const { generateTopicImage } = require("../utils/imageService");
const { generateChatResponse, generatePodcastInsights } = require("../utils/aiService");
const upload = require("../middleware/multer");
const Category = require("../models/category");
const User = require("../models/user");
const Podcast = require("../models/podcast");
const router = require("express").Router();

router.post("/add-episode", authMiddleware, upload, async (req, res) => {
    try {
        const { podcastId, title, description, episodeNumber, duration } = req.body;
        const episodeImage = req.files["episodeImage"]?.[0]?.path;
        const audioFile = req.files["audioFile"]?.[0]?.path;

        if (!podcastId || !title || !description || !audioFile) {
            return res.status(400).json({ message: "Podcast ID, title, description, and audio file are required" });
        }

        console.log("Adding episode to podcast:", podcastId);

        const podcast = await Podcast.findOne({
            _id: podcastId,
            user: req.user._id
        });

        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found or you don't have permission to add episodes" });
        }

        const newEpisode = {
            title,
            description,
            audioFile,
            episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
            duration: duration ? parseInt(duration) : null,
            episodeImage: episodeImage || null,
            uploadedAt: new Date()
        };

        if (!podcast.episodes) podcast.episodes = [];
        podcast.episodes.push(newEpisode);
        await podcast.save();

        res.status(201).json({
            message: "Episode added successfully",
            episode: newEpisode
        });
    } catch (error) {
        console.error("Error adding episode:", error);
        res.status(500).json({ message: "Failed to add episode" });
    }
});

router.get("/get-episodes", async (req, res) => {
    try {
        const podcasts = await Podcast.find({})
            .populate("user", "name email")
            .select("title description episodes audioFile frontImage createdAt duration")
            .lean();

        let allEpisodes = [];

        podcasts.forEach(podcast => {
            allEpisodes.push({
                _id: podcast._id,
                title: podcast.title,
                description: podcast.description,
                audioFile: podcast.audioFile,
                episodeImage: podcast.frontImage,
                episodeNumber: 1,
                duration: podcast.duration,
                createdAt: podcast.createdAt,
                podcastId: podcast._id,
                podcastTitle: podcast.title,
                isOriginal: true
            });

            if (Array.isArray(podcast.episodes)) {
                podcast.episodes.forEach(ep => {
                    allEpisodes.push({
                        ...ep,
                        podcastId: podcast._id,
                        podcastTitle: podcast.title
                    });
                });
            }
        });

        res.status(200).json({ data: allEpisodes });
    } catch (error) {
        console.error("Error fetching all episodes:", error);
        res.status(500).json({ message: "Failed to fetch episodes" });
    }
});

router.delete("/delete-episode/:podcastId/:episodeId", authMiddleware, async (req, res) => {
    try {
        const { podcastId, episodeId } = req.params;
        const podcast = await Podcast.findOne({
            _id: podcastId,
            user: req.user._id
        });
        if (!podcast) return res.status(404).json({ message: "Podcast not found or unauthorized" });
        podcast.episodes = podcast.episodes.filter(episode => episode._id.toString() !== episodeId);
        await podcast.save();
        res.status(200).json({ message: "Episode deleted successfully" });
    } catch (error) {
        console.error("Error deleting episode:", error);
        res.status(500).json({ message: "Failed to delete episode" });
    }
});

router.post("/generate-podcast", authMiddleware, async (req, res) => {
    try {
        const { topic, category } = req.body;
        if (!topic || !category) return res.status(400).json({ message: "Topic and Category are required" });

        console.log("Generating AI Podcast for topic:", topic);
        const { generateAIPodcast } = require("../utils/audioGenerator");
        const { audioPath, transcript } = await generateAIPodcast(topic);
        const imagePath = await generateTopicImage(topic);

        const cat = await Category.findOne({ categoryName: new RegExp(`^${category}$`, "i") });
        if (!cat) return res.status(400).json({ message: "Category not found" });

        const newPodcast = new Podcast({
            title: `AI Special: ${topic}`,
            description: `An AI-generated conversation between Alice and Bob about ${topic}.`,
            category: cat._id,
            frontImage: imagePath,
            audioFile: audioPath,
            transcript: transcript,
            summary: `A deep dive conversation exploring ${topic} with our AI hosts Alice and Bob.`,
            user: req.user._id,
            duration: 120,
            mood: "Educational"
        });

        await newPodcast.save();
        await Category.findByIdAndUpdate(cat._id, { $push: { podcasts: newPodcast._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { podcasts: newPodcast._id } });

        res.status(201).json({ message: "AI Podcast generated successfully!", podcast: newPodcast });
    } catch (error) {
        console.error("AI Generation failed:", error);
        res.status(500).json({ message: error.message || "Failed to generate podcast." });
    }
});

router.post("/generate-deep-dive", authMiddleware, async (req, res) => {
    try {
        const { podcastId, specificTopic } = req.body;
        if (!podcastId) return res.status(400).json({ message: "Podcast ID is required" });

        const podcast = await Podcast.findById(podcastId);
        if (!podcast) return res.status(404).json({ message: "Podcast not found" });

        const topic = specificTopic || podcast.title.replace("AI Special: ", "");
        console.log(`[AI Deep Dive] Generating for topic: "${topic}"...`);

        const { generateAIPodcast } = require("../utils/audioGenerator");
        const { audioPath, transcript } = await generateAIPodcast(topic, true, podcast.title);

        const newEpisode = {
            title: `Deep Dive: ${topic}`,
            description: `An advanced AI-generated exploration of ${topic}.`,
            audioFile: audioPath,
            uploadedAt: new Date()
        };

        if (!podcast.episodes) podcast.episodes = [];
        podcast.episodes.push(newEpisode);
        podcast.transcript = (podcast.transcript ? podcast.transcript + "\n\n--- Deep Dive ---\n\n" : "") + transcript;
        podcast.summary = `This podcast now includes a deep dive on ${topic}.`;

        await podcast.save();
        res.status(201).json({ message: "Deep Dive episode generated successfully!", episode: newEpisode });
    } catch (error) {
        console.error("AI Deep Dive failed:", error);
        res.status(500).json({ message: error.message || "Failed to generate deep dive episode." });
    }
});

router.post("/add-podcast", authMiddleware, upload, async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const frontImage = req.files["frontImage"]?.[0]?.path;
        const audioFile = req.files["audioFile"]?.[0]?.path;

        if (!title || !description || !category || !frontImage || !audioFile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const cat = await Category.findOne({ categoryName: new RegExp(`^${category}$`, "i") });
        if (!cat) return res.status(400).json({ message: `No category found for: ${category}` });

        const newPodcast = new Podcast({ title, description, category: cat._id, frontImage, audioFile, user: req.user._id });

        try {
            const insights = await generatePodcastInsights(audioFile);
            if (insights) {
                newPodcast.transcript = insights.transcript;
                newPodcast.summary = insights.summary;
                newPodcast.highlights = insights.highlights;
                newPodcast.mood = insights.mood;
            }
        } catch (aiError) {
            console.error("AI Generation failed (skipping):", aiError.message);
        }

        await newPodcast.save();
        await Category.findByIdAndUpdate(cat._id, { $push: { podcasts: newPodcast._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { podcasts: newPodcast._id } });
        res.status(201).json({ message: "Podcast added successfully (with AI Insights if available)" });
    } catch (error) {
        console.error("Error adding podcast:", error);
        res.status(500).json({ message: "Failed to add podcast" });
    }
});

router.delete("/remove-watch-history/:podcastId", authMiddleware, async (req, res) => {
    try {
        const { podcastId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.watchedPodcasts = user.watchedPodcasts.filter(p => p.toString() !== podcastId);
        await user.save();
        res.status(200).json({ message: "Item removed from history successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove from history" });
    }
});

router.delete("/clear-watch-history", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.watchedPodcasts = [];
        await user.save();
        res.status(200).json({ message: "Watch history cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear watch history" });
    }
});

router.get("/get-podcasts", async (req, res) => {
    try {
        const token = req.cookies.myTubeUserToken;
        let preferredCategoryIds = [];
        if (token) {
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).populate("watchedPodcasts");
                if (user && user.watchedPodcasts) {
                    const catCounts = {};
                    user.watchedPodcasts.forEach(p => { if (p.category) catCounts[p.category.toString()] = (catCounts[p.category.toString()] || 0) + 1; });
                    preferredCategoryIds = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);
                }
            } catch (err) {}
        }
        let podcasts = await Podcast.find().populate("category", "categoryName").lean();
        podcasts.sort((a, b) => {
            const aScore = preferredCategoryIds.indexOf(a.category?._id?.toString());
            const bScore = preferredCategoryIds.indexOf(b.category?._id?.toString());
            if (aScore !== -1 && bScore !== -1) return aScore - bScore;
            if (aScore !== -1) return -1;
            if (bScore !== -1) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        res.status(200).json({ data: podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-user-podcasts", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({ path: "podcasts", populate: { path: "category", select: "categoryName" } }).select("-password");
        if (user && user.podcasts) user.podcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json({ data: user.podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-podcast/:id", async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id).populate("category", "categoryName");
        res.status(200).json({ data: podcast });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find().populate('podcasts').sort({ categoryName: 1 });
        res.status(200).json({ data: categories });
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
});

router.get("/category/:cat", async (req, res) => {
    try {
        const categories = await Category.find({ categoryName: new RegExp(`^${req.params.cat}$`, "i") }).populate({ path: "podcasts", populate: { path: "category", select: "categoryName" } });
        let podcasts = [];
        categories.forEach((category) => { podcasts = [...podcasts, ...category.podcasts]; });
        res.status(200).json({ data: podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/save-watched", authMiddleware, async (req, res) => {
    try {
        const { podcastId, progress, duration } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.watchHistory) user.watchHistory = {};
        user.watchHistory[podcastId] = { progress: progress || 0, duration: duration || 0, watchedAt: new Date() };
        if (!user.watchedPodcasts.some(id => id.toString() === podcastId.toString())) user.watchedPodcasts.push(podcastId);
        await user.save();
        res.status(200).json({ message: "Watch progress saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-watched", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({ path: "watchedPodcasts", populate: { path: "category", select: "categoryName" } });
        if (!user) return res.status(404).json({ message: "User not found" });
        const podcastsWithHistory = user.watchedPodcasts.map(podcast => {
            const history = user.watchHistory && user.watchHistory[podcast._id.toString()];
            return { ...podcast.toObject(), watchedAt: history ? history.watchedAt : null, progress: history ? history.progress : 0 };
        });
        res.status(200).json({ data: podcastsWithHistory });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/like/:id", authMiddleware, async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id);
        if (!podcast) return res.status(404).json({ message: "Podcast not found" });
        podcast.dislikes = podcast.dislikes.filter(id => id.toString() !== req.user._id.toString());
        const alreadyLiked = podcast.likes.some(id => id.toString() === req.user._id.toString());
        if (alreadyLiked) podcast.likes = podcast.likes.filter(id => id.toString() !== req.user._id.toString());
        else podcast.likes.push(req.user._id);
        await podcast.save();
        res.status(200).json({ likes: podcast.likes.length, dislikes: podcast.dislikes.length, isLiked: !alreadyLiked });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.post("/dislike/:id", authMiddleware, async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id);
        if (!podcast) return res.status(404).json({ message: "Podcast not found" });
        podcast.likes = podcast.likes.filter(id => id.toString() !== req.user._id.toString());
        const alreadyDisliked = podcast.dislikes.some(id => id.toString() === req.user._id.toString());
        if (alreadyDisliked) podcast.dislikes = podcast.dislikes.filter(id => id.toString() !== req.user._id.toString());
        else podcast.dislikes.push(req.user._id);
        await podcast.save();
        res.status(200).json({ likes: podcast.likes.length, dislikes: podcast.dislikes.length, isDisliked: !alreadyDisliked });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.post("/comment/:id", authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const podcast = await Podcast.findById(req.params.id);
        const user = await User.findById(req.user._id);
        if (!podcast || !user) return res.status(404).json({ message: "Podcast or user not found" });
        const newComment = { user: req.user._id, username: user.username, text, createdAt: new Date() };
        podcast.comments.push(newComment);
        await podcast.save();
        res.status(201).json({ message: "Comment added successfully", comment: newComment });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.post("/save-podcast/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.savedPodcasts) user.savedPodcasts = [];
        if (user.savedPodcasts.includes(req.params.id)) return res.status(400).json({ message: "Already saved" });
        user.savedPodcasts.push(req.params.id);
        await user.save();
        res.status(200).json({ message: "Podcast saved", isSaved: true });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.delete("/unsave-podcast/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.savedPodcasts) {
            user.savedPodcasts = user.savedPodcasts.filter(id => id.toString() !== req.params.id);
            await user.save();
        }
        res.status(200).json({ message: "Podcast removed", isSaved: false });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.get("/check-saved-podcast/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const isSaved = user.savedPodcasts && user.savedPodcasts.includes(req.params.id);
        res.status(200).json({ isSaved });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.get("/get-saved-podcasts", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({ path: "savedPodcasts", populate: { path: "category", select: "categoryName" } });
        res.status(200).json({ data: user.savedPodcasts || [] });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

router.post("/chat/:id", authMiddleware, async (req, res) => {
    try {
        const { query, history } = req.body;
        const podcast = await Podcast.findById(req.params.id);
        if (!podcast) return res.status(404).json({ message: "Podcast not found" });
        if (!podcast.transcript) return res.status(400).json({ message: "Transcript not available." });
        const aiResponse = await generateChatResponse(podcast.transcript, query, history);
        res.status(200).json({ response: aiResponse });
    } catch (error) { res.status(500).json({ message: "Internal server error" }); }
});

module.exports = router;