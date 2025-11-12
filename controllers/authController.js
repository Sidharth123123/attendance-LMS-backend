const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');
const Attendance = require("../models/Attendance");




// exports.signup = async (req, res) => {

//   const { name, email, password, number } = req.body;
//   const image = req.file?.path;  // e.g., 'uploads/163456789-profile.jpg'

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already registered' });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({ name, email, number, password: hashedPassword, image });
//     await user.save();

//     res.status(201).json({ message: 'Signup successful' });
//   } catch (err) {
//     res.status(500).json({ message: 'Signup failed', error: err.message });
//   }
// };


exports.signup = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  const { name, email, password, number } = req.body;
  const image = req.file?.path;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, number, password: hashedPassword, image });
    await user.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};




exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'OTP sent to email', token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};





// exports.logout = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     // Optional: clear OTP or token fields if you store them
//     user.otp = null;
//     await user.save();

//     res.json({ message: "Logout successful" });
//   } catch (err) {
//     res.status(500).json({ message: "Logout failed", error: err.message });
//   }
// };








exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email");
    console.log("Fetched users:", users);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};








// exports.Profile = async (req, res) => {
//   try {
//     const { city, state, address } = req.body;
//      try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Missing token" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Now your controller can access req.user.id
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }


//     const newProfile =  Profile({
//       user: userId,
//       city,
//       state,
//       address,

//     });

//     await newProfile.save();

//     console.log(" Profile Saved:");

//     res.status(200).json({
//       message: 'Profile API working fine',
//       data: newProfile
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };










// exports.Profile = async (req, res) => {
//   try {
//     const { city, state, address } = req.body;
//       const image = req.file?.path;

//     const userId = req.user.id; 

//     const newProfile = new Profile({
//       user: userId,
//       city,
//       state,
//       address,
//       image,
      
//     });

//     await newProfile.save();

//     console.log("Profile saved successfully");

//     res.status(200).json({
//       message: "Profile saved successfully",
//       data: newProfile,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save profile", error: err.message });
//   }
// };


























// const Profile = require("../models/Profile");










const path = require("path");

exports.Profile = async (req, res) => {
  try {
    const { city, state, address } = req.body;
    const image = req.file ? req.file.filename : null; // ✅ save only filename

    const userId = req.user.id;

    const newProfile = new Profile({
      user: userId,
      city,
      state,
      address,
      image,
    });

    await newProfile.save();

    console.log("✅ Profile saved successfully");

    res.status(200).json({
      message: "Profile saved successfully",
      data: newProfile,
    });
  } catch (err) {
    console.error("❌ Error saving profile:", err);
    res.status(500).json({
      message: "Failed to save profile",
      error: err.message,
    });
  }
};







// exports.getUserById = async(req,res)=>{
// try {
//     const { id } = req.body;
//   console.log(id,"sssssssssssssssssssssssssssssssssss")
//   if(!id||!id.match(/^[0-9a-fA-F]{24}$/))
//     return res.status(400).json({message:"invalid user id"})

//   const User = await User.findById(id).select('password')
//   if(!User) res.status(500).json({message:"user not found"})
//     return res.status(200).json(User)
// } catch (error) {
//   console.error('getUserById error',error)
//   return res.status(500).json({massege:"server error"})
// }
// }







exports.getUserById = async (req, res) => {
  try {
    const id = req.user.id;
    const profiles = await Profile.find({ user: id }).populate("user");

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }

    // ✅ Convert image path to valid URL
    const formattedProfiles = profiles.map((p) => {
      const profile = p.toObject();

      // extract only filename from the stored path
      const filename = profile.image
        ? profile.image.split("\\").pop().split("/").pop()
        : null;

      return {
        ...profile,
        image: filename ? `http://localhost:5000/uploads/${filename}` : null,
        user: {
          ...profile.user,
          image: profile.user?.image
            ? `http://localhost:5000/uploads/${
                profile.user.image.split("\\").pop().split("/").pop()
              }`
            : null,
        },
      };
    });
    // console.log(image,"imageimage")

    res.status(200).json({
      success: true,
      message: "Profiles fetched successfully",
      data: formattedProfiles,
    });
  } catch (error) {
    console.error("getUserById Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





















// exports.image = async (req, res) => {
//   try {
//     const userId = req.user.id; // decoded from verifyToken middleware

//     const profile = await Profile.findOne({ user: userId });

//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     res.status(200).json({
//       message: "User profile fetched successfully",
//       data: profile,
//     });
//   } catch (err) {
//     console.error("Error fetching profile:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };










exports.deleteProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id;

    const profile = await Profile.findOneAndDelete({ _id: profileId, user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found or unauthorized access" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error('deleteProfile error:', error);
    return res.status(500).json({ message: "Server error" });
  }
};






exports.logout = async (req, res) => {
  try {
    // If using JWT — just tell frontend to delete token
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};





// exports.updateProfile = async (req, res) => {
//   try {
//     const profileId = req.params.id;
//         const image = req.file ? req.file.filename : null; // ✅ save only filename

//     const userId = req.user.id; // logged-in user ID
//     const { user, _id, ...updateData  } = req.body;
    


//     const updatedProfile = await Profile.findOneAndUpdate(
//       { _id: profileId, user: userId },
//       updateData,                  // only update allowed fields
//       { new: true, runValidators: true }
//     );
//     console.log(updatedProfile, " ")
//     if (!updatedProfile) {
//       return res.status(404).json({ message: "Profile not found or unauthorized" });
//     }

//     res.status(200).json({
//       success: true,
//       data: updatedProfile,
//       message: "Profile updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



exports.updateProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const userId = req.user.id; // logged-in user ID
    const { user, _id, ...updateData } = req.body;
    

    // ✅ अगर image आई है तो उसे updateData में डालो
    if (req.file) {
      updateData.image = req.file.filename; // सिर्फ filename store कर रहे हैं
    }

    // ✅ Update profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: profileId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ message: "Profile not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// controller/userController.js
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isLoggedIn: true });

    // signup count per month
    const signupStats = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json({ totalUsers, activeUsers, signupStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    // 2️⃣ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Save OTP to user document
    user.otp = otp;
    await user.save();

    // 4️⃣ Send OTP to user's email
    await sendEmail(
      email,
      "Your OTP Code",
      `Hello, your OTP for password reset is: ${otp}\n\nThis OTP is valid for 15 minutes.`
    );

    // 5️⃣ Generate JWT token (15 min)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // 6️⃣ Send response
    res.status(200).json({
      message: "OTP sent to email successfully",
      token,
    });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({
      message: "Server error while sending OTP",
      error: err.message,
    });
  }
};








exports.otpverify = async (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    // new verified token for reset password
    const verifiedToken = jwt.sign({ id: user._id, verified: true }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.json({ message: 'OTP verified successfully', token: verifiedToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};










exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: "Password is required" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check verified flag
    if (!decoded.verified) {
      return res.status(403).json({ message: "OTP not verified" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.isVerified = false; // reset flag
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






// // 🟢 Check In / Check Out API
// exports.checkInOut = async (req, res) => {
//   try {
//     const { userId, action } = req.body;

//     if (!userId || !action)
//       return res.status(400).json({ message: "Missing required fields" });

//     const today = new Date().toLocaleDateString("en-IN");
//     let attendance = await Attendance.findOne({ user: userId, date: today });

//     if (!attendance) {
//       attendance = new Attendance({
//         user: userId,
//         date: today,
//       });
//     }

//     if (action === "check_in") {
//       if (attendance.checkIn)
//         return res.status(400).json({ message: "Already checked in today" });

//       attendance.checkIn = new Date();
//       await attendance.save();
//       return res.status(200).json({ message: "✅ Checked in", checkIn: attendance.checkIn });
//     }

//     if (action === "check_out") {
//       if (!attendance.checkIn)
//         return res.status(400).json({ message: "Please check in first" });

//       if (attendance.checkOut)
//         return res.status(400).json({ message: "Already checked out today" });

//       attendance.checkOut = new Date();
//       await attendance.save();
//       return res.status(200).json({ message: "👋 Checked out", checkOut: attendance.checkOut });
//     }

//     res.status(400).json({ message: "Invalid action" });
//   } catch (error) {
//     console.error("Attendance Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };








exports.checkInOut = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { action } = req.body;
    if (!action) return res.status(400).json({ message: "Missing action" });

    const today = new Date().toLocaleDateString("en-CA");
    const currentTime = new Date().toLocaleTimeString("en-IN", { hour12: true });

    // ✅ Check if there is an "open" attendance record (CheckOutTime = null)
    let attendance;
    if (action === "check_in") {
      // Create new record if no open record exists
      attendance = new Attendance({
        user: user._id,
        User: user.name,
        date: today,
        Status: action,
        CheckInTime: currentTime,
        CheckOutTime: null
      });
      await attendance.save();
    } else if (action === "check_out") {
      // Find the last record without CheckOutTime
      attendance = await Attendance.findOne({ user: user._id, date: today, CheckOutTime: null }).sort({ _id: -1 });
      if (!attendance) {
        return res.status(400).json({ message: "No check-in found to check out" });
      }
      attendance.CheckOutTime = currentTime;
      attendance.Status = action;
      await attendance.save();
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    res.status(200).json({
      message: action === "check_in" ? "✅ Checked in successfully" : "👋 Checked out successfully",
      user: user.name,
      date: today,
      CheckInTime: attendance.CheckInTime,
      CheckOutTime: attendance.CheckOutTime
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};










