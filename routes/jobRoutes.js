const express = require("express");
const db = require("../config/db");
const { upload, uploadToCloudinary } = require("../middleware/multer"); // Import your Cloudinary middleware
const { sendRepairCompletedEmail } = require("../services/emailService");

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
router.get("/:employeeId", async (req, res) => {
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

router.get('/job-details/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const [jobDetails] = await db.query(`
            SELECT 
                jobs.job_id,
                jobs.repair_description,
                jobs.repair_status,
                jobs.handover_date,
                jobs.warranty_eligible,
                jobs.assigned_employee,
                CONCAT(employees.firstName, ' ', employees.lastName) AS assigned_employee_name,
                customers.id AS customer_id,
                customers.firstName AS customer_firstName,
                customers.lastName AS customer_lastName,
                customers.email AS customer_email,
                GROUP_CONCAT(telephones.phone_number SEPARATOR ', ') AS phone_numbers,
                products.product_id,
                products.product_name,
                products.model,
                products.model_number,
                products.product_image
            FROM jobs
            LEFT JOIN customers ON jobs.customer_id = customers.id
            LEFT JOIN telephones ON customers.id = telephones.customer_id
            LEFT JOIN products ON jobs.product_id = products.product_id
            LEFT JOIN employees ON jobs.assigned_employee = employees.id
            WHERE jobs.job_id = ?
            GROUP BY jobs.job_id, customers.id, products.product_id, employees.id
        `, [jobId]);

        if (jobDetails.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json(jobDetails[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Job Status
router.put("/update-status/:jobId", async (req, res) => {
    const { jobId } = req.params;
    const { repair_status } = req.body;    try {
        let updateQuery = "UPDATE jobs SET repair_status = ? WHERE job_id = ?";
        let updateParams = [repair_status, jobId];
        
        // If the repair status is "Completed", set the completion_date to the current date
        if (repair_status === "Completed") {
            updateQuery = "UPDATE jobs SET repair_status = ?, completion_date = NOW() WHERE job_id = ?";
        }
        
        // Update the job status and completion date if applicable
        const [result] = await db.query(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job not found" });
        }
        
        // If the repair status is "Completed", send an email to the customer
        if (repair_status === "Completed") {
            try {
                // Get job details with customer and product information
                const [jobDetails] = await db.query(`
                    SELECT 
                        j.job_id, j.repair_description, j.repair_status,
                        c.id AS customer_id, c.firstName, c.lastName, c.email,
                        p.product_id, p.product_name, p.model, p.model_number
                    FROM jobs j
                    JOIN customers c ON j.customer_id = c.id
                    JOIN products p ON j.product_id = p.product_id
                    WHERE j.job_id = ?
                `, [jobId]);
                
                if (jobDetails.length > 0) {
                    // Send email notification
                    await sendRepairCompletedEmail(
                        {
                            firstName: jobDetails[0].firstName,
                            lastName: jobDetails[0].lastName,
                            email: jobDetails[0].email
                        },
                        {
                            product_id: jobDetails[0].product_id,
                            product_name: jobDetails[0].product_name,
                            model: jobDetails[0].model
                        },
                        {
                            job_id: jobDetails[0].job_id,
                            repair_description: jobDetails[0].repair_description,
                            repair_status: jobDetails[0].repair_status
                        }
                    );
                    console.log(`Email notification sent to ${jobDetails[0].email} for job #${jobId}`);
                }
            } catch (emailError) {
                console.error("Error sending email notification:", emailError);
                // Don't fail the request if email sending fails
            }
        }

        res.status(200).json({ message: "Job status updated successfully!" });
    } catch (error) {
        console.error("Error updating job status:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update Job with Complete Product Information
router.put("/update/:id", upload.single("product_image"), async (req, res) => {
    const { id } = req.params;
    const { 
      repair_description, 
      repair_status, 
      handover_date, 
      product_id, 
      product_name,     // Added product name
      model,            // Added model
      model_number,     // Added model number
      product_image 
    } = req.body;
  
    console.log("Request body:", req.body);
    console.log("File:", req.file);
  
    try {
      // Begin transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        // Update job details
        await connection.query(
          "UPDATE jobs SET repair_description = ?, repair_status = ?, handover_date = ? WHERE job_id = ?",
          [repair_description, repair_status, handover_date, id]
        );
        
        // Handle image update if provided
        let imageUrl = product_image; // Use provided URL if available
        
        // If file uploaded, upload to Cloudinary
        if (req.file) {
          try {
            console.log("Uploading file to Cloudinary:", req.file.path);
            const result = await uploadToCloudinary(req.file.path, "products");
            imageUrl = result.secure_url;
            console.log("Cloudinary upload successful, URL:", imageUrl);
          } catch (cloudinaryError) {
            console.error("Cloudinary upload failed:", cloudinaryError);
            throw new Error("Failed to upload image: " + cloudinaryError.message);
          }
        }
        
        // Update product details if product_id is provided
        if (product_id) {
          // Build the update query dynamically based on provided fields
          let updateFields = [];
          let updateValues = [];
          
          // Add fields that are provided
          if (product_name) {
            updateFields.push("product_name = ?");
            updateValues.push(product_name);
          }
          
          if (model) {
            updateFields.push("model = ?");
            updateValues.push(model);
          }
          
          if (model_number) {
            updateFields.push("model_number = ?");
            updateValues.push(model_number);
          }
          
          if (imageUrl) {
            updateFields.push("product_image = ?");
            updateValues.push(imageUrl);
          }
          
          // If we have fields to update
          if (updateFields.length > 0) {
            // Add product_id for WHERE clause
            updateValues.push(product_id);
            
            // Construct and execute the query
            const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE product_id = ?`;
            const [updateResult] = await connection.query(updateQuery, updateValues);
            
            if (updateResult.affectedRows === 0) {
              console.warn(`No product found with ID ${product_id}`);
            } else {
              console.log(`Updated product ${product_id} with new details`);
            }
          }
        }
        
        // Commit the transaction
        await connection.commit();
        
        res.status(200).json({ 
          message: "Job and product details updated successfully!", 
          image_url: imageUrl 
        });
        
      } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        throw error;
      } finally {
        // Release the connection
        connection.release();
      }
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ error: error.message });
    }
});

// Get Job by ID with Employee and Phone Details
router.get("/edit-job/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get all details including phone numbers in a single query
        const query = `
            SELECT j.job_id, j.repair_description, j.repair_status, j.handover_date, j.assigned_employee, 
                  j.customer_id, j.product_id,
                  p.product_name, p.model, p.model_number, p.product_image,
                  c.firstName as customer_first_name, c.lastName as customer_last_name, 
                  c.email as customer_email,
                  e.firstName as employee_first_name, e.lastName as employee_last_name,
                  e.role as employee_role,
                  GROUP_CONCAT(t.phone_number SEPARATOR ', ') as customer_phones
            FROM jobs j
            JOIN products p ON j.product_id = p.product_id
            JOIN customers c ON j.customer_id = c.id
            LEFT JOIN employees e ON j.assigned_employee = e.id
            LEFT JOIN telephones t ON c.id = t.customer_id
            WHERE j.job_id = ?
            GROUP BY j.job_id, j.repair_description, j.repair_status, j.handover_date, j.assigned_employee, 
                     j.customer_id, j.product_id, p.product_name, p.model, p.model_number, p.product_image,
                     c.firstName, c.lastName, c.email, e.firstName, e.lastName, e.role
        `;
        
        const [results] = await db.query(query, [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }
        
        // Convert comma-separated phone numbers to an array
        if (results[0].customer_phones) {
            results[0].customer_phones = results[0].customer_phones.split(', ');
        } else {
            results[0].customer_phones = [];
        }
        
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch warranty-eligible jobs with invoice warranty information
router.get('/check/warranty-jobs', async (req, res) => {
  try {
    const [warrantyJobs] = await db.query(`
      SELECT 
        j.job_id,
        j.repair_description,
        j.assigned_employee,
        j.handover_date,
        j.repair_status,
        j.product_id,
        j.customer_id,
        i.warranty_eligible,
        i.Warranty_Expiry,
        i.Invoice_Id,
        i.Created_At AS invoice_created_at,
        i.TotalCost_for_Parts,
        i.Labour_Cost,
        i.Total_Amount,
        c.firstName AS customer_firstName,
        c.lastName AS customer_lastName,
        c.email AS customer_email,
        GROUP_CONCAT(t.phone_number SEPARATOR ', ') AS customer_phone_numbers,
        p.product_name,
        p.model,
        p.model_number,
        p.product_image, -- Added product image link
        CONCAT(e.firstName, ' ', e.lastName) AS employee_name,
        CONCAT(o.firstName, ' ', o.lastName) AS owner_name
      FROM jobs j
      JOIN invoice i ON j.job_id = i.Job_ID
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN telephones t ON c.id = t.customer_id
      LEFT JOIN products p ON j.product_id = p.product_id
      LEFT JOIN employees e ON j.assigned_employee = e.id
      LEFT JOIN employees o ON i.Owner_ID = o.id
      WHERE i.warranty_eligible = 1
      GROUP BY j.job_id, j.repair_description, j.assigned_employee, j.handover_date,
               j.repair_status, j.product_id, j.customer_id,
               i.warranty_eligible, i.Warranty_Expiry, i.Invoice_Id, i.Created_At,
               i.TotalCost_for_Parts, i.Labour_Cost, i.Total_Amount, 
               c.firstName, c.lastName, c.email, p.product_name, p.model, p.model_number, p.product_image,
               e.firstName, e.lastName, o.firstName, o.lastName
      ORDER BY i.Warranty_Expiry DESC
    `);

    if (warrantyJobs.length === 0) {
      return res.status(404).json({ message: 'No warranty-eligible jobs found' });
    }

    // For each job, check if there are any related warranty claims
    const jobsWithWarrantyInfo = await Promise.all(warrantyJobs.map(async (job) => {
      // Check for related warranty claims (same product and customer)
      const [relatedJobs] = await db.query(`
        SELECT job_id, repair_status
        FROM jobs
        WHERE product_id = ? AND customer_id = ? AND 
              (repair_status = 'Warranty-Claimed' OR repair_status = 'Pending')
        AND job_id != ?
      `, [job.product_id, job.customer_id, job.job_id]);

      const currentDate = new Date();
      const warrantyExpiry = job.Warranty_Expiry ? new Date(job.Warranty_Expiry) : null;
      
      // Determine warranty status
      // If job status is Warranty-Claimed OR if it has related warranty claims, show as Warranty-Claimed
      let warrantyStatus;
      if (job.repair_status === 'Warranty-Claimed' || relatedJobs.length > 0) {
        warrantyStatus = 'Warranty-Claimed';
      } else if (warrantyExpiry && warrantyExpiry > currentDate) {
        warrantyStatus = 'Active';
      } else {
        warrantyStatus = 'Expired';
      }
      
      return {
        ...job,
        customer_name: `${job.customer_firstName} ${job.customer_lastName}`,
        warranty_status: warrantyStatus,
        days_remaining: warrantyExpiry ? Math.max(0, Math.ceil((warrantyExpiry - currentDate) / (1000 * 60 * 60 * 24))) : 0,
        formatted_warranty_expiry: warrantyExpiry ? warrantyExpiry.toLocaleDateString() : null,
        formatted_invoice_date: job.invoice_created_at ? new Date(job.invoice_created_at).toLocaleDateString() : null,
        customer_phone_numbers: job.customer_phone_numbers ? job.customer_phone_numbers.split(', ') : [],
        related_jobs: relatedJobs
      };
    }));

    res.status(200).json(jobsWithWarrantyInfo);
  } catch (error) {
    console.error('Error fetching warranty-eligible jobs:', error);
    res.status(500).json({ error: 'Failed to fetch warranty-eligible jobs: ' + error.message });
  }
});

// Register a warranty claim job (new job based on a previous one)
router.post('/register-warranty-claim', async (req, res) => {
  const { 
    productId, 
    customerId, 
    repairDescription, 
    repairStatus = 'Warranty-Claimed', // Default value
    warrantyEligible = true, // Default value for warranty claims
    employeeId, // Changed from assignedEmployee to match frontend
    receivedDate,
    previousJobId 
  } = req.body;

  try {
    // Insert the new job
    const [result] = await db.query(
      `INSERT INTO jobs (
        product_id, 
        customer_id, 
        repair_description, 
        repair_status, 
        warranty_eligible, 
        assigned_employee, 
        handover_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId, 
        customerId, 
        repairDescription, 
        repairStatus, 
        warrantyEligible, 
        employeeId, 
        receivedDate
      ]
    );

    const jobId = result.insertId;

    // Return success with the new job ID and product ID
    res.status(201).json({ 
      success: true, 
      message: 'Warranty claim registered successfully', 
      jobId: jobId,
      productId: productId
    });
  } catch (error) {
    console.error('Error registering warranty claim:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Jobs for a specific customer
router.get("/customer/:customerId", async (req, res) => {
  try {
      const customerId = req.params.customerId;
      
      // Validate customer ID
      if (!customerId) {
          return res.status(400).json({ message: "Customer ID is required" });
      }
      
      const [jobs] = await db.query(`
          SELECT 
              jobs.job_id,
              jobs.repair_description,
              jobs.repair_status,
              jobs.handover_date,
              jobs.warranty_eligible,
              jobs.assigned_employee,
              CONCAT(employees.firstName, ' ', employees.lastName) AS assigned_employee_name,
              customers.id AS customer_id,
              customers.firstName AS customer_first_name,
              customers.lastName AS customer_last_name,
              products.product_id,
              products.product_name,
              products.model,
              products.model_number,
              products.product_image
          FROM jobs
          INNER JOIN products ON jobs.product_id = products.product_id
          LEFT JOIN customers ON jobs.customer_id = customers.id
          LEFT JOIN employees ON jobs.assigned_employee = employees.id
          WHERE jobs.customer_id = ?
          ORDER BY 
              CASE 
                  WHEN jobs.repair_status = 'Pending' THEN 1
                  WHEN jobs.repair_status = 'In Progress' THEN 2
                  WHEN jobs.repair_status = 'Ready for Pickup' THEN 3
                  WHEN jobs.repair_status = 'Completed' THEN 4
                  ELSE 5
              END,
              jobs.handover_date DESC
      `, [customerId]);
      
      res.json(jobs);
  } catch (error) {
      console.error("Error fetching customer jobs:", error);
      res.status(500).json({ error: error.message });
  }
});

// Backend routes for feedback handling

// 1. Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { jobId, feedback, userId } = req.body;
    
    // Validate required fields
    if (!jobId || !feedback || !userId) {
      return res.status(400).json({ 
        message: 'Job ID, feedback text, and user ID are required' 
      });
    }
    
    // Verify the job belongs to this customer
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE job_id = ? AND customer_id = ?',
      [jobId, userId]
    );
    
    if (jobs.length === 0) {
      return res.status(403).json({ 
        message: 'You do not have permission to submit feedback for this job' 
      });
    }
    
    // Check if feedback already exists
    const [existingFeedback] = await db.query(
      'SELECT * FROM feedback WHERE Job_ID = ?',
      [jobId]
    );
    
    if (existingFeedback.length > 0) {
      return res.status(400).json({ 
        message: 'Feedback has already been submitted for this job' 
      });
    }
    
    // Insert feedback
    const [result] = await db.query(
      'INSERT INTO feedback (Job_ID, feedback) VALUES (?, ?)',
      [jobId, feedback]
    );
    
    return res.status(201).json({ 
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: result.insertId
    });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to submit feedback',
      error: error.message 
    });
  }
});

// 2. Check if feedback exists for a job
router.get('/feedback/check', async (req, res) => {
  try {
    const { jobId, userId } = req.query;
    
    if (!jobId || !userId) {
      return res.status(400).json({ message: 'Job ID and user ID are required' });
    }
    
    // Verify the job belongs to this customer
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE job_id = ? AND customer_id = ?',
      [jobId, userId]
    );
    
    if (jobs.length === 0) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this job' 
      });
    }
    
    // Check if feedback exists
    const [feedback] = await db.query(
      'SELECT * FROM feedback WHERE Job_ID = ?',
      [jobId]
    );
    
    return res.json({
      exists: feedback.length > 0,
      feedback: feedback.length > 0 ? feedback[0] : null
    });
    
  } catch (error) {
    console.error('Error checking feedback:', error);
    return res.status(500).json({ 
      message: 'Failed to check feedback status' 
    });
  }
});

// 3. Get all feedback for a customer's jobs
router.get('/feedback/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }
    
    // Get all feedback for this customer's jobs
    const [feedback] = await db.query(
      `SELECT f.* FROM feedback f
       JOIN jobs j ON f.Job_ID = j.job_id
       WHERE j.customer_id = ?`,
      [customerId]
    );
    
    return res.json(feedback);
    
  } catch (error) {
    console.error('Error fetching customer feedback:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch feedback data' 
    });
  }
});

// Update Job Status and Assigned Employee
router.put("/update-job/:jobId", async (req, res) => {
    const { jobId } = req.params;
    const { repair_status, assigned_employee } = req.body;
    
    try {
        // Check if we have at least one field to update
        if (!repair_status && !assigned_employee) {
            return res.status(400).json({ 
                message: "Either repair status or assigned employee must be provided" 
            });
        }
        
        // Build the query dynamically based on provided fields
        const updateFields = [];
        const updateParams = [];
        
        // Handle repair status update
        if (repair_status) {
            // If the repair status is "Completed", set the completion_date to the current date
            if (repair_status === "Completed") {
                updateFields.push("repair_status = ?");
                updateFields.push("completion_date = NOW()");
                updateParams.push(repair_status);
            } else {
                updateFields.push("repair_status = ?");
                updateParams.push(repair_status);
            }
        }
        
        // Handle assigned employee update
        if (assigned_employee) {
            updateFields.push("assigned_employee = ?");
            updateParams.push(assigned_employee);
        }
        
        // Add jobId to params
        updateParams.push(jobId);
        
        // Construct and execute the update query
        const updateQuery = `UPDATE jobs SET ${updateFields.join(", ")} WHERE job_id = ?`;
        const [result] = await db.query(updateQuery, updateParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job not found" });
        }
        
        // If the repair status is "Completed", send an email to the customer
        if (repair_status === "Completed") {
            try {
                // Get job details with customer and product information
                const [jobDetails] = await db.query(`
                    SELECT 
                        j.job_id, j.repair_description, j.repair_status,
                        c.id AS customer_id, c.firstName, c.lastName, c.email,
                        p.product_id, p.product_name, p.model, p.model_number
                    FROM jobs j
                    JOIN customers c ON j.customer_id = c.id
                    JOIN products p ON j.product_id = p.product_id
                    WHERE j.job_id = ?
                `, [jobId]);
                
                if (jobDetails.length > 0) {
                    // Send email notification
                    await sendRepairCompletedEmail(
                        {
                            firstName: jobDetails[0].firstName,
                            lastName: jobDetails[0].lastName,
                            email: jobDetails[0].email
                        },
                        {
                            product_id: jobDetails[0].product_id,
                            product_name: jobDetails[0].product_name,
                            model: jobDetails[0].model
                        },
                        {
                            job_id: jobDetails[0].job_id,
                            repair_description: jobDetails[0].repair_description,
                            repair_status: jobDetails[0].repair_status
                        }
                    );
                    console.log(`Email notification sent to ${jobDetails[0].email} for job #${jobId}`);
                }
            } catch (emailError) {
                console.error("Error sending email notification:", emailError);
                // Don't fail the request if email sending fails
            }
        }

        // Build response message based on what was updated
        let message = "Job updated successfully!";
        if (repair_status && assigned_employee) {
            message = "Job status and assigned employee updated successfully!";
        } else if (repair_status) {
            message = "Job status updated successfully!";
        } else if (assigned_employee) {
            message = "Job assigned employee updated successfully!";
        }

        res.status(200).json({ message });
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;