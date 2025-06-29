const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const { upload, uploadToCloudinary } = require("../middleware/multer"); // Import from multer middleware
const path = require("path");

/**
 * Create a new booking
 * @route POST /api/bookings
 */
router.post('/', upload.single('productImage'), async (req, res) => {
  const { 
    productName, model, modelNumber, brand, repairDescription, 
    date, time, additionalNotes, customerId, existingProduct, product_id 
  } = req.body;

  // Handle file upload if exists
  let productImageUrl = null;
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.path);
      productImageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      // Continue with null image if upload fails
    }
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Parse and format the date and time for the handover_date field
    // Assuming date format is like "Monday, May 6, 2023"
    const dateComponents = date.split(',');
    let formattedDate;
    
    if (dateComponents.length >= 2) {
      const datePart = dateComponents[1].trim();
      const [month, day, year] = datePart.split(' ');
      const monthNum = getMonthNumber(month);
      formattedDate = `${year}-${monthNum}-${day.replace(',', '')}`;
    } else {
      formattedDate = new Date().toISOString().split('T')[0]; // Default to today if parsing fails
    }
    
    // Format time to MySQL time format (HH:MM:SS)
    const formattedTime = convertTo24Hour(time);
    
    // CHECK FOR EXISTING BOOKINGS AT THE SAME TIME
    // We allow a 1-hour window for each booking
    const [existingBookings] = await connection.query(`
      SELECT b.BookingID 
      FROM booking b 
      JOIN jobs j ON b.job_id = j.job_id 
      WHERE b.Date = ? 
      AND b.Time = ? 
      AND j.repair_status != 'Booking Cancelled'
    `, [formattedDate, time]);
    
    if (existingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select a different time.'
      });
    }
    
    // Combine date and time for handover_date
    const handoverDate = `${formattedDate} ${formattedTime}`;
    
    let productId;
    
    // Check if using an existing product or creating a new one
    if (existingProduct === 'true' && product_id) {
      // Use the existing product ID
      productId = product_id;
    } else {
      // Insert a new product record
      const [productResult] = await connection.query(
        'INSERT INTO products (product_name, model, model_number, product_image) VALUES (?, ?, ?, ?)',
        [productName, model, modelNumber || null, productImageUrl]
      );
      productId = productResult.insertId;
    }
    
    // Step 2: Insert job record
    const [jobResult] = await connection.query(
      'INSERT INTO jobs (product_id, customer_id, repair_description, repair_status, handover_date, warranty_eligible) VALUES (?, ?, ?, ?, ?, 0)',
      [productId, customerId, repairDescription, 'Booking Pending', handoverDate]
    );
    const jobId = jobResult.insertId;
    
    // Step 3: Insert booking record
    const [bookingResult] = await connection.query(
      'INSERT INTO booking (job_id, customer_id, Date, Time) VALUES (?, ?, ?, ?)',
      [jobId, customerId, formattedDate, time]
    );
    
    // Generate booking reference
    const bookingReference = `MN-${100000 + bookingResult.insertId}`;
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true,
      message: 'Booking created successfully',
      jobId,
      productId,
      bookingId: bookingResult.insertId,
      bookingReference
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get all bookings for a customer
 * @route GET /api/bookings/customer/:customerId
 */
router.get('/customer/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    const [bookings] = await db.query(`
      SELECT 
        b.BookingID, b.Date, b.Time,
        j.job_id, j.repair_description, j.repair_status, j.handover_date, j.warranty_eligible,
        p.product_id, p.product_name, p.model, p.model_number, p.product_image
      FROM 
        booking b
      JOIN 
        jobs j ON b.job_id = j.job_id
      JOIN 
        products p ON j.product_id = p.product_id
      WHERE 
        b.customer_id = ?
      ORDER BY 
        b.Date DESC, b.Time DESC
    `, [customerId]);
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a single booking by ID
 * @route GET /api/bookings/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const [bookings] = await db.query(`
      SELECT 
        b.BookingID, b.Date, b.Time,
        j.job_id, j.repair_description, j.repair_status, j.handover_date, j.warranty_eligible,
        p.product_id, p.product_name, p.model, p.model_number, p.product_image,
        c.firstName, c.lastName, c.email
      FROM 
        booking b
      JOIN 
        jobs j ON b.job_id = j.job_id
      JOIN 
        products p ON j.product_id = p.product_id
      JOIN
        customers c ON b.customer_id = c.id
      WHERE 
        b.BookingID = ?
    `, [bookingId]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.status(200).json(bookings[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update booking status (updates job status instead)
 * @route PATCH /api/bookings/:id/status
 */
router.patch('/:id/status', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { status } = req.body;
    const bookingId = req.params.id;
    
    // Get the job ID associated with this booking
    const [bookings] = await connection.query(
      'SELECT job_id FROM booking WHERE BookingID = ?', 
      [bookingId]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const jobId = bookings[0].job_id;
    
    // Map the status from UI to the correct job repair_status format
    let jobStatus;
    if (status === 'Accepted') {
      jobStatus = 'Booking Approved';
    } else if (status === 'Cancelled') {
      jobStatus = 'Booking Cancelled';
    } else {
      jobStatus = status; // Use as-is for other cases
    }
    
    // Update the job status (since booking doesn't have status)
    await connection.query(
      'UPDATE jobs SET repair_status = ? WHERE job_id = ?', 
      [jobStatus, jobId]
    );
    
    await connection.commit();
    
    res.status(200).json({ 
      success: true,
      message: 'Booking status updated successfully',
      status: jobStatus
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Get all pending bookings for admin
 * @route GET /api/bookings/status/pending
 */
router.get('/status/pending', async (req, res) => {
  try {
    const [pendingBookings] = await db.query(`
      SELECT 
        b.BookingID, b.Date, b.Time,
        j.job_id, j.repair_description, j.repair_status,
        p.product_name, p.model, p.model_number, p.product_image,
        c.id as customer_id, c.firstName, c.lastName, c.email,
        GROUP_CONCAT(t.phone_number SEPARATOR ', ') as phone_numbers
      FROM 
        booking b
      JOIN 
        jobs j ON b.job_id = j.job_id
      JOIN 
        products p ON j.product_id = p.product_id
      JOIN
        customers c ON b.customer_id = c.id
      LEFT JOIN
        telephones t ON c.id = t.customer_id
      WHERE 
        j.repair_status = 'Booking Pending'
      GROUP BY
        b.BookingID, j.job_id, p.product_id, c.id
      ORDER BY 
        b.Date ASC, b.Time ASC
    `);
    
    res.status(200).json(pendingBookings);
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get month number
function getMonthNumber(monthName) {
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  return months[monthName];
}

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) return '00:00:00';
  
  let [time, modifier] = time12h.split(' ');
  if (!modifier) {
    // If no AM/PM is specified, assume it's already in 24-hour format
    return time + ':00';
  }
  
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12';
  } else {
    hours = modifier === 'PM' ? String(parseInt(hours, 10) + 12) : hours;
  }
  
  return `${hours.padStart(2, '0')}:${minutes}:00`;
}

module.exports = router;