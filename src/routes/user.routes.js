import express from "express";
import multer from "multer";
import { registerUser } from "../controllers/user.controller.js";

const router = express.Router();

// Configure Multer for fields (avatar & coverImage)

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "public/temp"); // Make sure this folder exists.
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
   },
});

const upload = multer({ storage });

// Apply Multer middleware correctly for avatar and coverImage fields

router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

export default router;
