const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../config/db");

// Middleware to check if the user is an owner
const checkOwnerRole = async (req, res, next) => {
  const { ownerId } = req.body;
  try {
    const [owner] = await db.query("SELECT role FROM Employees WHERE id = ?", [
      ownerId,
    ]);
    if (owner.length === 0 || owner[0].role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only owners can generate invoices" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post("/create", async (req, res) => {
  const {
    jobId,
    ownerId,
    totalCostForParts,
    labourCost,
    totalAmount,
    warrantyEligible,
  } = req.body;

  console.log("Incoming Request Data:", req.body); // Log the request data

  try {
    // Fetch the Customer_ID, repair_status, and assigned_employee from the jobs table
    const [jobDetails] = await db.query(
      "SELECT customer_id, repair_status, assigned_employee FROM jobs WHERE job_id = ?",
      [jobId]
    );

    if (jobDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Job not found for the given Job ID" });
    }

    const {
      customer_id: customerId,
      repair_status: repairStatus,
      assigned_employee: assignedEmployeeId,
    } = jobDetails[0];

    console.log("Assigned Employee ID:", assignedEmployeeId);

    // Allow only jobs with repair_status = 'Completed'
    if (repairStatus !== "Completed") {
      return res.status(400).json({
        message:
          'Invoices can only be created for jobs with a status of "Completed".',
      });
    }

    if (!customerId) {
      return res
        .status(400)
        .json({ message: "Customer ID not found for the given Job ID" });
    }

    // Validate that the Customer_ID exists in the customers table
    const [customerExists] = await db.query(
      "SELECT id FROM customers WHERE id = ?",
      [customerId]
    );

    if (customerExists.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid Customer_ID. Customer does not exist." });
    }

    // Calculate warranty expiry date (3 months from now if warranty is eligible)
    const warrantyExpiry = warrantyEligible
      ? new Date(new Date().setMonth(new Date().getMonth() + 3))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
      : null;

    // Insert the invoice into the invoice table
    const [result] = await db.query(
      `
            INSERT INTO invoice (
              Job_ID,
              Customer_ID,
              Owner_ID,
              TotalCost_for_Parts,
              Labour_Cost,
              Total_Amount,
              warranty_eligible,
              Warranty_Expiry,
              Created_At
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `,
      [
        jobId,
        customerId,
        ownerId,
        totalCostForParts,
        labourCost,
        totalAmount,
        warrantyEligible ? 1 : 0,
        warrantyExpiry,
      ]
    );

    // Fetch the assigned employee's employment type and role
    const [employeeDetails] = await db.query(
      "SELECT employment_type, role FROM employees WHERE id = ?",
      [assignedEmployeeId]
    );

    if (employeeDetails.length === 0) {
      return res.status(404).json({ message: "Assigned employee not found" });
    }

    const { employment_type: employmentType, role: employeeRole } =
      employeeDetails[0];

    console.log("Employee Role:", employeeRole);
    console.log("Employment Type:", employmentType);

    // Calculate salary distribution
    let employeeShare = 0;
    let ownerShare = parseFloat(totalAmount) || 0; // Ensure totalAmount is a valid number

    if (employeeRole === "technician" && employmentType === "Part-Time") {
      employeeShare = totalAmount * 0.4; // 40% to part-time technician
      ownerShare = totalAmount * 0.6; // 60% to owner
    } else if (employeeRole === "technician" && employmentType === "Full-Time") {
      employeeShare = 0; // Full-time technicians do not get a share in this scenario
    }

    console.log("Employee Share:", employeeShare);
    console.log("Owner Share:", ownerShare);

    // Insert salary record for the technician (if applicable)
    if (employeeShare > 0) {
      await db.query(
        `
        INSERT INTO Salary (Employee_ID, Payment_Date, Total_Salary)
        VALUES (?, NOW(), ?)
        `,
        [assignedEmployeeId, employeeShare]
      );
      console.log(
        `Inserted employee share of ${employeeShare} for Employee ID: ${assignedEmployeeId}`
      );
    }

    // Fetch the owner from the employees table
    const [ownerDetails] = await db.query(
      "SELECT id FROM employees WHERE role = 'owner' AND id = ?",
      [ownerId]
    );

    if (ownerDetails.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const ownerEmployeeId = ownerDetails[0].id;

    // Insert salary record for the owner
    if (ownerShare > 0) {
      await db.query(
        `
        INSERT INTO Salary (Employee_ID, Payment_Date, Total_Salary)
        VALUES (?, NOW(), ?)
        `,
        [ownerEmployeeId, ownerShare]
      );
      console.log(
        `Inserted owner share of ${ownerShare} for Owner ID: ${ownerEmployeeId}`
      );
    }

    // Update the status in the jobs table to 'Paid'
    await db.query("UPDATE jobs SET repair_status = ? WHERE job_id = ?", [
      "Paid",
      jobId,
    ]);

    res.status(201).json({
      message: "Invoice created successfully and job status updated to Paid!",
      invoiceId: result.insertId,
      warrantyExpiry: warrantyExpiry,
      employeeShare: employeeShare.toFixed(2),
      ownerShare: ownerShare.toFixed(2),
    });
  } catch (error) {
    console.error("Error creating invoice:", error); // Log the error
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// Add Advance Payment and Fetch Job Details
router.post("/add-advance", async (req, res) => {
  const { jobId, advanceAmount, ownerId } = req.body;

  try {
    // Check if the user is an owner
    const [owner] = await db.query("SELECT role FROM Employees WHERE id = ?", [
      ownerId,
    ]);
    if (owner.length === 0 || owner[0].role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only owners can add advance payments" });
    }

    // Fetch job and customer details
    const [jobDetails] = await db.query(
      `
            SELECT 
                jobs.job_id,
                jobs.repair_description,
                customers.id AS customer_id,
                CONCAT(customers.firstName, ' ', customers.lastName) AS customer_name,
                customers.email,
                employees.id AS assigned_employee_id,
                employees.firstName AS assigned_employee_first_name,
                employees.lastName AS assigned_employee_last_name
            FROM jobs
            LEFT JOIN customers ON jobs.customer_id = customers.id
            LEFT JOIN employees ON jobs.assigned_employee = employees.id
            WHERE jobs.job_id = ?
        `,
      [jobId]
    );

    if (jobDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Job not found for the given Job ID" });
    }

    const job = jobDetails[0];

    // Insert the Advance Payment into the Advance_Payments table
    const [result] = await db.query(
      "INSERT INTO Advance_Payments (Job_ID, Customer_ID, Owner_ID, Advance_Amount) VALUES (?, ?, ?, ?)",
      [job.job_id, job.customer_id, ownerId, advanceAmount]
    );

    res.status(201).json({
      message: "Advance payment added successfully!",
      advanceId: result.insertId,
      jobDetails: {
        job_id: job.job_id,
        repair_description: job.repair_description,
        customer_name: job.customer_name,
        email: job.email,
        assigned_employee: `${job.assigned_employee_first_name} ${job.assigned_employee_last_name}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch job and customer details by Job_ID
router.get("/job-details/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    // Query to fetch job and customer details
    const [jobDetails] = await db.query(
      `
            SELECT 
                jobs.job_id,
                jobs.repair_description,
                customers.id AS customer_id,
                CONCAT(customers.firstName, ' ', customers.lastName) AS customer_name,
                customers.email,
                employees.id AS owner_id,
                employees.firstName AS owner_first_name,
                employees.lastName AS owner_last_name
            FROM jobs
            LEFT JOIN customers ON jobs.customer_id = customers.id
            LEFT JOIN employees ON jobs.assigned_employee = employees.id
            WHERE jobs.job_id = ?
        `,
      [jobId]
    );

    if (jobDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Job not found for the given Job ID" });
    }

    res.status(200).json(jobDetails[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch job invoice details by Job_ID
router.get("/job-invoice/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    // Check if an invoice already exists for the job
    const [existingInvoice] = await db.query(
      `SELECT Invoice_Id FROM invoice WHERE Job_ID = ?`,
      [jobId]
    );

    if (existingInvoice.length > 0) {
      return res.status(400).json({
        message: "An invoice already exists for this job.",
      });
    }

    // Fetch job and customer details, including repair_status
    const [jobDetails] = await db.query(
      `
        SELECT 
          jobs.job_id,
          jobs.repair_description,
          jobs.repair_status,
          customers.id AS customer_id,
          CONCAT(customers.firstName, ' ', customers.lastName) AS customer_name,
          customers.email,
          employees.id AS assigned_employee_id,
          employees.firstName AS assigned_employee_first_name,
          employees.lastName AS assigned_employee_last_name,
          products.product_name,
          products.model
        FROM jobs
        LEFT JOIN customers ON jobs.customer_id = customers.id
        LEFT JOIN employees ON jobs.assigned_employee = employees.id
        LEFT JOIN products ON jobs.product_id = products.product_id
        WHERE jobs.job_id = ?
      `,
      [jobId]
    );

    if (jobDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Job not found for the given Job ID" });
    }

    const job = jobDetails[0];

    // Check if the repair_status is not 'Completed'
    if (job.repair_status !== "Completed") {
      return res.status(400).json({
        message: "Complete the Job First",
      });
    }

    // Fetch inventory details and calculate total inventory cost
    const [inventoryDetails] = await db.query(
      `
        SELECT 
          jui.Inventory_ID,
          jui.Batch_No,
          jui.Quantity_Used,
          jui.Total_Amount,
          i.product_name AS item_name
        FROM JobUsedInventory jui
        JOIN Inventory i ON jui.Inventory_ID = i.Inventory_ID
        WHERE jui.Job_ID = ?
      `,
      [jobId]
    );

    const totalInventoryCost = inventoryDetails.reduce(
      (sum, item) => sum + parseFloat(item.Total_Amount),
      0
    );

    // Fetch advance amount for the job
    const [advanceDetails] = await db.query(
      `
        SELECT Advance_Amount 
        FROM advance_payments 
        WHERE Job_ID = ?
      `,
      [jobId]
    );

    const advanceAmount =
      advanceDetails.length > 0
        ? parseFloat(advanceDetails[0].Advance_Amount)
        : 0;

    // Manually enter the labour cost (this can be passed from the frontend)
    const labourCost = parseFloat(req.query.labourCost || 0);

    // Validate labour cost
    // if (labourCost <= 0) {
    //   return res.status(400).json({
    //     message: "Labour cost must be greater than 0.",
    //   });
    // }

    // Calculate final total
    const totalCost = labourCost + totalInventoryCost;
    const finalAmount = totalCost - advanceAmount;

    // Return all the details
    res.status(200).json({
      jobDetails: {
        job_id: job.job_id,
        product_name: job.product_name,
        model: job.model,
        repair_description: job.repair_description,
        customer_name: job.customer_name,
        email: job.email,
        assigned_employee: `${job.assigned_employee_first_name} ${job.assigned_employee_last_name}`,
      },
      inventoryDetails,
      totalInventoryCost: totalInventoryCost.toFixed(2),
      advanceAmount: advanceAmount.toFixed(2),
      labourCost: labourCost.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching job invoice details:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/view-invoices", async (req, res) => {
  try {
    // Query to fetch all invoice details with names instead of IDs
    const [invoices] = await db.query(
      `
      SELECT 
        i.Invoice_Id,
        i.Job_ID,
        i.TotalCost_for_Parts,
        i.Labour_Cost,
        i.Total_Amount,
        i.Warranty_Expiry,
        i.Created_At,
        CONCAT(c.firstName, ' ', c.lastName) AS Customer_Name,
        CONCAT(o.firstName, ' ', o.lastName) AS Owner_Name,
        CONCAT(e.firstName, ' ', e.lastName) AS Assigned_Employee_Name,
        j.repair_description AS Repair_Description
      FROM invoice i
      LEFT JOIN jobs j ON i.Job_ID = j.job_id
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN employees o ON i.Owner_ID = o.id
      LEFT JOIN employees e ON j.assigned_employee = e.id
      `
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found." });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices." });
  }
});

router.get("/invoice-details/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get basic invoice details
    const [invoice] = await db.query(
      `
      SELECT 
        i.Invoice_Id,
        i.Job_ID,
        i.TotalCost_for_Parts,
        i.Labour_Cost,
        i.Total_Amount,
        i.Warranty_Expiry,
        i.Created_At,
        CONCAT(c.firstName, ' ', c.lastName) AS Customer_Name,
        CONCAT(o.firstName, ' ', o.lastName) AS Owner_Name,
        CONCAT(e.firstName, ' ', e.lastName) AS Assigned_Employee_Name,
        j.repair_description AS Repair_Description,
        p.product_name AS Product_Name,
        p.model AS Product_Model
      FROM invoice i
      LEFT JOIN jobs j ON i.Job_ID = j.job_id
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN employees o ON i.Owner_ID = o.id
      LEFT JOIN employees e ON j.assigned_employee = e.id
      LEFT JOIN products p ON j.product_id = p.product_id
      WHERE i.Invoice_Id = ?
      `,
      [id]
    );

    if (!invoice.length) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    // Get the Job_ID from the invoice
    const jobId = invoice[0].Job_ID;

    // Fetch inventory details for the job
    const [inventoryDetails] = await db.query(
      `
      SELECT 
        jui.Inventory_ID,
        jui.Batch_No,
        jui.Quantity_Used,
        jui.Total_Amount,
        i.product_name AS item_name
      FROM JobUsedInventory jui
      JOIN Inventory i ON jui.Inventory_ID = i.Inventory_ID
      WHERE jui.Job_ID = ?
      `,
      [jobId]
    );

    // Calculate total inventory cost
    const totalInventoryCost = inventoryDetails.reduce(
      (sum, item) => sum + parseFloat(item.Total_Amount),
      0
    );

    // Fetch advance amount for the job
    const [advanceDetails] = await db.query(
      `
      SELECT 
        Advance_Id,
        Advance_Amount,
        Paid_At
      FROM advance_payments 
      WHERE Job_ID = ?
      `,
      [jobId]
    );

    // Calculate total advance payment
    const totalAdvanceAmount = advanceDetails.reduce(
      (sum, payment) => sum + parseFloat(payment.Advance_Amount),
      0
    );

    // Calculate remaining balance after advance payment
    const remainingBalance = parseFloat(invoice[0].Total_Amount) - totalAdvanceAmount;

    // Combine all data into a single response
    const response = {
      ...invoice[0],
      inventoryDetails,
      totalInventoryCost: totalInventoryCost.toFixed(2),
      advanceDetails,
      totalAdvanceAmount: totalAdvanceAmount.toFixed(2),
      remainingBalance: remainingBalance.toFixed(2)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    res.status(500).json({ error: "Failed to fetch invoice details." });
  }
});

// Get all advance payments with related information
router.get("/view-advance-payments", async (req, res) => {
  try {
    const [advancePayments] = await db.query(
      `
      SELECT 
        ap.Advance_Id,
        ap.Job_ID,
        ap.Advance_Amount,
        DATE_FORMAT(ap.Paid_At, '%Y-%m-%d %H:%i:%s') AS Paid_At,
        j.repair_description,
        j.repair_status,
        CONCAT(c.firstName, ' ', c.lastName) AS Customer_Name,
        c.email AS Customer_Email,
        CONCAT(o.firstName, ' ', o.lastName) AS Owner_Name,
        p.product_name,
        p.model
      FROM advance_payments ap
      LEFT JOIN jobs j ON ap.Job_ID = j.job_id
      LEFT JOIN customers c ON ap.Customer_ID = c.id
      LEFT JOIN employees o ON ap.Owner_ID = o.id
      LEFT JOIN products p ON j.product_id = p.product_id
      ORDER BY ap.Paid_At DESC
      `
    );

    if (advancePayments.length === 0) {
      return res.status(404).json({ message: "No advance payments found." });
    }

    res.status(200).json(advancePayments);
  } catch (error) {
    console.error("Error fetching advance payments:", error);
    res.status(500).json({ error: "Failed to fetch advance payments." });
  }
});

router.get("/job-advance-payments/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    // Fetch advance payments for the job
    const [advancePayments] = await db.query(
      `
      SELECT 
        ap.Advance_Id,
        ap.Job_ID,
        ap.Advance_Amount,
        DATE_FORMAT(ap.Paid_At, '%Y-%m-%d %H:%i:%s') AS Paid_At,
        CONCAT(c.firstName, ' ', c.lastName) AS Customer_Name,
        c.email AS Customer_Email,
        CONCAT(o.firstName, ' ', o.lastName) AS Owner_Name,
        j.repair_description,
        j.repair_status,
        p.product_name,
        p.model
      FROM advance_payments ap
      LEFT JOIN jobs j ON ap.Job_ID = j.job_id
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN employees o ON ap.Owner_ID = o.id
      LEFT JOIN products p ON j.product_id = p.product_id
      WHERE ap.Job_ID = ?
      ORDER BY ap.Paid_At DESC
      `,
      [jobId]
    );

    if (advancePayments.length === 0) {
      return res.status(404).json({ message: "No advance payments found for this job." });
    }

    // Calculate total advance payment for the job
    const totalAdvance = advancePayments.reduce(
      (sum, payment) => sum + parseFloat(payment.Advance_Amount),
      0
    );

    res.status(200).json({
      advancePayments,
      totalAdvance: totalAdvance.toFixed(2),
    });
  } catch (error) {
    console.error(`Error fetching advance payments for job ${jobId}:`, error);
    res.status(500).json({ error: "Failed to fetch advance payments." });
  }
});

// Get advance payments by customer ID
router.get("/customer-advance-payments/:customerId", async (req, res) => {
  const { customerId } = req.params;

  try {
    const [advancePayments] = await db.query(
      `
      SELECT 
        ap.Advance_Id,
        ap.Job_ID,
        ap.Advance_Amount,
        DATE_FORMAT(ap.Paid_At, '%Y-%m-%d %H:%i:%s') AS Paid_At,
        j.repair_description,
        CONCAT(o.firstName, ' ', o.lastName) AS Owner_Name,
        p.product_name,
        p.model
      FROM advance_payments ap
      LEFT JOIN jobs j ON ap.Job_ID = j.job_id
      LEFT JOIN employees o ON ap.Owner_ID = o.id
      LEFT JOIN products p ON j.product_id = p.product_id
      WHERE ap.Customer_ID = ?
      ORDER BY ap.Paid_At DESC
      `,
      [customerId]
    );

    if (advancePayments.length === 0) {
      return res.status(404).json({ message: "No advance payments found for this customer." });
    }

    res.status(200).json(advancePayments);
  } catch (error) {
    console.error(`Error fetching advance payments for customer ${customerId}:`, error);
    res.status(500).json({ error: "Failed to fetch advance payments." });
  }
});


// Get all advance payments with related information
router.get("/view-advance-payments", async (req, res) => {
  try {
    const [advancePayments] = await db.query(
      `
      SELECT 
        ap.Advance_Id,
        ap.Job_ID,
        ap.Advance_Amount,
        DATE_FORMAT(ap.Paid_At, '%Y-%m-%d %H:%i:%s') AS Paid_At,
        j.repair_description,
        j.repair_status,
        CONCAT(c.firstName, ' ', c.lastName) AS Customer_Name,
        c.email AS Customer_Email,
        CONCAT(o.firstName, ' ', o.lastName) AS Owner_Name,
        p.product_name,
        p.model
      FROM advance_payments ap
      LEFT JOIN jobs j ON ap.Job_ID = j.job_id
      LEFT JOIN customers c ON ap.Customer_ID = c.id
      LEFT JOIN employees o ON ap.Owner_ID = o.id
      LEFT JOIN products p ON j.product_id = p.product_id
      ORDER BY ap.Paid_At DESC
      `
    );

    if (advancePayments.length === 0) {
      return res.status(404).json({ message: "No advance payments found." });
    }

    res.status(200).json(advancePayments);
  } catch (error) {
    console.error("Error fetching advance payments:", error);
    res.status(500).json({ error: "Failed to fetch advance payments." });
  }
});

// Add this to your invoiceRoutes.js

// Get invoice ID by job ID
router.get("/get-invoice-id/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    const [invoiceResult] = await db.query(
      "SELECT Invoice_Id FROM invoice WHERE Job_ID = ?",
      [jobId]
    );

    if (invoiceResult.length === 0) {
      return res.status(404).json({ message: "No invoice found for this job" });
    }

    res.status(200).json({ Invoice_Id: invoiceResult[0].Invoice_Id });
  } catch (error) {
    console.error("Error fetching invoice ID:", error);
    res.status(500).json({ error: "Failed to fetch invoice ID" });
  }
});

module.exports = router;
