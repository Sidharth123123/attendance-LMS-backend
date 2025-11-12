// const express = require('express');
// const router = express.Router();
// const { signup, login, verifyOtp,getUsers ,Profile,getUserById,deleteProfile,updateProfile,logout} = require('../controllers/authController');
// const { verifyToken } = require('../middleware/auth');
// const {upload} = require('../middleware/multer')
// const { logout } = require("../controllers/authController");

// // const { updateProfile } = require('../controllers/profileController');
// // router.post('/signup', signup);
// router.post('/signup', upload.single('image'), signup);

// router.post('/login', login);
// router.post('/verify-otp', verifyOtp);
// router.post('/Profile',verifyToken,  upload.single('image'), Profile)
// router.post("/logout", verifyToken, logout);


// router.get('/users', getUsers);
// router.get('/get-Profile', verifyToken,getUserById);
// // router.get('/image',verifyToken, image)

// // // backend route example
// router.delete('/delete-Profile/:profileId', verifyToken, deleteProfile);
// router.put("/edit-profile/:id", verifyToken, updateProfile);





// module.exports = router;












































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
   logout, // ✅ only one import
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/multer');




// ✅ routes
router.post('/signup', upload.single('image'), signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/profile', verifyToken, upload.single('image'), Profile);
router.post('/logout', verifyToken, logout); // ✅ FIXED
router.post("/forgot-password", forgotPassword); // ✅ just pass the function
router.post("/OTP-verify", otpverify); // ✅ must be a function reference
router.post("/reset-password", resetPassword);
router.post("/check-in-out", checkInOut);



router.get('/users', getUsers);
router.get('/get-Profile', verifyToken, getUserById);
router.get('/getUserStats', verifyToken, getUserStats);
router.delete('/delete-Profile/:profileId', verifyToken, deleteProfile);
router.put('/edit-profile/:id', verifyToken,upload.single('image'), updateProfile);


module.exports = router;



