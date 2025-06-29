const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
const cloudinary = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");

// Configure Multer for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads"); // Temporary local storage
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    try {
        console.log("Uploading file to Cloudinary:", filePath); // Log the file path
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
        });
        console.log("Cloudinary Upload Result:", result); // Log the upload result
        fs.unlinkSync(filePath); // Delete the local file after uploading
        return result;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message); // Log the error
        throw new Error("Cloudinary upload failed: " + error.message);
    }
};

module.exports = { upload, uploadToCloudinary };