const express = require('express');
const router = express.Router();






const {
  signup,
  login,
  verifyOtp,
  getUsers,
  Profile,
  getUserById,
  deleteProfile,
  updateProfile,
  getUserStats,
  forgotPassword,
  otpverify,
  resetPassword,
  checkInOut,
  myattendance,
  leaveRequest,
  getMyAttendanceDetails,
  getTotalUsers,
  getActiveUsers,
  getLeaveRequests,
  createLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getRejectedLeaves,
  getApprovedLeaves,
  getLeaves,
  logout,
  searchUserByEmail,
  getAttendanceSummary,
breakAction,
  // ⭐ Added
  MyAttendanceSummary,
  // mysummary,
  getScreenTimeSummary,
  getScreenTimeadmin,

} = require("../controllers/authController");

const { verifyToken } = require("../middleware/auth");
const { upload } = require("../middleware/multer");

// ---------------------- AUTH ROUTES ---------------------- //

router.post("/signup", upload.single("image"), signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);

router.post("/forgot-password", forgotPassword);
router.post("/OTP-verify", otpverify);
router.post("/reset-password", resetPassword);

router.post("/logout", verifyToken, logout);

// ---------------------- PROFILE ROUTES ---------------------- //

router.post("/profile", verifyToken, upload.single("image"), Profile);

router.get("/get-Profile", verifyToken, getUserById);
router.put("/edit-profile/:id", verifyToken, upload.single("image"), updateProfile);
router.delete("/delete-Profile/:profileId", verifyToken, deleteProfile);

// ---------------------- USER ROUTES ---------------------- //

router.get("/users", getUsers);
router.get("/getUserStats", verifyToken, getUserStats);

router.get("/total-users", verifyToken, getTotalUsers);
router.get("/active-users", verifyToken, getActiveUsers);

router.get("/search-user", verifyToken, searchUserByEmail);

// ---------------------- ATTENDANCE ROUTES ---------------------- //

router.post("/check-in-out", checkInOut);
router.get("/my-attendance", verifyToken, myattendance);

router.get("/myattendance-details", verifyToken, getMyAttendanceDetails);  // evrry dat record
router.get("/getAttendanceSummary", verifyToken, getAttendanceSummary);  // admin see every user dealy attandemce
router.get("/my-AttendanceSummary", verifyToken, MyAttendanceSummary);    // monthaly record


// ---------------------- LEAVE ROUTES ---------------------- //

router.post("/leave", verifyToken, leaveRequest);   



   

router.get("/my-leaves", verifyToken, getMyLeaves);
router.get("/getLeaveRequests", verifyToken, getLeaveRequests);

router.put("/leave-approve", verifyToken, approveLeave);
router.put("/leave-reject", verifyToken, rejectLeave);

router.get("/rejected-leaves", verifyToken, getRejectedLeaves);
router.get("/approved-leaves", verifyToken, getApprovedLeaves);

router.post("/create-leave", verifyToken, createLeave);
router.put("/edit-leave/:id", verifyToken, updateLeave);
router.delete("/delete-leave/:id", verifyToken, deleteLeave);
router.get("/leaves", verifyToken, getLeaves);

// ---------------------- SCREEN TIME ROUTES ---------------------- //
router.post("/break-action", verifyToken, breakAction);
router.get("/screenTime-summary", verifyToken, getScreenTimeSummary);
router.get("/screenTime-admin", verifyToken, getScreenTimeadmin);
// router.get("/mu-summary", verifyToken, mysummary);



module.exports = router;        





























                                  






