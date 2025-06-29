const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Add used inventory for a job, inventory, and batch
router.post('/add/:jobId/:inventoryId/:batchNo', [
    body('Quantity_Used')
        .isInt({ min: 1 }).withMessage('Quantity Used must be a positive integer')
], async (req, res) => {
    const { jobId, inventoryId, batchNo } = req.params;
    const { Quantity_Used } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Retrieve the unit price and current quantity from the InventoryBatch table
        const [batch] = await db.query(
            "SELECT Cost_Per_Item, Quantity FROM InventoryBatch WHERE Inventory_ID = ? AND Batch_No = ?",
            [inventoryId, batchNo]
        );

        if (batch.length === 0) {
            return res.status(404).json({ message: "Inventory batch not found" });
        }

        const unitPrice = batch[0].Cost_Per_Item;
        const currentQuantity = batch[0].Quantity;

        if (Quantity_Used > currentQuantity) {
            return res.status(400).json({ message: "Insufficient inventory quantity" });
        }

        const Total_Amount = unitPrice * Quantity_Used;

        // Insert the data into the JobUsedInventory table
        const [result] = await db.query(
            "INSERT INTO JobUsedInventory (Job_ID, Inventory_ID, Batch_No, Quantity_Used, Total_Amount) VALUES (?, ?, ?, ?, ?)",
            [jobId, inventoryId, batchNo, Quantity_Used, Total_Amount]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE InventoryBatch SET Quantity = Quantity - ? WHERE Inventory_ID = ? AND Batch_No = ?",
            [Quantity_Used, inventoryId, batchNo]
        );

        res.status(201).json({ message: "Job used inventory added successfully!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update used inventory for a job, inventory, and batch
router.put('/update/:jobId/:inventoryId/:batchNo', [
    body('Quantity_Used')
        .isInt({ min: 1 }).withMessage('Quantity Used must be a positive integer')
], async (req, res) => {
    const { jobId, inventoryId, batchNo } = req.params;
    const { Quantity_Used } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Retrieve the old quantity used from the JobUsedInventory table
        const [oldJobUsed] = await db.query(
            "SELECT Quantity_Used FROM JobUsedInventory WHERE Job_ID = ? AND Inventory_ID = ? AND Batch_No = ?",
            [jobId, inventoryId, batchNo]
        );

        if (oldJobUsed.length === 0) {
            return res.status(404).json({ message: "Job used inventory not found" });
        }

        const oldQuantityUsed = oldJobUsed[0].Quantity_Used;

        // Retrieve the unit price and current quantity from the InventoryBatch table
        const [batch] = await db.query(
            "SELECT Cost_Per_Item, Quantity FROM InventoryBatch WHERE Inventory_ID = ? AND Batch_No = ?",
            [inventoryId, batchNo]
        );

        if (batch.length === 0) {
            return res.status(404).json({ message: "Inventory batch not found" });
        }

        const unitPrice = batch[0].Cost_Per_Item;
        const currentQuantity = batch[0].Quantity;

        const quantityDifference = Quantity_Used - oldQuantityUsed;

        if (quantityDifference > currentQuantity) {
            return res.status(400).json({ message: "Insufficient inventory quantity" });
        }

        const Total_Amount = unitPrice * Quantity_Used;

        // Update the data in the JobUsedInventory table
        await db.query(
            "UPDATE JobUsedInventory SET Quantity_Used = ?, Total_Amount = ? WHERE Job_ID = ? AND Inventory_ID = ? AND Batch_No = ?",
            [Quantity_Used, Total_Amount, jobId, inventoryId, batchNo]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE InventoryBatch SET Quantity = Quantity - ? WHERE Inventory_ID = ? AND Batch_No = ?",
            [quantityDifference, inventoryId, batchNo]
        );

        res.status(200).json({ message: "Job used inventory updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete used inventory for a job, inventory, and batch
router.delete('/delete/:jobId/:inventoryId/:batchNo', async (req, res) => {
    const { jobId, inventoryId, batchNo } = req.params;

    try {
        // Retrieve the quantity used from the JobUsedInventory table
        const [jobUsed] = await db.query(
            "SELECT Quantity_Used FROM JobUsedInventory WHERE Job_ID = ? AND Inventory_ID = ? AND Batch_No = ?",
            [jobId, inventoryId, batchNo]
        );

        if (jobUsed.length === 0) {
            return res.status(404).json({ message: "Job used inventory not found" });
        }

        const Quantity_Used = jobUsed[0].Quantity_Used;

        // Delete the data from the JobUsedInventory table
        await db.query(
            "DELETE FROM JobUsedInventory WHERE Job_ID = ? AND Inventory_ID = ? AND Batch_No = ?",
            [jobId, inventoryId, batchNo]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE InventoryBatch SET Quantity = Quantity + ? WHERE Inventory_ID = ? AND Batch_No = ?",
            [Quantity_Used, inventoryId, batchNo]
        );

        res.status(200).json({ message: "Job used inventory deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add used inventory for a job, inventory, and batch
router.post('/add/:jobId', [
    body('Inventory_ID').notEmpty().withMessage('Inventory ID is required'),
    body('Batch_No').notEmpty().withMessage('Batch No is required'),
    body('Quantity_Used')
        .isInt({ min: 1 }).withMessage('Quantity Used must be a positive integer')
], async (req, res) => {
    const { jobId } = req.params;
    const { Inventory_ID, Batch_No, Quantity_Used } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Retrieve the unit price and current quantity from the InventoryBatch table
        const [batch] = await db.query(
            "SELECT Cost_Per_Item, Quantity FROM InventoryBatch WHERE Inventory_ID = ? AND Batch_No = ?",
            [Inventory_ID, Batch_No]
        );

        if (batch.length === 0) {
            return res.status(404).json({ message: "Inventory batch not found" });
        }

        const unitPrice = batch[0].Cost_Per_Item;
        const currentQuantity = batch[0].Quantity;

        if (Quantity_Used > currentQuantity) {
            return res.status(400).json({ message: "Insufficient inventory quantity" });
        }

        const Total_Amount = unitPrice * Quantity_Used;

        // Insert the data into the JobUsedInventory table
        const [result] = await db.query(
            "INSERT INTO JobUsedInventory (Job_ID, Inventory_ID, Batch_No, Quantity_Used, Total_Amount) VALUES (?, ?, ?, ?, ?)",
            [jobId, Inventory_ID, Batch_No, Quantity_Used, Total_Amount]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE InventoryBatch SET Quantity = Quantity - ? WHERE Inventory_ID = ? AND Batch_No = ?",
            [Quantity_Used, Inventory_ID, Batch_No]
        );

        res.status(201).json({ message: "Job used inventory added successfully!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all JobUsedInventory details
router.get('/get-all', async (req, res) => {
  try {
    // Query to fetch all JobUsedInventory details with inventory names
    const [jobUsedInventories] = await db.query(
      `
      SELECT 
        jui.Job_ID,
        jui.Inventory_ID,
        jui.Batch_No,
        jui.Quantity_Used,
        jui.Total_Amount,
        i.product_name AS Inventory_Name,
        j.repair_description AS Job_Description,
        ib.Cost_Per_Item AS Unit_Price,
        CONCAT(c.firstName, ' ', c.lastName) AS Customer_Name,
        CONCAT(e.firstName, ' ', e.lastName) AS Employee_Name
      FROM JobUsedInventory jui
      LEFT JOIN inventory i ON jui.Inventory_ID = i.Inventory_ID
      LEFT JOIN InventoryBatch ib ON jui.Inventory_ID = ib.Inventory_ID AND jui.Batch_No = ib.Batch_No
      LEFT JOIN jobs j ON jui.Job_ID = j.job_id
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN employees e ON j.assigned_employee = e.id
      ORDER BY jui.Job_ID
      `
    );

    if (jobUsedInventories.length === 0) {
      return res.status(404).json({ message: "No job used inventory found" });
    }

    res.status(200).json(jobUsedInventories);
  } catch (err) {
    console.error("Error fetching job used inventory details:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get JobUsedInventory details for a specific job
router.get('/get-by-job/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    // Query to fetch JobUsedInventory details for a specific job
    const [jobUsedInventories] = await db.query(
      `
      SELECT 
        jui.Job_ID,
        jui.Inventory_ID,
        jui.Batch_No,
        jui.Quantity_Used,
        jui.Total_Amount,
        i.product_name AS Inventory_Name,
        ib.Cost_Per_Item AS Unit_Price
      FROM JobUsedInventory jui
      LEFT JOIN inventory i ON jui.Inventory_ID = i.Inventory_ID
      LEFT JOIN InventoryBatch ib ON jui.Inventory_ID = ib.Inventory_ID AND jui.Batch_No = ib.Batch_No
      WHERE jui.Job_ID = ?
      `,
      [jobId]
    );

    if (jobUsedInventories.length === 0) {
      return res.status(404).json({ message: "No job used inventory found for this job" });
    }

    // Calculate the total cost for all inventory items used in this job
    const totalInventoryCost = jobUsedInventories.reduce(
      (sum, item) => sum + parseFloat(item.Total_Amount),
      0
    );

    res.status(200).json({
      jobUsedInventories,
      totalInventoryCost: totalInventoryCost.toFixed(2)
    });
  } catch (err) {
    console.error(`Error fetching job used inventory details for job ${jobId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;