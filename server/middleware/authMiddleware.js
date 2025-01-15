const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async(req,res,next)=> {
    const token = req.cookies.myTubeUserToken;
    try {
        if(token){
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decode.id);
            if(!user){
                return res.status(404).json({message:"User not found"})
            }
            req.user = user;
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Invalid token"});
    }
}

module.exports = authMiddleware;