const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust this path to where your db file is located

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total customers count
    const [customersResult] = await db.query('SELECT COUNT(*) AS count FROM customers');
    
    // Get active repairs count (jobs that are not in completed/paid/cancelled status)
    const [activeRepairsResult] = await db.query(`
      SELECT COUNT(*) AS count FROM jobs 
      WHERE repair_status NOT IN ('Completed', 'Paid', 'Booking Cancelled')
    `);
    
    // Get total products count
    const [productsResult] = await db.query('SELECT COUNT(*) AS count FROM products');
    
    // Get total employees count
    const [employeesResult] = await db.query('SELECT COUNT(*) AS count FROM employees');
    
    res.status(200).json({
      totalCustomers: customersResult[0].count,
      activeRepairs: activeRepairsResult[0].count,
      totalProducts: productsResult[0].count,
      totalEmployees: employeesResult[0].count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get repair job status distribution
router.get('/repair-status', async (req, res) => {
  try {
    // Get count of jobs grouped by repair status
    const [statusResults] = await db.query(`
      SELECT 
        repair_status AS name, 
        COUNT(*) AS value 
      FROM jobs 
      GROUP BY repair_status
      HAVING COUNT(*) > 0
    `);
    
    if (statusResults.length === 0) {
      return res.status(404).json({ message: 'No repair jobs found' });
    }
    
    res.status(200).json(statusResults);
  } catch (error) {
    console.error('Error fetching repair status data:', error);
    res.status(500).json({ error: 'Failed to fetch repair status data' });
  }
});

// Get employee performance data (jobs completed by each technician)
router.get('/employee-performance', async (req, res) => {
  try {
    // Get count of completed jobs grouped by employee
    const [performanceResults] = await db.query(`
      SELECT 
        CONCAT(e.firstName, ' ', e.lastName) AS name,
        COUNT(j.job_id) AS jobsCompleted
      FROM employees e
      LEFT JOIN jobs j ON e.id = j.assigned_employee AND j.repair_status IN ('Completed', 'Paid')
      WHERE e.role = 'technician'
      GROUP BY e.id
      ORDER BY jobsCompleted DESC
    `);
    
    if (performanceResults.length === 0) {
      return res.status(404).json({ message: 'No employee performance data found' });
    }
    
    res.status(200).json(performanceResults);
  } catch (error) {
    console.error('Error fetching employee performance data:', error);
    res.status(500).json({ error: 'Failed to fetch employee performance data' });
  }
});

// Get recent jobs (optional, for a dashboard widget)
router.get('/recent-jobs', async (req, res) => {
  try {
    const [recentJobs] = await db.query(`
      SELECT 
        j.job_id,
        j.repair_description,
        j.repair_status,
        DATE_FORMAT(j.handover_date, '%Y-%m-%d') AS handover_date,
        CONCAT(c.firstName, ' ', c.lastName) AS customer_name,
        p.product_name,
        p.model
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN products p ON j.product_id = p.product_id
      ORDER BY j.job_id DESC
      LIMIT 5
    `);
    
    res.status(200).json(recentJobs);
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    res.status(500).json({ error: 'Failed to fetch recent jobs' });
  }
});

// Get revenue statistics (optional, for financial insights)
router.get('/revenue', async (req, res) => {
  try {
    // Get monthly revenue data for the current year
    const currentYear = new Date().getFullYear();
    
    const [monthlyRevenue] = await db.query(`
      SELECT 
        MONTH(i.Created_At) AS month,
        SUM(i.Total_Amount) AS revenue
      FROM invoice i
      WHERE YEAR(i.Created_At) = ?
      GROUP BY MONTH(i.Created_At)
      ORDER BY month
    `, [currentYear]);
    
    // Get total revenue
    const [totalRevenue] = await db.query(`
      SELECT SUM(Total_Amount) AS total FROM invoice
    `);
    
    // Get average invoice amount
    const [avgInvoice] = await db.query(`
      SELECT AVG(Total_Amount) AS average FROM invoice
    `);
    
    res.status(200).json({
      monthlyRevenue,
      totalRevenue: totalRevenue[0].total || 0,
      averageInvoice: avgInvoice[0].average || 0
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

module.exports = router;