import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure temp folder exists
const tempDir = "public/temp/";
if (!fs.existsSync(tempDir)) {
   fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, tempDir); // Store files in "public/temp/"
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
   },
});

// Only allow images
const fileFilter = (req, file, cb) => {
   if (file.mimetype.startsWith("image/")) {
      cb(null, true);
   } else {
      cb(new Error("Only image files are allowed!"), false);
   }
};

// Configure Multer
export const upload = multer({
   storage,
   fileFilter,
   limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
});
