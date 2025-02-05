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

        const allCategories = await Category.find();
        console.log("All categories in database:", allCategories.map(cat => cat.categoryName));

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



// Get all podcasts
router.get("/get-podcasts", async (req, res) => {
    try {
        const podcasts = await Podcast.find()
            .populate("category")
            .sort({ createdAt: -1 })
            .lean();  // Improves performance by returning plain objects

        res.status(200).json({ data: podcasts });
    } catch (error) {
        console.error("Error fetching podcasts:", error);  // Logs error for debugging
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get user podcasts
router.get("/get-user-podcasts", authMiddleware, async (req, res) => {
    try {
        const { user } = req;
        const userid = user._id;

        const data = await User.findById(userid)
            .populate({
                path: "podcasts",
                populate: { path: "category" },
            })
            .select("-password");

        if (data && data.podcasts) {
            data.podcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.status(200).json({ data: data.podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get podcast by ID
router.get("/get-podcast/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const podcasts = await Podcast.findById(id).populate("category");
        res.status(200).json({ data: podcasts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get podcasts by category
router.get("/category/:cat", async (req, res) => {
    try {
        const { cat } = req.params;

        // Find categories and populate podcasts
        const categories = await Category.find({ categoryName: new RegExp(`^${cat}$`, "i") }).populate({
            path: "podcasts",
            populate: { path: "category" },
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

module.exports = router;
