const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
    console.log('=== AUTH MIDDLEWARE DEBUG START ===');
    
    const token = req.cookies.myTubeUserToken;
    console.log('Token present:', !!token);
    
    try {
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: "No token provided" });
        }

        console.log('Verifying JWT token...');
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decode);
        console.log('Token properties:', Object.keys(decode));
        
        // Handle different possible field names for user ID
        const userId = decode.id || decode.userId || decode._id || decode.user_id;
        console.log('Extracted user ID:', userId);
        
        if (!userId) {
            console.log('No user ID found in token');
            return res.status(401).json({ message: "Invalid token: missing user ID" });
        }
        
        console.log('Looking up user by ID:', userId);
        const user = await User.findById(userId).select("-password");
        console.log('User found:', !!user);
        
        if (!user) {
            console.log('User not found in database for ID:', userId);
            return res.status(404).json({ message: "User not found" });
        }
        
        console.log('User details:', {
            id: user._id,
            email: user.email,
            username: user.username,
            isGoogleUser: user.isGoogleUser
        });
        
        req.user = user;
        console.log('=== AUTH MIDDLEWARE SUCCESS ===');
        next();
        
    } catch (error) {
        console.error('=== AUTH MIDDLEWARE ERROR ===');
        console.error("Auth middleware error:", error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('=== END AUTH ERROR ===');
        
        // Clear the invalid token cookie
        res.clearCookie('myTubeUserToken');
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Please login again." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token. Please login again." });
        } else if (error.name === 'CastError') {
            return res.status(401).json({ message: "Invalid user ID in token. Please login again." });
        } else {
            return res.status(500).json({ message: "Authentication failed. Please try again." });
        }
    }
}

module.exports = authMiddleware;