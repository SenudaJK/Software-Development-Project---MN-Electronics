const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Add a new inventory batch
router.post(
    '/addBatch/:inventoryId',
    [
        body('Quantity')
            .isInt({ min: 1, max: 9999 }).withMessage('Quantity must be an integer between 1 and 9999'),
        body('Cost_Per_Item')
            .isFloat({ min: 1.00 }).withMessage('Cost per item must be a positive number'),
        body('Purchase_Date')
            .optional()
            .isISO8601().withMessage('Purchase date must be a valid date')
            .custom((value) => {
                const purchaseDate = new Date(value);
                const now = new Date();
                if (purchaseDate > now) {
                    throw new Error('Purchase date cannot be a future date');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { inventoryId } = req.params;
        const { Quantity, Cost_Per_Item, Purchase_Date } = req.body;

        try {
            // Start a transaction
            await db.query('START TRANSACTION');

            // Calculate the total amount
            const totalAmount = Quantity * Cost_Per_Item;

            // Insert into InventoryBatch
            const [result] = await db.query(
                "INSERT INTO InventoryBatch (Inventory_ID, Quantity, Cost_Per_Item, Total_Amount, Purchase_Date) VALUES (?, ?, ?, ?, ?)",
                [inventoryId, Quantity, Cost_Per_Item, totalAmount, Purchase_Date || new Date()]
            );

            const batchNo = result.insertId;

            // Insert into PurchaseItems
            await db.query(
                "INSERT INTO PurchaseItems (Inventory_ID, Batch_No, Quantity, Total_Amount, Purchase_Date) VALUES (?, ?, ?, ?, ?)",
                [inventoryId, batchNo, Quantity, totalAmount, Purchase_Date || new Date()]
            );

            // Commit the transaction
            await db.query('COMMIT');

            res.status(201).json({ message: "Inventory batch and purchase item added successfully!", id: batchNo });
        } catch (err) {
            // Rollback the transaction in case of error
            await db.query('ROLLBACK');
            res.status(500).json({ error: err.message });
        }
    }
);

// Get inventory batch details for a particular Inventory_ID
router.get('/getBatches/:inventoryId', async (req, res) => {
    const { inventoryId } = req.params;

    try {
        // Query to fetch batch details for the given Inventory_ID
        const [batches] = await db.query(`
            SELECT 
                ib.Batch_No,
                ib.Inventory_ID,
                ib.Quantity,
                ib.Cost_Per_Item,
                ib.Total_Amount,
                ib.Purchase_Date
            FROM InventoryBatch ib
            WHERE ib.Inventory_ID = ?
        `, [inventoryId]);

        if (batches.length === 0) {
            return res.status(404).json({ message: "No batches found for the given Inventory_ID" });
        }

        // Return the batch details
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an existing inventory batch
router.put(
    '/updateBatch/:BatchNo',
    [
        body('Quantity')
            .isInt({ min: 1, max: 9999 }).withMessage('Quantity must be an integer between 1 and 9999'),
        body('Cost_Per_Item')
            .isFloat({ min: 1.00 }).withMessage('Cost per item must be a positive number'),
        body('Purchase_Date')
            .optional()
            .isISO8601().withMessage('Purchase date must be a valid date')
            .custom((value) => {
                const purchaseDate = new Date(value);
                const now = new Date();
                if (purchaseDate > now) {
                    throw new Error('Purchase date cannot be a future date');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { BatchNo } = req.params;
        const { Quantity, Cost_Per_Item, Purchase_Date } = req.body;

        try {
            await db.query(
                "UPDATE InventoryBatch SET Quantity = ?, Cost_Per_Item = ?, Purchase_Date = ? WHERE BatchNo = ?",
                [Quantity, Cost_Per_Item, Purchase_Date || new Date(), BatchNo]
            );

            res.status(200).json({ message: "Inventory batch updated successfully!" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Delete an inventory batch
router.delete('/deleteBatch/:BatchNo', async (req, res) => {
    const { BatchNo } = req.params;
    try {
        await db.query("DELETE FROM InventoryBatch WHERE BatchNo = ?", [BatchNo]);
        res.status(200).json({ message: "Inventory batch deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch inventory and batch data for a job
router.get('/inventory-batches/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const [batches] = await db.query(`
            SELECT 
                ib.Inventory_ID,
                ib.Batch_No,
                ib.Quantity,
                ib.Cost_Per_Item
            FROM InventoryBatch ib
            INNER JOIN JobUsedInventory jui ON jui.Job_ID = ?
            WHERE ib.Quantity > 0
        `, [jobId]);

        if (batches.length === 0) {
            return res.status(404).json({ message: "No inventory batches found for this job" });
        }

        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch inventory items and batches for a job
router.get('/inventory-items/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const [inventoryItems] = await db.query(`
            SELECT 
                ib.Inventory_ID,
                ib.Batch_No,
                ib.Quantity,
                ib.Cost_Per_Item
            FROM InventoryBatch ib
            INNER JOIN Inventory i ON ib.Inventory_ID = i.Inventory_ID
            WHERE ib.Quantity > 0
        `);

        if (inventoryItems.length === 0) {
            return res.status(404).json({ message: "No inventory items or batches found for this job" });
        }

        res.status(200).json(inventoryItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all purchase items with inventory details
router.get('/get-purchase-items', async (req, res) => {
    try {
      // Query to fetch all purchase items with inventory names
      const [purchaseItems] = await db.query(`
        SELECT 
          pi.Purchase_ID,
          pi.Inventory_ID,
          pi.Batch_No,
          pi.Quantity,
          pi.Total_Amount,
          DATE_FORMAT(pi.Purchase_Date, '%Y-%m-%d') AS Purchase_Date,
          i.product_name AS Inventory_Name
        FROM purchaseitems pi
        LEFT JOIN inventory i ON pi.Inventory_ID = i.Inventory_ID
        ORDER BY pi.Purchase_Date DESC, pi.Purchase_ID DESC
      `);
      
      if (purchaseItems.length === 0) {
        return res.status(404).json({ message: "No purchase items found" });
      }
  
      // Calculate total purchase amount
      const totalPurchaseAmount = purchaseItems.reduce(
        (sum, item) => sum + parseFloat(item.Total_Amount),
        0
      );
      
      res.status(200).json({
        purchaseItems,
        totalPurchaseAmount: totalPurchaseAmount.toFixed(2),
        count: purchaseItems.length
      });
    } catch (err) {
      console.error("Error fetching purchase items:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get purchase items for a specific inventory item
  router.get('/get-purchase-items/:inventoryId', async (req, res) => {
    const { inventoryId } = req.params;
    
    try {
      // Query to fetch purchase items for a specific inventory ID
      const [purchaseItems] = await db.query(`
        SELECT 
          pi.Purchase_ID,
          pi.Inventory_ID,
          pi.Batch_No,
          pi.Quantity,
          pi.Total_Amount,
          DATE_FORMAT(pi.Purchase_Date, '%Y-%m-%d') AS Purchase_Date,
          i.product_name AS Inventory_Name
        FROM purchaseitems pi
        LEFT JOIN inventory i ON pi.Inventory_ID = i.Inventory_ID
        WHERE pi.Inventory_ID = ?
        ORDER BY pi.Purchase_Date DESC, pi.Purchase_ID DESC
      `, [inventoryId]);
      
      if (purchaseItems.length === 0) {
        return res.status(404).json({ message: "No purchase items found for this inventory item" });
      }
  
      // Calculate total purchase amount for this inventory item
      const totalPurchaseAmount = purchaseItems.reduce(
        (sum, item) => sum + parseFloat(item.Total_Amount),
        0
      );
      
      // Calculate total quantity purchased
      const totalQuantityPurchased = purchaseItems.reduce(
        (sum, item) => sum + parseInt(item.Quantity),
        0
      );
      
      res.status(200).json({
        purchaseItems,
        totalPurchaseAmount: totalPurchaseAmount.toFixed(2),
        totalQuantityPurchased,
        count: purchaseItems.length
      });
    } catch (err) {
      console.error(`Error fetching purchase items for inventory ${inventoryId}:`, err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get purchase items for a specific date range
  router.get('/get-purchase-items-by-date', async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }
    
    try {
      // Query to fetch purchase items for a specific date range
      const [purchaseItems] = await db.query(`
        SELECT 
          pi.Purchase_ID,
          pi.Inventory_ID,
          pi.Batch_No,
          pi.Quantity,
          pi.Total_Amount,
          DATE_FORMAT(pi.Purchase_Date, '%Y-%m-%d') AS Purchase_Date,
          i.product_name AS Inventory_Name
        FROM purchaseitems pi
        LEFT JOIN inventory i ON pi.Inventory_ID = i.Inventory_ID
        WHERE pi.Purchase_Date BETWEEN ? AND ?
        ORDER BY pi.Purchase_Date DESC, pi.Purchase_ID DESC
      `, [startDate, endDate]);
      
      if (purchaseItems.length === 0) {
        return res.status(404).json({ message: "No purchase items found for this date range" });
      }
  
      // Calculate total purchase amount for this date range
      const totalPurchaseAmount = purchaseItems.reduce(
        (sum, item) => sum + parseFloat(item.Total_Amount),
        0
      );
      
      res.status(200).json({
        purchaseItems,
        totalPurchaseAmount: totalPurchaseAmount.toFixed(2),
        count: purchaseItems.length
      });
    } catch (err) {
      console.error("Error fetching purchase items by date range:", err);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;