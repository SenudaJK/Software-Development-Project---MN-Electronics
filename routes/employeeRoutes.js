const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const moment = require("moment");

const router = express.Router();

// Register Employee
router.post(
    "/register",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 50 }).withMessage("First name should not exceed 50 characters")
            .trim().escape(),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 50 }).withMessage("Last name should not exceed 50 characters")
            .trim().escape(),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters")
            .normalizeEmail(),
        body("username")
            .notEmpty().withMessage("Username is mandatory")
            .isLength({ max: 50 }).withMessage("Username should not exceed 50 characters")
            .trim().escape(),
        body("password")
            .notEmpty().withMessage("Password is mandatory")
            .isLength({ min: 8 }).withMessage("Password should be at least 8 characters long")
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage("Password must contain at least one uppercase letter, one number, and one symbol")
            .trim().escape(),
        body("dateOfBirth")
            .notEmpty().withMessage("Date of birth is mandatory")
            .custom((value) => {
                const dateOfBirth = moment(value, moment.ISO_8601, true);
                const now = moment();
                const age = now.diff(dateOfBirth, 'years');
                if (!dateOfBirth.isValid()) {
                    throw new Error("Invalid date format");
                }
                if (dateOfBirth.isAfter(now)) {
                    throw new Error("Date of birth cannot be a future date");
                }
                if (age < 18) {
                    throw new Error("Employee must be at least 18 years old");
                }
                return true;
            })
            .trim().escape(),
        body("role")
            .notEmpty().withMessage("Role is mandatory")
            .isIn(['technician', 'owner']).withMessage("Role must be either 'technician' or 'owner'")
            .trim().escape(),
        body("phoneNumbers")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            }),
        body("nic")
            .notEmpty().withMessage("NIC is mandatory")
            .matches(/^\d{9}[vVxX]$|^\d{12}$/).withMessage("Invalid NIC format")
            .custom((nic, { req }) => {
                const dateOfBirth = moment(req.body.dateOfBirth, moment.ISO_8601, true);
                const year = dateOfBirth.year();
                const yearString = year.toString();
                if (nic.length === 12) {
                    if (nic.substring(0, 4) !== yearString.substring(0, 4)) {
                        throw new Error("NIC first 4 characters must match the date of birth year");
                    }
                } else if (nic.length === 9) {
                    if (nic.substring(0, 2) !== yearString.substring(2, 4)) {
                        throw new Error("NIC first 2 characters must match the last 2 characters of the birth year");
                    }
                }
                return true;
            })
            .trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { firstName, lastName, email, username, password, dateOfBirth, role, phoneNumbers, nic } = req.body;

            // Check if email, username, or NIC exists
            const [existingUser] = await db.query(
                "SELECT * FROM employees WHERE email = ? OR username = ? OR nic = ?",
                [email, username, nic]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email, Username, or NIC already exists" });

            for (let phone of phoneNumbers) {
                const [existingPhone] = await db.query(
                    "SELECT * FROM employee_telephones WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message: `Phone number ${phone} already exists` });
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new employee
            const [result] = await db.query(
                "INSERT INTO employees (firstName, lastName, email, username, password, dateOfBirth, role, nic) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [firstName, lastName, email, username, hashedPassword, dateOfBirth, role, nic]
            );

            const employeeId = result.insertId;

            // Insert multiple phone numbers
            if (phoneNumbers && phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [employeeId, phone]);
                await db.query("INSERT INTO employee_telephones (employee_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(201).json({ message: "Employee registered successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

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
            const [user] = await db.query("SELECT * FROM employees WHERE email = ?", [email]);
            if (user.length === 0) return res.status(400).json({ message: "Invalid email or password" });

            // Compare password
            const isMatch = await bcrypt.compare(password, user[0].password);
            if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

            res.status(200).json({ success: true, message: "Login successful" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// Get All Employees
router.get("/all", async (req, res) => {
    try {
        const [employees] = await db.query(`
            SELECT e.id, e.firstName, e.lastName, e.email, e.dateOfBirth, e.role, e.nic, GROUP_CONCAT(t.phone_number) AS phoneNumbers
            FROM employees e
                     LEFT JOIN employee_telephones t ON e.id = t.employee_id
            GROUP BY e.id, e.firstName, e.lastName, e.email, e.dateOfBirth, e.role
        `);
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Specific Employee by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [employee] = await db.query(`
            SELECT e.id, e.firstName, e.lastName, e.email, e.role, e.nic, e.dateOfBirth, GROUP_CONCAT(t.phone_number) AS phoneNumbers
            FROM employees e
            LEFT JOIN employee_telephones t ON e.id = t.employee_id
            WHERE e.id = ?
            GROUP BY e.id, e.firstName, e.lastName, e.email
        `, [id]);
        if (employee.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(employee[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Employee
router.put(
    "/:id",
    [
        body("firstName")
            .optional()
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 50 }).withMessage("First name should not exceed 50 characters")
            .trim().escape(),
        body("lastName")
            .optional()
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 50 }).withMessage("Last name should not exceed 50 characters")
            .trim().escape(),
        body("email")
            .optional()
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters")
            .normalizeEmail(),
        body("dateOfBirth")
            .optional()
            .notEmpty().withMessage("Date of birth is mandatory")
            .custom((value) => {
                const dateOfBirth = moment(value, moment.ISO_8601, true);
                const now = moment();
                const age = now.diff(dateOfBirth, 'years');
                if (!dateOfBirth.isValid()) {
                    throw new Error("Invalid date format");
                }
                if (dateOfBirth.isAfter(now)) {
                    throw new Error("Date of birth cannot be a future date");
                }
                if (age < 18) {
                    throw new Error("Employee must be at least 18 years old");
                }
                return true;
            })
            .trim().escape(),
        body("role")
            .optional()
            .notEmpty().withMessage("Role is mandatory")
            .isIn(['technician', 'owner']).withMessage("Role must be either 'technician' or 'owner'")
            .trim().escape(),
        body("phoneNumbers")
            .optional()
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            }),
        body("nic")
            .optional()
            .notEmpty().withMessage("NIC is mandatory")
            .matches(/^\d{9}[vVxX]$|^\d{12}$/).withMessage("Invalid NIC format")
            .custom((nic, { req }) => {
                const dateOfBirth = moment(req.body.dateOfBirth, moment.ISO_8601, true);
                const year = dateOfBirth.year();
                const yearString = year.toString();
                if (nic.length === 12) {
                    if (nic.substring(0, 4) !== yearString.substring(0, 4)) {
                        throw new Error("NIC first 4 characters must match the date of birth year");
                    }
                } else if (nic.length === 9) {
                    if (nic.substring(0, 2) !== yearString.substring(2, 4)) {
                        throw new Error("NIC first 2 characters must match the last 2 characters of the birth year");
                    }
                }
                return true;
            })
            .trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { firstName, lastName, email, dateOfBirth, role, phoneNumbers, nic } = req.body;

            // Check if email or NIC exists for other employees
            if (email || nic) {
                const [existingUser] = await db.query(
                    "SELECT * FROM employees WHERE (email = ? OR nic = ?) AND id != ?",
                    [email, nic, id]
                );
                if (existingUser.length > 0) return res.status(400).json({ message: "Email or NIC already exists" });
            }

            // Update employee
            const updateFields = { firstName, lastName, email, dateOfBirth, role, nic };
            const updateQuery = Object.keys(updateFields)
                .filter(key => updateFields[key] !== undefined)
                .map(key => `${key} = ?`)
                .join(", ");
            const updateValues = Object.values(updateFields).filter(value => value !== undefined);

            if (updateQuery) {
                await db.query(
                    `UPDATE employees SET ${updateQuery} WHERE id = ?`,
                    [...updateValues, id]
                );
            }

            // Update multiple phone numbers
            if (phoneNumbers) {
                await db.query("DELETE FROM employee_telephones WHERE employee_id = ?", [id]);
                if (phoneNumbers.length > 0) {
                    const phoneValues = phoneNumbers.map(phone => [id, phone]);
                    await db.query("INSERT INTO employee_telephones (employee_id, phone_number) VALUES ?", [phoneValues]);
                }
            }

            res.status(200).json({ message: "Employee updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete Employee
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`Deleting employee with id: ${id}`); // Log the id
    try {
        const deleteEmployeeResult = await db.query("DELETE FROM employees WHERE id = ?", [id]);
        console.log(`Delete employee result: ${JSON.stringify(deleteEmployeeResult)}`); // Log the result of the delete query

        const deleteEmployeeTelephonesResult = await db.query("DELETE FROM employee_telephones WHERE employee_id = ?", [id]);
        console.log(`Delete employee telephones result: ${JSON.stringify(deleteEmployeeTelephonesResult)}`); // Log the result of the delete query

        res.status(200).json({ success: true, message: "Employee deleted successfully!" });
    } catch (error) {
        console.error(`Error deleting employee: ${error.message}`); // Log the error
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;