const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add a Job Linked to a Product, Customer, and Assigned Employee
router.post("/add", async (req, res) => {
    try {
        const { product_id, customer_id, assigned_employee, repair_description, repair_status, warranty_eligible, handover_date } = req.body;

        const [result] = await db.query(
            "INSERT INTO jobs (product_id, customer_id, assigned_employee, repair_description, repair_status, warranty_eligible, handover_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [product_id, customer_id, assigned_employee, repair_description, repair_status, warranty_eligible, handover_date]
        );

        res.status(201).json({ message: "Job added successfully!", job_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Jobs with Associated Products, Customers, and Assigned Employees
router.get("/get", async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT 
                jobs.*, 
                products.product_name, 
                products.model, 
                products.product_image, 
                customers.firstName AS customer_first_name, 
                customers.lastName AS customer_last_name, 
                employees.firstName AS employee_first_name, 
                employees.lastName AS employee_last_name
            FROM jobs
            INNER JOIN products ON jobs.product_id = products.product_id
            LEFT JOIN customers ON jobs.customer_id = customers.id
            LEFT JOIN employees ON jobs.assigned_employee = employees.id
        `);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Job by ID
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM jobs WHERE job_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ message: "Job deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Jobs Assigned to a Specific Employee
router.get("/employee/:employeeId", async (req, res) => {
    const { employeeId } = req.params;

    try {
        const [jobs] = await db.query(`
            SELECT 
                jobs.job_id,
                jobs.repair_description,
                jobs.repair_status,
                jobs.handover_date,
                products.product_name,
                products.model,
                customers.firstName AS customer_first_name,
                customers.lastName AS customer_last_name
            FROM jobs
            INNER JOIN products ON jobs.product_id = products.product_id
            LEFT JOIN customers ON jobs.customer_id = customers.id
            WHERE jobs.assigned_employee = ?
        `, [employeeId]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found for this employee" });
        }

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;