const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const { upload, uploadToCloudinary } = require("../middleware/multer"); // Import from multer middleware
const path = require("path");

const router = express.Router();

// Combined API to register customer, product, and job
router.post(
    "/registerAll",
    upload.single("product_image"), // Accepts a single file for the product image
    [
        // Customer validation
        body("firstName")
            .optional({ checkFalsy: true }) // Optional if customerID is provided
            .notEmpty().withMessage("First name is mandatory")
            .isLength({ max: 50 }).withMessage("First name should not exceed 50 characters"),
        body("lastName")
            .optional({ checkFalsy: true }) // Optional if customerID is provided
            .notEmpty().withMessage("Last name is mandatory")
            .isLength({ max: 50 }).withMessage("Last name should not exceed 50 characters"),
        body("email")
            .optional({ checkFalsy: true }) // Optional if customerID is provided
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format"),
        body("phone_number")
            .optional({ checkFalsy: true }) // Optional if customerID is provided
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phone_number) => {
                for (let phone of phone_number) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            }),

        // Product validation
        body("product_name")
            .optional({ checkFalsy: true }) // Optional if productID is provided
            .notEmpty().withMessage("Product name is required")
            .isLength({ max: 255 }).withMessage("Product name cannot exceed 255 characters"),
        body("model")
            .optional({ checkFalsy: true }) // Optional if productID is provided
            .notEmpty().withMessage("Model is required")
            .isLength({ max: 255 }).withMessage("Model cannot exceed 255 characters"),
        body("model_no")
            .optional({ checkFalsy: true }) // Optional if productID is provided
            .notEmpty().withMessage("Model number is required")
            .isLength({ max: 255 }).withMessage("Model number cannot exceed 255 characters"),

        // Job validation
        body("repairDescription")
            .notEmpty().withMessage("Repair description is required")
            .isLength({ max: 255 }).withMessage("Repair description cannot exceed 255 characters"),
        body("repairStatus")
            .notEmpty().withMessage("Repair status is required")
            .isIn(["Pending", "In Progress", "Completed"]).withMessage("Invalid repair status"),
        body("handoverDate")
            .notEmpty().withMessage("Handover date is required")
            .isISO8601().withMessage("Invalid date format (YYYY-MM-DD required)"),
        body("employeeID")
            .notEmpty().withMessage("Employee ID is required")
            .isInt().withMessage("Employee ID must be an integer")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const {
                firstName,
                lastName,
                email,
                phone_number,
                product_name,
                model,
                model_no,
                repairDescription,
                repairStatus,
                handoverDate,
                employeeID,
                customerID, // Provided if customer is found via search
                productID, // Provided if product is found via search
                product_image // This could be a Cloudinary URL sent directly from frontend
            } = req.body;
            
            console.log("Request body:", req.body);
            console.log("Request file:", req.file);
            console.log("Product image from body:", product_image);

            let finalCustomerID = customerID;
            let finalProductID = productID;
            
            // Handle product image (either from body as Cloudinary URL or upload the file)
            let imageUrl = product_image;
            
            // If there's a file uploaded but no image URL provided in the body
            if (req.file && !imageUrl) {
                try {
                    console.log("Uploading file to Cloudinary:", req.file.path);
                    const result = await uploadToCloudinary(req.file.path, "products");
                    imageUrl = result.secure_url;
                    console.log("Cloudinary upload successful, URL:", imageUrl);
                } catch (cloudinaryError) {
                    console.error("Cloudinary upload failed:", cloudinaryError);
                    imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
                }
            }
            
            console.log("Final image URL to be saved:", imageUrl);

            // Register Customer if not provided
            if (!customerID) {
                const [customerResult] = await connection.query(
                    "INSERT INTO customers (firstName, lastName, email) VALUES (?, ?, ?)",
                    [firstName, lastName, email]
                );
                finalCustomerID = customerResult.insertId;

                // Insert customer phone numbers
                if (phone_number && phone_number.length > 0) {
                    const phoneValues = phone_number.map((phone) => [
                        finalCustomerID,
                        phone,
                    ]);
                    await connection.query(
                        "INSERT INTO telephones (customer_id, phone_number) VALUES ?",
                        [phoneValues]
                    );
                }
            }

            // Register Product if not provided
            if (!productID) {
                const [productResult] = await connection.query(
                    "INSERT INTO products (product_name, model, model_number, product_image) VALUES (?, ?, ?, ?)",
                    [product_name, model, model_no, imageUrl] // Use the Cloudinary URL
                );
                finalProductID = productResult.insertId;
                console.log("Product inserted with image URL:", imageUrl);
            }

            // Register Job
            const [jobResult] = await connection.query(
                "INSERT INTO jobs (repair_description, repair_status, warranty_eligible, handover_date, customer_id, assigned_employee, product_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    repairDescription,
                    repairStatus,
                    0,
                    handoverDate,
                    finalCustomerID,
                    employeeID,
                    finalProductID,
                ]
            );

            // Commit the transaction
            await connection.commit();

            res.status(201).json({
                message: "Customer, Product, and Job registered successfully!",
                customerID: finalCustomerID,
                productID: finalProductID,
                jobID: jobResult.insertId,
                productImage: imageUrl // Return the image URL in the response
            });
        } catch (error) {
            await connection.rollback();
            console.error("Transaction error:", error);
            res.status(500).json({ error: error.message });
        } finally {
            connection.release();
        }
    }
);

module.exports = router;