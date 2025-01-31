import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();  // Ensure environment variables are loaded

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        console.log(`Uploading file to Cloudinary: ${localFilePath}`);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto', // auto to automatically detect file type (image, video, etc.)
        });

        // console.log("File uploaded successfully to Cloudinary:",
        // response.url);
        fs.unlinkSync(localFilePath)
        return response;  // Return the upload response object

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);

        // Remove the local file in case of error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);  // Clean up the uploaded file if it fails
        }
        return null;
    }
}

export { uploadOnCloudinary };
