const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all feedbacks with job, customer, and product details
router.get('/', async (req, res) => {
  try {
    const [feedbacks] = await db.query(`
      SELECT 
        f.Feedback_ID, 
        f.Job_ID, 
        f.feedback,
        j.repair_description,
        j.repair_status,
        c.firstName AS customer_firstName,
        c.lastName AS customer_lastName,
        p.product_name,
        p.model,
        p.model_number
      FROM feedback f
      JOIN jobs j ON f.Job_ID = j.job_id
      JOIN customers c ON j.customer_id = c.id
      JOIN products p ON j.product_id = p.product_id
      ORDER BY f.Feedback_ID DESC
    `);

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Failed to fetch feedbacks', error: error.message });
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [feedback] = await db.query(`
      SELECT 
        f.Feedback_ID, 
        f.Job_ID, 
        f.feedback,
        j.repair_description,
        j.repair_status,
        c.firstName AS customer_firstName,
        c.lastName AS customer_lastName,
        p.product_name,
        p.model,
        p.model_number
      FROM feedback f
      JOIN jobs j ON f.Job_ID = j.job_id
      JOIN customers c ON j.customer_id = c.id
      JOIN products p ON j.product_id = p.product_id
      WHERE f.Feedback_ID = ?
    `, [id]);

    if (feedback.length === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedback[0]);
  } catch (error) {
    console.error(`Error fetching feedback with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
});

// Get all feedbacks for a specific job
router.get('/job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const [feedbacks] = await db.query(`
      SELECT 
        f.Feedback_ID, 
        f.Job_ID, 
        f.feedback,
        j.repair_description,
        j.repair_status,
        c.firstName AS customer_firstName,
        c.lastName AS customer_lastName,
        p.product_name,
        p.model,
        p.model_number
      FROM feedback f
      JOIN jobs j ON f.Job_ID = j.job_id
      JOIN customers c ON j.customer_id = c.id
      JOIN products p ON j.product_id = p.product_id
      WHERE f.Job_ID = ?
    `, [jobId]);

    if (feedbacks.length === 0) {
      return res.status(404).json({ message: 'No feedbacks found for this job' });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(`Error fetching feedbacks for job ${jobId}:`, error);
    res.status(500).json({ message: 'Failed to fetch job feedbacks', error: error.message });
  }
});

// Get all feedbacks for a specific customer
router.get('/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  
  try {
    const [feedbacks] = await db.query(`
      SELECT 
        f.Feedback_ID, 
        f.Job_ID, 
        f.feedback,
        j.repair_description,
        j.repair_status,
        c.firstName AS customer_firstName,
        c.lastName AS customer_lastName,
        p.product_name,
        p.model,
        p.model_number
      FROM feedback f
      JOIN jobs j ON f.Job_ID = j.job_id
      JOIN customers c ON j.customer_id = c.id
      JOIN products p ON j.product_id = p.product_id
      WHERE c.id = ?
      ORDER BY f.Feedback_ID DESC
    `, [customerId]);

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(`Error fetching feedbacks for customer ${customerId}:`, error);
    res.status(500).json({ message: 'Failed to fetch customer feedbacks', error: error.message });
  }
});

// Get recent feedbacks (last 10)
router.get('/recent/ten', async (req, res) => {
  try {
    const [feedbacks] = await db.query(`
      SELECT 
        f.Feedback_ID, 
        f.Job_ID, 
        f.feedback,
        j.repair_description,
        j.repair_status,
        c.firstName AS customer_firstName,
        c.lastName AS customer_lastName,
        p.product_name,
        p.model,
        p.model_number
      FROM feedback f
      JOIN jobs j ON f.Job_ID = j.job_id
      JOIN customers c ON j.customer_id = c.id
      JOIN products p ON j.product_id = p.product_id
      ORDER BY f.Feedback_ID DESC
      LIMIT 10
    `);

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching recent feedbacks:', error);
    res.status(500).json({ message: 'Failed to fetch recent feedbacks', error: error.message });
  }
});

module.exports = router;