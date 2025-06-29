const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middleware/multer");

// API to upload an image
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        // Upload the file to Cloudinary
        const result = await uploadToCloudinary(req.file.path, "uploads");

        res.status(200).json({
            message: "Image uploaded successfully!",
            imageUrl: result.secure_url, // Cloudinary URL of the uploaded image
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;