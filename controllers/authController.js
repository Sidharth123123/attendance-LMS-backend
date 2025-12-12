const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');
const Attendance = require("../models/Attendance");
const Leave = require('../models/Leave');
const Empleave = require("../models/Empleave");
const BreakTime = require("../models/BreakTime");





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
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

    // Token with role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "OTP sent to email",
      token,
      role: user.role, // 👈 important
    });

  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};









exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.otp = null;
    user.isVerified = true;
    await user.save();

    // 🔥 Generate JWT for future requests
    const token = jwt.sign({ id: user._id }, "YOUR_SECRET_KEY", { expiresIn: "7d" });

    res.json({
      message: "OTP verified successfully",
      role: user.role,
      token, // send JWT to frontend
    });

  } catch (err) {
    res.status(500).json({
      message: "OTP verification failed",
      error: err.message,
    });
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

    let attendance = await Attendance.findOne({ user: user._id, date: today }).sort({ _id: -1 });

    // ---------------------------------------------------------
    // CHECK-IN
    // ---------------------------------------------------------
    if (action === "check_in") {
      // Make user active
      user.isActive = true;
      await user.save();

      if (attendance && !attendance.CheckOutTime) {
        attendance.CheckInTime = currentTime;
        await attendance.save();

        return res.status(200).json({
          message: "Already checked in. Time updated.",
          date: today,
          CheckInTime: attendance.CheckInTime,
          CheckOutTime: attendance.CheckOutTime || "-"
        });
      }

      attendance = new Attendance({
        user: user._id,
        userName: user.name,
        date: today,
        Status: "check_in",
        CheckInTime: currentTime,
        CheckOutTime: null
      });

      await attendance.save();

      return res.status(200).json({
        message: "Checked in successfully",
        date: today,
        CheckInTime: currentTime,
        CheckOutTime: "-"
      });
    }

    // ---------------------------------------------------------
    // CHECK-OUT
    // ---------------------------------------------------------
    if (action === "check_out") {

      if (!attendance || attendance.CheckOutTime) {
        return res.status(400).json({ message: "No active check-in found." });
      }

      attendance.CheckOutTime = currentTime;
      attendance.Status = "check_out";
await attendance.save();
      // Make user inactive
      user.isActive = false;
      await user.save();

      return res.status(200).json({
        message: "Checked out successfully",
        date: today,
        CheckInTime: attendance.CheckInTime,
        CheckOutTime: attendance.CheckOutTime
      });
    }

    return res.status(400).json({ message: "Invalid action" });

  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






// Format time
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}
// controllers/breakController.js

exports.breakAction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    const now = new Date();

    // ----------------------------
    // START BREAK
    // ----------------------------
    if (action === "start") {
      const running = await BreakTime.findOne({ user: userId, end: null });
      if (running) {
        return res.status(400).json({
          message: "Break already running!",
          runningBreak: running,
        });
      }

      const newBreak = new BreakTime({
        user: userId,
        start: now,
        date: now,
      });

      await newBreak.save();

      return res.json({
        message: "Break started",
        break: newBreak,
      });
    }

    // ----------------------------
    // STOP BREAK
    // ----------------------------
    if (action === "stop") {
const running = await BreakTime.findOne({ user: userId, end: null });
if (!running) return res.status(400).json({ message: "No active break found" });

running.end = now;
running.durationSec = Math.floor((now - running.start) / 1000);
running.durationFormatted = formatTime(running.durationSec);
await running.save();


      return res.json({ message: "Break stopped", break: running });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    console.error("Break action error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




















exports.getScreenTimeSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Today start & end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Use start time to filter sessions
    const sessions = await BreakTime.find({
      user: user._id,
      start: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ start: 1 });

    if (!sessions.length) {
      return res.json({
        message: "No break sessions today",
        todayTotalOff: "0h 0m 0s",
        totalOffSeconds: 0,
        sessions: []
      });
    }

    // Total off time
    let totalSec = 0;
    const formattedSessions = sessions.map(s => {
      totalSec += s.durationSec || 0;
      return {
        start: s.start,
        end: s.end,
        duration: s.durationFormatted
      };
    });

    const formatTime = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h}h ${m}m ${s}s`;
    };

    return res.json({
      message: "Today's Screen OFF Summary",
      user: {
        name: user.name,
        email: user.email
      },
      todayTotalOff: formatTime(totalSec),
      totalOffSeconds: totalSec,
      sessions: formattedSessions
    });

  } catch (error) {
    console.log("Summary Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};





















exports.getScreenTimeadmin = async (req, res) => {
  try {
    // Helper to format seconds to HH:MM:SS
    const formatTime = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${h}h ${m}m ${s}s`;
    };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get all users
    const users = await User.find({});

    // Build results for all users
    const results = [];

    for (const user of users) {
      const sessions = await BreakTime.find({
        user: user._id,
        start: { $gte: startOfDay, $lte: endOfDay }
      }).sort({ start: 1 });

      let totalSec = 0;

      const formattedSessions = sessions.map(s => {
        let durationSec = s.durationSec || 0;

        // For ongoing session, calculate live duration
        if (!s.end) {
          durationSec = Math.floor((new Date() - new Date(s.start)) / 1000);
        }

        totalSec += durationSec;

        return {
          start: s.start,
          end: s.end,
          durationFormatted: formatTime(durationSec)
        };
      });

      results.push({
        user: {
          name: user.name,
          email: user.email
        },
        todayTotalOff: formatTime(totalSec),
        totalOffSeconds: totalSec,
        sessions: formattedSessions
      });
    }

    return res.json({
      message: "Today's Screen OFF Summary for all users",
      data: results
    });

  } catch (error) {
    console.error("Summary Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};























exports.leaveRequest = async (req, res) => {
  try {
    // Correct destructuring from frontend body
    const { startDate, endDate, reason, leavetype } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const leave = new Leave({
      user: req.user.id,
      startDate,
      endDate,
      reason,
      leavetype,  
    });

    await leave.save();

    res.status(201).json({
      message: "✅ Leave request submitted",
      data: leave
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to apply leave",
      error: err.message
    });
  }
};







// APPROVE LEAVE



exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id, action } = req.body;

    if (!id || !action) {
      return res.status(400).json({ message: "ID and action required" });
    }

    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Action must be approved or rejected" });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status: action },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.status(200).json({
      message: `Leave ${action} successfully`,
      leave: updatedLeave,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};






exports.myattendance = async (req, res) => {
  try {
    console.log("➡️ My Attendance API Hit");
    const userId = req.user.id;
    console.log("User ID:", userId);

    const records = await Attendance.find(
      { user: userId },
      {
        date: 1,
        CheckInTime: 1,
        CheckOutTime: 1,
        Status: 1,
        _id: 0,
        user: 1, // populate ke liye
      }
    ).populate({
      path: "user",
      select: "name email -_id",
    });

    // Format records for frontend
    const formattedRecords = records.map(r => ({
      date: r.date,
      checkInTime: r.CheckInTime || "-",
      checkOutTime: r.CheckOutTime || "-",
      status: r.CheckInTime ? "Present" : "Absent",
      user: r.user || {},
    }));

    console.log("Attendance Records:", formattedRecords);

    res.status(200).json({
      success: true,
      data: formattedRecords,
    });
  } catch (error) {
    console.log("❌ Error:", error);
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};




























exports.getTotalUsers = async (req, res) => {
  try {
    console.log("➡️ Total Users API Hit");

    // Fetch all users with name and email
    const users = await User.find({}, { name: 1, email: 1, number:1, role: 1, _id: 0, });
    console.log(users,"----------------------->")

    console.log("Total Users:", users.length);

    res.status(200).json({
      totalUsers: users.length,
      users, // array of user objects with name & email
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      message: "Failed to fetch total users",
      error: error.message,
    });
  }
};

exports.searchUserByEmail = async (req, res) => {
  try {
    console.log("➡️ Search User API Hit");

    // Get email from query params
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query parameter is required" });
    }

    // Search user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp(email, "i") } }, { name: 1, email: 1, number: 1, role: 1, _id: 0 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      message: "Failed to search user",
      error: error.message,
    });
  }
};





















exports.getMyAttendanceDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await Attendance.find({ user: userId })
      .select("date CheckInTime CheckOutTime")
      .sort({ date: -1 });

    if (!records.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    // Helper function → convert "11:05:01 am" into 24 hour format "11:05:01"
    const convertTo24Hour = (timeString) => {
      if (!timeString) return null;

      const [time, modifier] = timeString.split(" ");
      let [hours, minutes, seconds] = time.split(":");

      hours = parseInt(hours);

      if (modifier.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
      } else if (modifier.toLowerCase() === "am" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
    };

    const formattedRecords = records.map((rec) => {
      let workingHours = "00:00:00";

      if (rec.CheckInTime && rec.CheckOutTime) {
        const checkIn24 = convertTo24Hour(rec.CheckInTime);
        const checkOut24 = convertTo24Hour(rec.CheckOutTime);

        const checkIn = new Date(`2000-01-01T${checkIn24}`);
        const checkOut = new Date(`2000-01-01T${checkOut24}`);

        let diffMs = checkOut - checkIn;

        if (diffMs < 0) diffMs = 0;

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        workingHours = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }

      return {
        date: rec.date,
        checkInTime: rec.CheckInTime,
        checkOutTime: rec.CheckOutTime,
        status: rec.CheckInTime ? "Present" : "Absent",
        workingHours,
      };
    });

    res.status(200).json({
      message: "Attendance detail records fetched successfully",
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Attendance Detail API Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

















// =====================
// Get Active Users
// =====================

exports.getActiveUsers = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

    // Find attendance records where user has checked in but not checked out today
    const activeAttendances = await Attendance.find({
      date: today,
      CheckInTime: { $ne: null },
      CheckOutTime: null
    }).populate("user", "name email");

    // Map the user details
    const users = activeAttendances.map(a => ({
      id: a.user._id,
      name: a.user.name,
      email: a.user.email,
      checkInTime: a.CheckInTime
    }));

    res.status(200).json({
      totalActive: users.length,
      users
    });
  
  } catch (error) {
    console.error("Active Users Error:", error);
    res.status(500).json({ message: "Failed to fetch active users", error: error.message });
  }
};








// Get all leave requests (role check removed)
exports.getLeaveRequests = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // Fetch all leave requests from DB
    const leaves = await Leave.find()
      .populate("user", "name email") // fetch user name and email
      .sort({ startDate: -1 });       // latest first

    // Map data to simple format
    const simplifiedLeaves = leaves.map(l => ({
        _id: l._id, 
      name: l.user.name,
      email: l.user.email,
      startDate: l.startDate,
      endDate: l.endDate,
      leavetype: l.leavetype,
      reason: l.reason,
      status: l.status,
    }));

    // Send response
    res.status(200).json({
      message: "✅ All leave requests fetched successfully",
      totalLeaves: simplifiedLeaves.length,
      leaves: simplifiedLeaves,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leave requests", error: err.message });
  }
};


exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaves,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// GET /api/auth/attendance-summary

exports.getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA");

    const users = await User.find({}, { name: 1, email: 1 });
    const summary = [];

    for (let user of users) {
      const attendances = await Attendance.find({ user: user._id, date: today }).sort({ CheckInTime: 1 });

      if (attendances.length > 0) {
        const firstCheckIn = attendances[0].CheckInTime;
        const lastCheckOut = attendances.filter(a => a.CheckOutTime).length > 0
                              ? attendances.filter(a => a.CheckOutTime).slice(-1)[0].CheckOutTime
                              : null;

        // HH:MM:SS AM/PM parser
     // HH:MM:SS am/pm parser
const parseTime = (timeStr) => {
  if (!timeStr) return null;

  // Ensure proper format with space
  let str = timeStr.trim();
  if (!str.includes(" ")) {
    str = str.slice(0, -2) + " " + str.slice(-2); // 10:37:01am -> 10:37:01 am
  }

  const [time, modifier] = str.split(" ");
  let [hours, minutes, seconds] = time.split(":").map(Number);
  if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
  return { hours, minutes, seconds };
};

// Working hours calculate
let totalWorkingHours = "-";
if (firstCheckIn && lastCheckOut) {
  const start = parseTime(firstCheckIn);
  const end = parseTime(lastCheckOut);
  if (start && end) {
    const startDate = new Date(1970, 0, 1, start.hours, start.minutes, start.seconds);
    const endDate = new Date(1970, 0, 1, end.hours, end.minutes, end.seconds);

    let diffMs = endDate - startDate;
    if (diffMs < 0) diffMs += 24*60*60*1000; // midnight cross

    const hours = Math.floor(diffMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    totalWorkingHours = `${hours}h ${minutes}m ${seconds}s`;
  }
}



        summary.push({
          userName: user.name,
          email: user.email,
          date: today,
          firstCheckIn,
          lastCheckOut: lastCheckOut || "-",
          status: "Present",
          totalWorkingHours
        });

      } else {
        summary.push({
          userName: user.name,
          email: user.email,
          date: today,
          firstCheckIn: "-",
          lastCheckOut: "-",
          status: "Absent",
          totalWorkingHours: "-"
        });
      }
    }

    return res.status(200).json(summary);

  } catch (error) {
    console.error("Attendance Summary Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};





exports.MyAttendanceSummary = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get all attendance records of this user
    const attendances = await Attendance.find({ user: user._id }).sort({ date: 1 });

    // Get all dates between first and last attendance
    const dates = [];
    if (attendances.length > 0) {
      const startDate = new Date(attendances[0].date);
      const endDate = new Date(attendances[attendances.length - 1].date);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split("T")[0]); // YYYY-MM-DD
      }
    }

    // Helper to parse time
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      let str = timeStr.trim();
      if (!str.includes(" ")) str = str.slice(0, -2) + " " + str.slice(-2); // 10:37:01am -> 10:37:01 am
      const [time, modifier] = str.split(" ");
      let [hours, minutes, seconds] = time.split(":").map(Number);
      if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
      return { hours, minutes, seconds };
    };

    const summary = dates.map((dateStr) => {
      const dayRecords = attendances.filter((a) => a.date === dateStr);

      let status = "Absent";
      let firstCheckIn = "-";
      let lastCheckOut = "-";
      let workingHours = "0h 0m 0s";

      if (dayRecords.length > 0) {
        status = "Present";

        const checkIns = dayRecords.map((r) => r.CheckInTime).filter(Boolean).sort();
        const checkOuts = dayRecords.map((r) => r.CheckOutTime).filter(Boolean).sort();

        firstCheckIn = checkIns[0] || "-";
        lastCheckOut = checkOuts[checkOuts.length - 1] || "-";

        // Calculate working hours
        let totalHours = 0;
        dayRecords.forEach((r) => {
          if (r.CheckInTime && r.CheckOutTime) {
            const start = parseTime(r.CheckInTime);
            const end = parseTime(r.CheckOutTime);
            if (start && end) {
              const startDate = new Date(1970, 0, 1, start.hours, start.minutes, start.seconds);
              const endDate = new Date(1970, 0, 1, end.hours, end.minutes, end.seconds);
              let diffMs = endDate - startDate;
              if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // midnight cross
              totalHours += diffMs;
            }
          }
        });

        const hours = Math.floor(totalHours / 1000 / 60 / 60);
        const minutes = Math.floor((totalHours / 1000 / 60) % 60);
        const seconds = Math.floor((totalHours / 1000) % 60);
        workingHours = `${hours}h ${minutes}m ${seconds}s`;
      }

      return {
        date: dateStr,
        status,
        firstCheckIn,
        lastCheckOut,
        workingHours,
      };
    });

    return res.status(200).json({
      username: user.name,
      email: user.email,
      totalDays: summary.length,
      summary,
    });
  } catch (error) {
    console.error("Get My Daily Attendance Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};







// ✅ CREATE LEAVE
exports.createLeave = async (req, res) => {
  try {
    const user = await User.findOne(); // testing only, replace with req.user later
    if (!user) return res.status(400).json({ message: "No user found" });

    const leave = new Empleave({
      user: user._id,  
      PaidLeave: req.body.PaidLeave || 0,
      SickLeave: req.body.SickLeave || 0,
      UnpaidLeave: req.body.UnpaidLeave || 0,
      FestivalLeave: req.body.FestivalLeave || 0,
    });

    const savedLeave = await leave.save();
    res.status(201).json(savedLeave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};





exports.updateLeave = async (req, res) => {
  try {
    const leaveId = req.params.id; // leave _id from URL
    const updates = req.body;

    // Find leave by ID
    const leave = await Empleave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Optional: if only the owner or admin can update
    if (req.user.role !== "admin" && leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this leave" });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      leave[key] = updates[key];
    });

    const updatedLeave = await leave.save();

    res.status(200).json({
      success: true,
      message: "Leave updated successfully",
      data: updatedLeave,
    });
  } catch (err) {
    console.error("updateLeave error:", err);
    res.status(500).json({ message: err.message });
  }
};





exports.deleteLeave = async (req, res) => {
  try {
    const leaveId = req.params.id; // leave _id from URL

    // Find leave by ID
    const leave = await Empleave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave record not found" });
    }

    // Optional: only admin or leave owner can delete
    if (req.user.role !== "admin" && leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this leave" });
    }

    // Delete the leave
    await leave.deleteOne();

    res.status(200).json({
      success: true,
      message: "Leave deleted successfully",
    });
  } catch (err) {
    console.error("deleteLeave error:", err);
    res.status(500).json({ message: err.message });
  }
};




exports.getLeaves = async (req, res) => {
  try {
    const user = await User.findOne(); // testing same as createLeave
    if (!user) return res.status(400).json({ message: "No user found" });

    const leaves = await Empleave.find({ user: user._id })
      .select("PaidLeave SickLeave UnpaidLeave FestivalLeave createdAt");

    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
















exports.approveLeave = async (req, res) => {
  try {
    console.log("BODY => ", req.body);

    const id = req.body.id;

    const leave = await Leave.findById(id);  // <-- FIXED
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = "Approved";
    await leave.save();

    res.status(200).json({
      message: "Leave approved successfully",
      leave
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.rejectLeave = async (req, res) => {
  try {
    const { id, reason } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Leave ID is required" });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const leave = await Leave.findById(id).populate("user", "name email");
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = "Rejected";
    leave.rejectionReason = reason;
    leave.admin = req.user._id;

    const updatedLeave = await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave rejected for ${leave.user.name} (${leave.user.email})`,
      data: updatedLeave
    });
  } catch (err) {
    console.error("rejectLeave error:", err);
    res.status(500).json({ message: err.message });
  }
};






















exports.getApprovedLeaves = async (req, res) => {
  try {
    const approvedLeaves = await Leave.find({ status: "Approved" })
      .populate("user", "name email")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: approvedLeaves.length,
      data: approvedLeaves
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getRejectedLeaves = async (req, res) => {
  try {
    const rejectedLeaves = await Leave.find(
      { status: "Rejected" },
      {
        rejectionReason: 1,   // <-- Add this
        startDate: 1,
        endDate: 1,
        leavetype: 1,
        reason: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        user: 1
      }
    )
      .populate("user", "name email")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: rejectedLeaves.length,
      data: rejectedLeaves
    });
   } catch (err) {
    res.status(500).json({ message: err.message });
  }
};









