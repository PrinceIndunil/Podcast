const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const Category = require("../models/category");
const User = require("../models/user");
const Podcast = require("../models/podcast");
const router = require("express").Router();

// Add podcast
router.post("/add-podcast", authMiddleware, upload, async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const frontImage = req.files["frontImage"]?.[0]?.path;
        const audioFile = req.files["audioFile"]?.[0]?.path;

        if (!title || !description || !category || !frontImage || !audioFile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("Incoming data:", { title, description, category });

        const cat = await Category.findOne({ categoryName: new RegExp(`^${category}$`, "i") });
        console.log("Matching category:", cat);

        if (!cat) {
            return res.status(400).json({ message: `No category found for: ${category}` });
        }

        const newPodcast = new Podcast({
            title,
            description,
            category: cat._id,
            frontImage,
            audioFile,
            user: req.user._id,
        });

        await newPodcast.save();
        await Category.findByIdAndUpdate(cat._id, { $push: { podcasts: newPodcast._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { podcasts: newPodcast._id } });

        res.status(201).json({ message: "Podcast added successfully" });
    } catch (error) {
        console.error("Error adding podcast:", error);
        res.status(500).json({ message: "Failed to add podcast" });
    }
});

// Implement missing route for removing single item from watch history
router.delete("/remove-watch-history/:podcastId/:userId", authMiddleware, async (req, res) => {
    try {
        const { podcastId, userId } = req.params;
        
        // Ensure user can only modify their own history
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Remove podcast from watched list
        user.watchedPodcasts = user.watchedPodcasts.filter(
            podcast => podcast.toString() !== podcastId
        );
        
        await user.save();
        res.status(200).json({ message: "Item removed from history successfully" });
    } catch (error) {
        console.error("Error removing podcast from history:", error);
        res.status(500).json({ message: "Failed to remove from history" });
    }
});

// Implement missing route for clearing entire watch history
router.delete("/clear-watch-history/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Ensure user can only modify their own history
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Clear watched podcasts array
        user.watchedPodcasts = [];
        
        await user.save();
        res.status(200).json({ message: "Watch history cleared successfully" });
    } catch (error) {
        console.error("Error clearing watch history:", error);
        res.status(500).json({ message: "Failed to clear watch history" });
    }
});

// Get all podcasts
router.get("/get-podcasts", async (req, res) => {
    try {
        const podcasts = await Podcast.find()
            .populate("category", "categoryName") // Fetch only categoryName
            .sort({ createdAt: -1 })
            .lean(); 

        res.status(200).json({ data: podcasts });
    } catch (error) {
        console.error("Error fetching podcasts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get user podcasts
router.get("/get-user-podcasts", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: "podcasts",
                populate: { path: "category", select: "categoryName" },
            })
            .select("-password");

        if (user && user.podcasts) {
            user.podcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.status(200).json({ data: user.podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get podcast by ID
router.get("/get-podcast/:id", async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id).populate("category", "categoryName");
        res.status(200).json({ data: podcast });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get podcasts by category
router.get("/category/:cat", async (req, res) => {
    try {
        const categories = await Category.find({ categoryName: new RegExp(`^${req.params.cat}$`, "i") })
            .populate({
                path: "podcasts",
                populate: { path: "category", select: "categoryName" },
            });

        let podcasts = [];
        categories.forEach((category) => {
            podcasts = [...podcasts, ...category.podcasts];
        });

        res.status(200).json({ data: podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Save watched podcast
router.post("/save-watched/:id", authMiddleware, async (req, res) => {
    try {
        const { podcastId, progress, duration } = req.body;
        const userId = req.params.id;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Create watchHistory object in User model if not exists
        if (!user.watchHistory) {
            user.watchHistory = {};
        }

        // Update watchHistory with progress and duration
        user.watchHistory[podcastId] = {
            progress: progress || 0,
            duration: duration || 0,
            watchedAt: new Date()
        };

        // Also add to watchedPodcasts array if not already there
        if (!user.watchedPodcasts.includes(podcastId)) {
            user.watchedPodcasts.push(podcastId);
        }
        
        await user.save();
        res.status(200).json({ message: "Watch progress saved successfully" });
    } catch (error) {
        console.error("Error saving watched podcast:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get watched podcasts (Optimized)
router.get("/get-watched/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: "watchedPodcasts",
                // Include all fields needed by frontend
                select: "title description category createdAt frontImage audioFile duration progress watchedAt",
                populate: { path: "category", select: "categoryName" },
            });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ data: user.watchedPodcasts });
    } catch (error) {
        console.error("Error fetching watched podcasts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
