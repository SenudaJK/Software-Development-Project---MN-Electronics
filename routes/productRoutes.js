const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const { upload, uploadToCloudinary } = require("../middleware/multer"); // Use the existing multer configuration

const router = express.Router();

// Add a Product
router.post(
    "/add",
    upload.single("product_image"), // Use the imported 'upload' instance
    [
        body("product_name")
            .notEmpty().withMessage("Product name is mandatory")
            .isLength({ max: 100 }).withMessage("Product name should not exceed 100 characters"),
        body("model")
            .notEmpty().withMessage("Model is mandatory")
            .isLength({ max: 50 }).withMessage("Model should not exceed 50 characters"),
        body("model_number")
            .notEmpty().withMessage("Model number is mandatory")
            .isLength({ max: 50 }).withMessage("Model number should not exceed 50 characters")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { product_name, model, model_number, product_image } = req.body;
            // let product_image = null;

            if (req.file) {
                console.log("File Path:", req.file.path); // Log the file path
                const result = await uploadToCloudinary(req.file.path, "products");
                console.log("Cloudinary Upload Result:", result); // Log the Cloudinary response
                product_image = result.secure_url; // Use the Cloudinary URL
                console.log("Product Image URL:", product_image); // Log the URL being saved
            }

            const [result] = await db.query(
                "INSERT INTO products (product_name, model, model_number, product_image) VALUES (?, ?, ?, ?)",
                [product_name, model, model_number, product_image]
            );
            console.log("Database Query Parameters:", {
                product_name,
                model,
                model_number,
                product_image,
            });

            res.status(201).json({ message: "Product added successfully!", product_id: result.insertId });
        } catch (error) {
            console.error("Error adding product:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

// Get All Products
router.get("/get", async (req, res) => {
    try {
        const [products] = await db.query("SELECT * FROM products");
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search Products with combined criteria
router.get("/", async (req, res) => {
    const { search, product_name, model } = req.query;

    try {
        // If specific product_name and model are provided, search with AND condition
        if (product_name && model) {
            const query = `
                SELECT product_id, product_name, model, model_number, product_image
                FROM products
                WHERE LOWER(product_name) LIKE LOWER(?) AND LOWER(model) LIKE LOWER(?)
            `;
            const [results] = await db.query(query, [`%${product_name}%`, `%${model}%`]);
            return res.status(200).json(results);
        }
        
        // If only product_name is provided
        else if (product_name && !model) {
            const query = `
                SELECT product_id, product_name, model, model_number, product_image
                FROM products
                WHERE LOWER(product_name) LIKE LOWER(?)
            `;
            const [results] = await db.query(query, [`%${product_name}%`]);
            return res.status(200).json(results);
        }
        
        // If only model is provided
        else if (!product_name && model) {
            const query = `
                SELECT product_id, product_name, model, model_number, product_image
                FROM products
                WHERE LOWER(model) LIKE LOWER(?)
            `;
            const [results] = await db.query(query, [`%${model}%`]);
            return res.status(200).json(results);
        }
        
        // Traditional search using general search term
        else if (search) {
            const query = `
                SELECT product_id, product_name, model, model_number, product_image
                FROM products
                WHERE LOWER(product_name) LIKE LOWER(?) 
                   OR LOWER(model) LIKE LOWER(?) 
                   OR LOWER(model_number) LIKE LOWER(?)
            `;
            const searchTerm = `%${search}%`;
            const [results] = await db.query(query, [searchTerm, searchTerm, searchTerm]);
            return res.status(200).json(results);
        }
        
        // No search parameters provided
        else {
            return res.status(400).json({ message: "Search query is required" });
        }
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get Products by Customer ID
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Validate customerId
    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }
    
    // Query to get distinct products that a customer has used in past jobs
    const [products] = await db.query(`
      SELECT DISTINCT 
        p.product_id, 
        p.product_name, 
        p.model, 
        p.model_number, 
        p.product_image,
        MAX(j.job_id) as latest_job_id
      FROM products p
      JOIN jobs j ON p.product_id = j.product_id
      WHERE j.customer_id = ?
      GROUP BY p.product_id, p.product_name, p.model, p.model_number, p.product_image
      ORDER BY latest_job_id DESC
    `, [customerId]);
    
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching customer products:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;