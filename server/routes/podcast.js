const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const Category = require("../models/category");
const  User = require("../models/user")
const Podcast = require("../models/podcast");
const category = require("../models/category");
const router = require("express").Router();

//Add podcast
router.post("/add-podcast",authMiddleware,upload, async(req,res)=>{
    try {
        const {title,description, category} = req.body;
    const frontImage = req.files["frontImage"][0].path;
    const audioFile = req.files["audioFile"][0].path;
    if(!title || !description || !category || !frontImage|| !audioFile){
        return res.status(400).json({message:"All field are required"})
    }
    const {user} = req;
    const cat = await category.findOne({categoryName:category});
    if(!cat){
        return res.status(400).json({message:"No category found"})
    }
    const catid = cat._id;
    const userid = user._id;
    const newPodcast= new Podcast({
        title,
        description,
        category:catid,
        frontImage,
        audioFile,
        user:userid,
    });
    await newPodcast.save();
    await Category.findByIdAndUpdate(catid , 
        {$push:{podcasts:newPodcast._id},
    });
    await user.findByIdAndUpdate(userid,{$push:{podcasts:newPodcast._id}});
    res.status(201).json({message:"Podcast added successfuly"})
    } catch (error) {
        return res.status(500).json({message:"Failed to add podcast"});
    }
});

//get all podcast
router.get("/get-podcasts",async(req,res)=>{
    try {
        const podcasts = await Podcast.find().populate("category")
        .sort({createdAt : -1});
        return res.status(200).json({data: podcasts});
    } catch (error) {
        return res.status(500).json({message:"Internal server error"});
    }
});

//get user podcasts
router.get("/get-user-podcasts",authMiddleware,async(req,res)=>{
    try {
        const {user} = req;
        const userid = user._id;
        const data = await User.findById(userid).populate({
            path:"podcasts",
            populate:{path:"category"}
        }).select("-password");
        if(data && data.podcasts){
            data.podcasts.sort((a,b)=>new Date(b.createdAt)- new Date(a.createdAt)
        );
        }
        return res.status(200).json({data: data.podcasts});
    } catch (error) {
        return res.status(500).json({message:"Internal server error"});
    }
});
//Get podcast by id
router.get("/get-podcast/:id",async(req,res)=>{
    try {
        const {id} = req.params;
        const podcasts = await Podcast.findById(id).populate("category");
        return res.status(200).json({data: podcasts});
    } catch (error) {
        return res.status(500).json({message:"Internal server error"});
    }
});

//Get podcast by category
router.get("/category/cat",async(req,res)=>{
    try {
        const {cat} = req.params;
        const categories = await Category.find({categoryName:cat}).populate(
            {path:"podcasts",
            populate:{path:"category"},
        });
            let podcasts = [];
            categories.forEach((category)=>{
                podcasts = [...podcasts,...category.podcasts];
            })
        return res.status(200).json({data: podcasts});
    } catch (error) {
        return res.status(500).json({message:"Internal server error"});
    }
});


module.exports = router;