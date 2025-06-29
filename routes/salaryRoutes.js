const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Calculate salary for part-time employees
router.post('/calculatePartTimeSalary/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { cost } = req.body;

    if (!cost || isNaN(cost)) {
        return res.status(400).json({ error: 'Invalid cost provided' });
    }

    try {
        const employeeSalary = cost * 0.40; // 40% of the cost goes to the part-time employee
        const ownerSalary = cost * 0.60; // 60% of the cost goes to the owner

        // Update owner's salary
        // await db.query("UPDATE Employees SET Salary = Salary + ? WHERE role = 'owner'", [ownerSalary]);

        // Insert salary record for the employee
        await db.query(
            "INSERT INTO Salary (Employee_ID, Payment_Date, Total_Salary) VALUES (?, ?, ?)",
            [employeeId, new Date(), employeeSalary]
        );

        res.status(200).json({ employeeId, employeeSalary, ownerSalary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/calculateFullTimeSalary/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    try {
        const [employee] = await db.query("SELECT Basic_Salary FROM employees WHERE id = ?", [employeeId]);
        
        if (employee.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const salary = employee[0].Basic_Salary || 0;

        // Insert salary record for the employee
        await db.query(
            "INSERT INTO Salary (Employee_ID, Payment_Date, Total_Salary) VALUES (?, ?, ?)",
            [employeeId, new Date(), salary]
        );

        res.status(200).json({ employeeId, salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get salaries of all employees
router.get('/getSalaries', async (req, res) => {
    try {
        const [salaries] = await db.query("SELECT * FROM Salary");
        res.status(200).json(salaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Fetch salary details for a specific employee
router.get("/salary/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  try {
    // Fetch salary details for the employee with employee name
    const [salaryDetails] = await db.query(
      `
      SELECT 
        s.Salary_ID,
        s.Payment_Date,
        s.Overtime_Pay,
        s.Bonus,
        s.Deductions,
        s.Total_Salary,
        e.firstName,
        e.lastName,
        CONCAT(e.firstName, ' ', e.lastName) as employeeName
      FROM salary s
      JOIN employees e ON s.Employee_ID = e.id
      WHERE s.Employee_ID = ?
      ORDER BY s.Payment_Date DESC
      `,
      [employeeId]
    );

    // Calculate the total sum of salaries
    const totalSalary = salaryDetails.reduce(
      (sum, salary) => sum + parseFloat(salary.Total_Salary),
      0
    );

    res.status(200).json({ salaryDetails, totalSalary: totalSalary.toFixed(2) });
  } catch (error) {
    console.error("Error fetching salary details:", error);
    res.status(500).json({ error: "Failed to fetch salary details" });
  }
});



// Get sum of all part-time salaries
router.get('/getSumOfPartTimeSalaries', async (req, res) => {
    try {
        const [totalPartTimeSalaries] = await db.query(
            "SELECT SUM(Total_Salary) as totalPartTimeSalaries FROM Salary WHERE Employee_ID IN (SELECT id FROM Employees WHERE role = 'technician')"
        );
        res.status(200).json({ totalPartTimeSalaries: totalPartTimeSalaries[0].totalPartTimeSalaries || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sum of all salaries for a specific employee
router.get('/getSumOfSalaries/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    try {
        const [totalSalaries] = await db.query(
            "SELECT SUM(Total_Salary) as totalSalaries FROM Salary WHERE Employee_ID = ?",
            [employeeId]
        );
        res.status(200).json({ employeeId, totalSalaries: totalSalaries[0].totalSalaries || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all full-time employees
router.get('/full-time-employees', async (req, res) => {
  try {
    // Query to fetch all full-time employees with their existing salary info
    const [employees] = await db.query(`
      SELECT 
        e.id,        e.firstName, 
        e.lastName, 
        e.role,
        e.email,
        e.Basic_Salary,
        (SELECT MAX(Payment_Date) FROM salary WHERE Employee_ID = e.id) as last_payment_date,
        (SELECT Total_Salary FROM salary WHERE Employee_ID = e.id 
         ORDER BY Payment_Date DESC LIMIT 1) as last_salary
      FROM employees e
      WHERE e.employment_type = 'Full-Time'
      ORDER BY e.firstName, e.lastName
    `);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'No full-time employees found' });
    }

    // Format the date for better readability
    const formattedEmployees = employees.map(emp => ({
      ...emp,
      last_payment_date: emp.last_payment_date ? 
        new Date(emp.last_payment_date).toLocaleDateString() : 'Never',
      last_salary: emp.last_salary || 0
    }));

    res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching full-time employees:', error);
    res.status(500).json({ error: 'Failed to fetch full-time employees' });
  }
});

// Insert salary for full-time employees
router.post('/insert-full-time-salary', async (req, res) => {
  try {
    const { salaryData } = req.body;
    
    // Validate input
    if (!salaryData || !Array.isArray(salaryData) || salaryData.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide salary data for at least one employee.'
      });
    }

    // Start a transaction to ensure all operations succeed or fail together
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const results = [];      // Process each employee's salary
      for (const employeeSalary of salaryData) {
        const { 
          employeeId, 
          overtimePay = 0, 
          bonus = 0, 
          deductions = 0 
        } = employeeSalary;

        // Validate required fields
        if (!employeeId) {
          throw new Error(`Missing required employeeId field`);
        }
        
        // Get the employee's basic salary
        const [employeeResult] = await connection.query(
          "SELECT Basic_Salary FROM employees WHERE id = ?",
          [employeeId]
        );
        
        if (employeeResult.length === 0) {
          throw new Error(`Employee with ID ${employeeId} not found`);
        }
        
        const basicSalary = employeeResult[0].Basic_Salary || 0;

        // Calculate total salary
        const totalSalary = parseFloat(basicSalary) + 
                           parseFloat(overtimePay) + 
                           parseFloat(bonus) - 
                           parseFloat(deductions);

        // Insert the salary record
        const [result] = await connection.query(
          `INSERT INTO salary 
            (Employee_ID, Payment_Date, Overtime_Pay, Bonus, Deductions, Total_Salary) 
           VALUES (?, NOW(), ?, ?, ?, ?)`,
          [employeeId, overtimePay, bonus, deductions, totalSalary]
        );

        // Collect the result
        results.push({
          employeeId,
          salaryId: result.insertId,
          totalSalary
        });
      }

      // Commit the transaction
      await connection.commit();

      // Return success with results
      res.status(201).json({
        message: 'Salaries recorded successfully',
        results
      });
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    console.error('Error inserting full-time salaries:', error);
    res.status(500).json({ 
      error: 'Failed to insert salary data',
      message: error.message
    });
  }
});

// Get salary history for a specific month
router.get('/monthly-salary', async (req, res) => {
  try {
    const { year, month } = req.query;

    // Validate input
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    // Create date range for the specified month
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    // Query salary data for the specified month
    const [salaryData] = await db.query(`
      SELECT 
        s.Salary_ID,
        s.Employee_ID,
        s.Payment_Date,
        s.Overtime_Pay,
        s.Bonus,
        s.Deductions,
        s.Total_Salary,
        e.firstName,
        e.lastName,
        e.role,
        e.employment_type
      FROM salary s
      JOIN employees e ON s.Employee_ID = e.id
      WHERE s.Payment_Date BETWEEN ? AND ?
      ORDER BY e.firstName, e.lastName
    `, [startDate, endDate]);

    if (salaryData.length === 0) {
      return res.status(404).json({ message: 'No salary data found for the specified month' });
    }

    // Calculate total salary paid for the month
    const totalPaid = salaryData.reduce((sum, record) => sum + parseFloat(record.Total_Salary), 0);

    res.status(200).json({
      month: `${year}-${month}`,
      totalPaid: totalPaid.toFixed(2),
      employeeCount: new Set(salaryData.map(record => record.Employee_ID)).size,
      salaryRecords: salaryData
    });
  } catch (error) {
    console.error('Error fetching monthly salary data:', error);
    res.status(500).json({ error: 'Failed to fetch monthly salary data' });  }
});

// Update employee's basic salary
router.put('/update-basic-salary/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basicSalary } = req.body;
    
    // Validate input
    if (basicSalary === undefined || basicSalary === null || isNaN(parseFloat(basicSalary))) {
      return res.status(400).json({ error: 'Invalid basic salary value' });
    }
    
    // Update the employee's basic salary
    const [result] = await db.query(
      "UPDATE employees SET Basic_Salary = ? WHERE id = ?",
      [parseFloat(basicSalary), employeeId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({ 
      message: 'Basic salary updated successfully',
      employeeId,
      basicSalary: parseFloat(basicSalary)
    });
    
  } catch (error) {
    console.error('Error updating basic salary:', error);
    res.status(500).json({ error: 'Failed to update basic salary' });
  }
});

module.exports = router;