const router = require("express").Router();
const cors = require("cors");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const crypto = require("crypto");

const nodemailer = require("nodemailer");


//SignUp route
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (username.length < 5) {
            return res.status(400).json({ message: "Username must have 5 characters" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must have 6 characters" })
        }

        // check user exist or not
        const existingEmail = await User.findOne({ email: email });
        const existingUsername = await User.findOne({ username: username });
        if (existingEmail || existingUsername) {
            return res.status(400).json({ message: "Username or email already exist" })
        }

        //Hashed the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPass });
        await newUser.save();
        return res.status(200).json({ message: "Account created" })

    } catch (error) {
        res.status(500).json({ error });
    }
});

//Sign in
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        //Check user exist
        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        //Check password is match or not
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        //Generate JWT Token
        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.cookie("myTubeUserToken", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, 
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });
        
        return res.status(200).json({
            id: existingUser._id,
            username: existingUser.username,
            email: email,
            message: "Sign-in successfully",
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

//Logout
router.post("/logout", async (req, res) => {
    res.clearCookie("myTubeUserToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.status(200).json({ message: "Logged out successfully" })
});

//check cookie present or not
router.get("/check-cookie", async (req, res) => {
    const token = req.cookies.myTubeUserToken;
    if (token) {
        try {
            // Verify the token to make sure it's valid
            jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json({ message: true });
        } catch (error) {
            // Token is invalid, clear it
            res.clearCookie("myTubeUserToken");
            return res.status(200).json({ message: false });
        }
    }
    return res.status(200).json({ message: false });
});

//Route to fetch user details
router.get("/user-details", authMiddleware, async (req, res) => {
    try {
        const { email } = req.user;
        const existingUser = await User.findOne({ email: email }).select(
            "-password"
        );
        return res.status(200).json({
            user: existingUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});

// Update user profile
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Get logged-in user
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    // Return updated user (without password)
    const userData = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post('/google-login', async (req, res) => {
  try {
    console.log('=== GOOGLE LOGIN DEBUG START ===');
    console.log('Request body:', req.body);
    
    const { idToken, email, username, photoURL, uid } = req.body;

    if (!email || !uid) {
      console.log('Missing required fields:', { email: !!email, uid: !!uid });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Looking for user with email:', email);
    let user = await User.findOne({ email: email });
    console.log('Existing user found:', !!user);
    
    if (!user) {
      console.log('Creating new Google user...');
      user = new User({
        email: email,
        username: username || email.split('@')[0],
        profilePic: photoURL || '',
        googleId: uid,
        isGoogleUser: true,
        isVerified: true,
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      });
      
      const savedUser = await user.save();
      console.log('New user created with ID:', savedUser._id);
      user = savedUser;
    } else {
      console.log('Updating existing user...');
      if (username) user.username = username;
      user.googleId = uid;
      user.isGoogleUser = true;
      if (photoURL) user.profilePic = photoURL;
      user.isVerified = true;
      
      const updatedUser = await user.save();
      console.log('User updated with ID:', updatedUser._id);
      user = updatedUser;
    }

    // Create JWT token
    console.log('Creating JWT token for user ID:', user._id);
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('JWT token created successfully');

    res.cookie('myTubeUserToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log('Cookie set successfully');
    console.log('=== GOOGLE LOGIN DEBUG END ===');
    
    res.status(200).json({
      message: 'Google login successful',
      id: user._id,
      username: user.username,
      email: user.email,
    });

  } catch (error) {
    console.error('=== GOOGLE LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    console.error('=== END ERROR ===');
    
    res.status(500).json({ 
      message: 'Google login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Facebook OAuth route
router.post('/facebook', async (req, res) => {
    const { accessToken, userInfo } = req.body;

    try {
        const response = await axios.get(
            `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`
        );

        if (response.data.id !== userInfo.id) {
            return res.status(400).json({ message: 'Invalid Facebook token' });
        }

        const { email, name, id: facebookId } = userInfo;
        let user = await User.findOne({ email });

        if (!user) {
            const baseUsername = name.toLowerCase().replace(/\s+/g, '');
            let username = baseUsername;
            let counter = 1;
            
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                username,
                email,
                password: await bcrypt.hash(Math.random().toString(36), 10),
                facebookId,
                provider: 'facebook'
            });
        }

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.cookie('myTubeUserToken', jwtToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });

        res.status(200).json({ 
            message: 'Facebook login successful', 
            id: user._id,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        console.error('Facebook auth error:', error);
        res.status(400).json({ message: 'Facebook login failed' });
    }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if email exists in DB
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000;
  await user.save();

  // Send email with link
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });

  res.json({ message: "Password reset link sent!" });
});


module.exports = router;