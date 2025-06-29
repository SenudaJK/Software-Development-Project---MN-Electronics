const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Register Customer with Multiple Telephone Numbers
router.post(
    "/sign-up",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters"),
        body("username")
            .notEmpty().withMessage("Username is mandatory")
            .isLength({ max: 50 }).withMessage("Username should not exceed 50 characters"),
        body("password")
            .notEmpty().withMessage("Password is mandatory")
            .isLength({ min: 8 }).withMessage("Password should be at least 8 characters long")
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage("Password must contain at least one uppercase letter, one number, and one symbol"),
        body("phoneNumbers")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { firstName, lastName, email, username, password, phoneNumbers } = req.body;

            // Check if email or username exists
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE email = ? OR username = ?",
                [email, username]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email or Username already exists" });

            for (let phone of phoneNumbers) {
                const [existingPhone] = await db.query(
                    "SELECT * FROM telephones WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message: `Phone number ${phone} already exists` });
                }
            }



            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new customer
            const [result] = await db.query(
                "INSERT INTO customers (firstName, lastName, email, username, password) VALUES (?, ?, ?, ?, ?)",
                [firstName, lastName, email, username, hashedPassword]
            );

            const customerId = result.insertId;

            // Insert multiple phone numbers
            if (phoneNumbers && phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [customerId, phone]);
                await db.query("INSERT INTO telephones (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(201).json({ message: "Customer registered successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Register Customer with Multiple Telephone Numbers (Shop Perspective)
router.post(
    "/register",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters"),
        body("phoneNumbers")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { firstName, lastName, email, phoneNumbers } = req.body;

            // Check if email exists
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE email = ?",
                [email]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

            for (let phone of phoneNumbers) {
                const [existingPhone] = await db.query(
                    "SELECT * FROM telephones WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message: `Phone number ${phone} already exists` });
                }
            }

            // Insert new customer without username and password
            const [result] = await db.query(
                "INSERT INTO customers (firstName, lastName, email) VALUES (?, ?, ?)",
                [firstName, lastName, email]
            );

            const customerId = result.insertId;

            // Insert multiple phone numbers
            if (phoneNumbers && phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [customerId, phone]);
                await db.query("INSERT INTO telephones (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(201).json({ message: "Customer registered successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Update Customer
router.put(
    "/:id",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters"),
        body("username")
            .notEmpty().withMessage("Username is mandatory")
            .isLength({ max: 50 }).withMessage("Username should not exceed 50 characters"),
        body("password")
            .optional()
            .isLength({ min: 8 }).withMessage("Password should be at least 8 characters long"),
        body("phoneNumbers")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { firstName, lastName, email, username, password, phoneNumbers } = req.body;

            // Check if email or username exists for other customers
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE (email = ? OR username = ?) AND id != ?",
                [email, username, id]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email or Username already exists" });

            // Hash password if provided
            let hashedPassword;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            // Update customer
            await db.query(
                "UPDATE customers SET firstName = ?, lastName = ?, email = ?, username = ?, password = ? WHERE id = ?",
                [firstName, lastName, email, username, hashedPassword || password, id]
            );

            // Update multiple phone numbers
            await db.query("DELETE FROM telephones WHERE customer_id = ?", [id]);
            if (phoneNumbers && phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [id, phone]);
                await db.query("INSERT INTO telephones (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(200).json({ message: "Customer updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Update Customer Without Username and Password
router.put(
    "/update/:id",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters"),
        body("phoneNumbers")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { firstName, lastName, email, phoneNumbers } = req.body;

            // Check if email exists for other customers
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE email = ? AND id != ?",
                [email, id]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

            // Update customer details
            await db.query(
                "UPDATE customers SET firstName = ?, lastName = ?, email = ? WHERE id = ?",
                [firstName, lastName, email, id]
            );

            // Update phone numbers
            await db.query("DELETE FROM telephones WHERE customer_id = ?", [id]);
            if (phoneNumbers && phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [id, phone]);
                await db.query("INSERT INTO telephones (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(200).json({ message: "Customer updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete Customer
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`Deleting customer with id: ${id}`); // Log the id
    try {
        const deleteCustomerResult = await db.query("DELETE FROM customers WHERE id = ?", [id]);
        console.log(`Delete customer result: ${JSON.stringify(deleteCustomerResult)}`); // Log the result of the delete query

        const deleteTelephonesResult = await db.query("DELETE FROM telephones WHERE customer_id = ?", [id]);
        console.log(`Delete telephones result: ${JSON.stringify(deleteTelephonesResult)}`); // Log the result of the delete query

        res.status(200).json({ message: "Customer deleted successfully!" });
    } catch (error) {
        console.error(`Error deleting customer: ${error.message}`); // Log the error
        res.status(500).json({ error: error.message });
    }
});

// Login Customer with JWT token
router.post(
    "/login",
    [
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format"),
        body("password")
            .notEmpty().withMessage("Password is mandatory")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            // Check if email exists
            const [users] = await db.query(`
                SELECT c.*, GROUP_CONCAT(t.phone_number) AS phoneNumbers 
                FROM customers c
                LEFT JOIN telephones t ON c.id = t.customer_id
                WHERE c.email = ?
                GROUP BY c.id
            `, [email]);
            
            if (users.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            
            const user = users[0];

            // If user doesn't have a password (registered by shop but no account yet)
            if (!user.password) {
                return res.status(401).json({ 
                    message: "Account setup required",
                    needsSetup: true,
                    email: user.email
                });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Create JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            // Format phone numbers
            const phoneNumbers = user.phoneNumbers ? user.phoneNumbers.split(',') : [];
            
            // Prepare user data, removing sensitive information
            const userData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                phoneNumbers
            };

            res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: userData
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ 
                success: false,
                message: "An error occurred during login",
                error: error.message 
            });
        }
    }
);

// Get All Customers
router.get("/all", async (req, res) => {
    try {
        const [customers] = await db.query(`
            SELECT c.id, c.firstName, c.lastName, c.email, GROUP_CONCAT(t.phone_number) AS phoneNumbers
            FROM customers c
                     LEFT JOIN telephones t ON c.id = t.customer_id
            GROUP BY c.id, c.firstName, c.lastName, c.email
        `);
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Specific Customer by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [customer] = await db.query(`
            SELECT c.id, c.firstName, c.lastName, c.email, GROUP_CONCAT(t.phone_number) AS phoneNumbers
            FROM customers c
            LEFT JOIN telephones t ON c.id = t.customer_id
            WHERE c.id = ?
            GROUP BY c.id, c.firstName, c.lastName, c.email
        `, [id]);
        if (customer.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(customer[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Account for Existing Customer
router.post(
    "/create-account",
    [
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format"),
        body("username")
            .notEmpty().withMessage("Username is mandatory")
            .isLength({ max: 50 }).withMessage("Username should not exceed 50 characters"),
        body("password")
            .notEmpty().withMessage("Password is mandatory")
            .isLength({ min: 8 }).withMessage("Password should be at least 8 characters long")
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage("Password must contain at least one uppercase letter, one number, and one symbol")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, username, password } = req.body;

            // Check if email exists
            const [customer] = await db.query(
                "SELECT * FROM customers WHERE email = ?",
                [email]
            );
            if (customer.length === 0) return res.status(404).json({ message: "Customer not found" });

            // Check if username already exists
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE username = ?",
                [username]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Username already exists" });

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update customer with username and password
            await db.query(
                "UPDATE customers SET username = ?, password = ? WHERE email = ?",
                [username, hashedPassword, email]
            );

            res.status(200).json({ message: "Account created successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Search Customers
router.get("/", async (req, res) => {
    const { search } = req.query;

    // Check if the search query is provided
    if (!search || search.trim() === "") {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        const query = `
    SELECT c.id, c.firstName, c.lastName, c.email, t.phone_number
    FROM customers c
    LEFT JOIN telephones t ON c.id = t.customer_id
    WHERE LOWER(c.firstName) LIKE LOWER(?) OR LOWER(c.lastName) LIKE LOWER(?) OR LOWER(c.email) LIKE LOWER(?) OR t.phone_number LIKE ?
`;
        const searchTerm = `%${search}%`;
        const [results] = await db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm]);

        // Check if results are empty
        if (results.length === 0) {
            return res.status(404).json({ message: "No customers found matching the search query" });
        }

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Check if customer exists in the system
router.post('/verify-existence', async (req, res) => {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number required' });
    }
    
    try {
      // Build query based on provided parameters
      let query = 'SELECT * FROM customers WHERE ';
      let params = [];
      
      if (email && phoneNumber) {
        query += 'email = ? AND id IN (SELECT customer_id FROM telephones WHERE phone_number = ?)';
        params = [email, phoneNumber];
      } else if (email) {
        query += 'email = ?';
        params = [email];
      } else {
        query += 'id IN (SELECT customer_id FROM telephones WHERE phone_number = ?)';
        params = [phoneNumber];
      }
      
      const [customers] = await db.query(query, params);
      
      if (customers.length === 0) {
        return res.json({ exists: false });
      }
      
      // Don't send password or sensitive data
      const customerData = {
        id: customers[0].id,
        firstName: customers[0].firstName,
        lastName: customers[0].lastName,
        email: customers[0].email
      };
      
      return res.json({ 
        exists: true,
        customerData
      });
    } catch (error) {
      console.error('Error verifying customer:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


// Complete registration with username and password
router.post('/complete-registration', async (req, res) => {
    const { customerId, username, password, email, phoneNumber } = req.body;
    
    if (!customerId || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    try {
      // Check if username is already taken
      const [existingUsers] = await db.query('SELECT * FROM customers WHERE username = ?', [username]);
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Update the customer record with username and password
      await db.query(
        'UPDATE customers SET username = ?, password = ? WHERE id = ?',
        [username, hashedPassword, customerId]
      );
      
      res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
      console.error('Error completing registration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Add this route to verify customer existence and check if they already have an account
router.post('/verify-existence', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phone number is required'
      });
    }
    
    let query = 'SELECT * FROM customers WHERE ';
    const queryParams = [];
    
    if (email) {
      query += 'email = ?';
      queryParams.push(email);
    } else {
      query += 'phone_number = ?';
      queryParams.push(phoneNumber);
    }
    
    const [customers] = await db.query(query, queryParams);
    
    if (customers.length === 0) {
      return res.json({
        exists: false,
        message: 'Customer not found'
      });
    }
    
    // Customer exists, now check if they already have account credentials
    const [accounts] = await db.query(
      'SELECT * FROM customers WHERE id = ?',
      [customers[0].id]
    );
    
    const hasAccount = accounts.length > 0;
    
    return res.json({
      exists: true,
      hasAccount: hasAccount,
      customerData: {
        id: customers[0].id,
        name: customers[0].first_name + ' ' + customers[0].last_name,
        email: customers[0].email,
        phoneNumber: customers[0].phone_number
      },
      message: hasAccount 
        ? 'Customer already has an account' 
        : 'Customer found but no account exists'
    });
  } catch (error) {
    console.error('Error verifying customer existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify customer existence',
      error: error.message
    });
  }
});

// Add this to your customerRoutes.js file

// Route to change customer password
router.put(
    "/change-password/:id",
    [
        body("currentPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword")
            .notEmpty().withMessage("New password is required")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage("Password must contain at least one uppercase letter, one number, and one symbol")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;

            // Get user from database
            const [users] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
            
            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = users[0];

            // Check if current password matches
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password in database
            await db.query(
                "UPDATE customers SET password = ? WHERE id = ?",
                [hashedPassword, id]
            );

            res.status(200).json({ message: "Password updated successfully" });
        } catch (error) {
            console.error("Error changing password:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

module.exports = router;