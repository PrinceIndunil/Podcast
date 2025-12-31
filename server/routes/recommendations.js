const router = require("express").Router();
const User = require("../models/user");
const Podcast = require("../models/podcast");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/v1/recommendations
router.get("/recommendations", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: "watchedPodcasts",
            select: "category", 
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const categoryCounts = {};
        const watchedIds = user.watchedPodcasts.map(p => p._id);

        user.watchedPodcasts.forEach(p => {
            if (p.category) {
                const catId = p.category.toString();
                categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
            }
        });

        const sortedCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([catId]) => catId);

        let recommendations = [];

        if (sortedCategories.length > 0) {
            const topCategories = sortedCategories.slice(0, 3);

            recommendations = await Podcast.find({
                category: { $in: topCategories },
                _id: { $nin: watchedIds } 
            })
                .populate("category")
                .limit(10)
                .sort({ createdAt: -1 });
        }

        if (recommendations.length < 5) {
            const excludeIds = [...watchedIds, ...recommendations.map(r => r._id)];

            const trending = await Podcast.find({
                _id: { $nin: excludeIds }
            })
                .populate("category")
                .limit(5 - recommendations.length)
                .sort({ createdAt: -1 }); 

            recommendations = [...recommendations, ...trending];
        }

        res.status(200).json({
            data: recommendations,
            source: sortedCategories.length > 0 ? "personalized" : "trending"
        });

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
