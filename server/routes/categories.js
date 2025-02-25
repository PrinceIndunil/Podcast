const express = require("express");
const router = express.Router();
const Cat = require("../models/category");

router.post("/add-category", async (req, res) => {
    const { categoryName, color, image, podcasts } = req.body;

    if (!categoryName) {
        return res.status(400).json({ message: "Category name is required" });
    }

    try {
        console.log("Incoming request:", req.body);

        // Check if the category already exists
        const existingCategory = await Cat.findOne({ categoryName });
        console.log("Existing category:", existingCategory);

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        // Create and save the new category
        const newCategory = new Cat({
            categoryName,
            color, 
            image, 
            podcasts, 
        });
        const savedCategory = await newCategory.save();

        console.log("Saved category:", savedCategory);

        res.status(201).json({ message: "Category added", category: savedCategory });
    } catch (error) {
        console.error("Error adding category:", error.message);
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
});



module.exports = router;
