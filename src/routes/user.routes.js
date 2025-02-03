import { Router } from "express";
import multer from "multer";
import { 
    loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "public/temp"); // Make sure this folder exists
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
   },
});

// ✅ Create Multer Upload Instance
const upload = multer({ storage });

// ✅ Apply Multer middleware correctly for avatar and coverImage fields
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// ✅ Secured route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("/coverImage"), updateUsercoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router;
