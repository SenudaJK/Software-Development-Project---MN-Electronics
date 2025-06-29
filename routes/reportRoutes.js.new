const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { format, startOfMonth, endOfMonth, subMonths } = require('date-fns');

/**
 * @route GET /api/reports/overview
 * @desc Get an overview report with key business metrics
 * @access Private
 */
router.get('/overview', async (req, res) => {
  try {
    // Current date references
    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    const previousMonth = format(subMonths(today, 1), 'yyyy-MM');
    
    // Current month date range
    const firstDayOfMonth = format(startOfMonth(today), 'yyyy-MM-dd');
    const lastDayOfMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
    // Get repair completion statistics
    const [repairStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_repairs,
        SUM(CASE WHEN repair_status = 'Completed' OR repair_status = 'Paid' THEN 1 ELSE 0 END) AS completed_repairs,
        SUM(CASE WHEN repair_status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN repair_status = 'Pending' THEN 1 ELSE 0 END) AS pending
      FROM jobs
      WHERE handover_date >= ?
    `, [firstDayOfMonth]);
      
    // Get revenue statistics
    const [revenueStats] = await db.query(`
      SELECT 
        COALESCE(SUM(Total_Amount), 0) AS monthly_revenue,
        COUNT(*) AS invoice_count,
        COALESCE(AVG(Total_Amount), 0) AS average_invoice
      FROM invoice
      WHERE Created_At BETWEEN ? AND ?
    `, [firstDayOfMonth, lastDayOfMonth]);
    
    // Get previous month revenue for comparison
    const prevMonthStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
    const prevMonthEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
    
    const [previousRevenueStats] = await db.query(`
      SELECT COALESCE(SUM(Total_Amount), 0) AS monthly_revenue
      FROM invoice
      WHERE Created_At BETWEEN ? AND ?
    `, [prevMonthStart, prevMonthEnd]);
    
    // Calculate revenue growth
    const currentRevenue = parseFloat(revenueStats[0].monthly_revenue) || 0;
    const previousRevenue = parseFloat(previousRevenueStats[0].monthly_revenue) || 0;
    const revenueGrowth = previousRevenue > 0 ? 
      ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
    // Get top services/repairs by frequency
    const [topRepairs] = await db.query(`
      SELECT 
        repair_description, 
        COUNT(*) as count
      FROM jobs
      WHERE handover_date >= ?
      GROUP BY repair_description
      ORDER BY count DESC
      LIMIT 5
    `, [firstDayOfMonth]);
    
    // Get top technicians by completed jobs
    const [topTechnicians] = await db.query(`
      SELECT 
        CONCAT(e.firstName, ' ', e.lastName) AS technician_name,
        COUNT(j.job_id) AS completed_jobs      
      FROM employees e
      JOIN jobs j ON e.id = j.assigned_employee
      WHERE j.repair_status IN ('Completed', 'Paid')
      AND j.handover_date >= ?
      GROUP BY e.id
      ORDER BY completed_jobs DESC
      LIMIT 5
    `, [firstDayOfMonth]);
    
    res.status(200).json({
      report_period: {
        month: format(today, 'MMMM yyyy'),
        start_date: firstDayOfMonth,
        end_date: lastDayOfMonth
      },
      repair_statistics: {
        total: repairStats[0].total_repairs || 0,
        completed: repairStats[0].completed_repairs || 0,
        in_progress: repairStats[0].in_progress || 0,
        pending: repairStats[0].pending || 0,
        completion_rate: repairStats[0].total_repairs > 0 ? 
          (repairStats[0].completed_repairs / repairStats[0].total_repairs * 100).toFixed(2) : 0
      },
      financial_metrics: {
        monthly_revenue: currentRevenue,
        invoice_count: revenueStats[0].invoice_count || 0,
        average_invoice: revenueStats[0].average_invoice || 0,
        revenue_growth_percentage: revenueGrowth.toFixed(2),
        previous_month_revenue: previousRevenue
      },
      top_repairs: topRepairs,
      top_technicians: topTechnicians
    });
    
  } catch (error) {
    console.error('Error generating overview report:', error);
    res.status(500).json({ error: 'Failed to generate overview report' });
  }
});

/**
 * @route GET /api/reports/financial
 * @desc Get detailed financial reports
 * @access Private
 */
router.get('/financial', async (req, res) => {
  try {
    // Parse query parameters with defaults
    const period = req.query.period || 'month'; // Options: month, quarter, year
    const startDate = req.query.startDate || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const endDate = req.query.endDate || format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    // Revenue by service type
    const [revenueByService] = await db.query(`
      SELECT 
        j.repair_description,
        COUNT(i.Invoice_ID) AS invoice_count,
        SUM(i.Total_Amount) AS total_revenue
      FROM jobs j
      JOIN invoice i ON j.job_id = i.Job_ID
      WHERE i.Created_At BETWEEN ? AND ?
      GROUP BY j.repair_description
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);
    
    // Monthly revenue trends
    const [monthlyTrends] = await db.query(`
      SELECT 
        DATE_FORMAT(Created_At, '%Y-%m') AS month,
        COUNT(Invoice_ID) AS invoice_count,
        SUM(Total_Amount) AS monthly_revenue
      FROM invoice
      WHERE Created_At >= DATE_SUB(?, INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month
    `, [startDate]);
      
    // Parts/inventory expenses
    const [inventoryExpenses] = await db.query(`
      SELECT 
        COALESCE(SUM(Total_Amount), 0) AS total_expenses,
        COUNT(*) AS purchase_count
      FROM purchaseitems
      WHERE Purchase_Date BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    // Calculate profit
    const [totalRevenue] = await db.query(`
      SELECT COALESCE(SUM(Total_Amount), 0) AS total FROM invoice
      WHERE Created_At BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    // Calculate total salary expenses
    const [salaryExpenses] = await db.query(`
      SELECT COALESCE(SUM(Total_Salary), 0) AS total FROM salary
      WHERE Payment_Date BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    const revenue = parseFloat(totalRevenue[0].total) || 0;
    const expenses = parseFloat(inventoryExpenses[0].total_expenses || 0) + parseFloat(salaryExpenses[0].total || 0);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue * 100) : 0;
    
    res.status(200).json({
      report_period: {
        period,
        start_date: startDate,
        end_date: endDate
      },
      summary: {
        total_revenue: revenue,
        total_expenses: expenses,
        profit,
        profit_margin: profitMargin.toFixed(2) + '%'
      },
      expense_breakdown: {
        inventory: parseFloat(inventoryExpenses[0].total_expenses || 0),
        salaries: parseFloat(salaryExpenses[0].total || 0)
      },
      revenue_by_service: revenueByService,
      monthly_trends: monthlyTrends
    });
    
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

/**
 * @route GET /api/reports/inventory
 * @desc Get inventory and parts usage report
 * @access Private
 */
router.get('/inventory', async (req, res) => {
  try {
    // Query inventory status with related batch information
    const [inventoryStatus] = await db.query(`
      SELECT 
        i.Inventory_ID,
        i.product_name,
        CONCAT('Item #', i.Inventory_ID) AS description,
        COALESCE(SUM(ib.Quantity), 0) AS Current_Stock,
        i.stock_limit,
        CASE 
          WHEN SUM(COALESCE(ib.Quantity, 0)) > 0 THEN COALESCE(SUM(ib.Total_Amount), 0) / SUM(COALESCE(ib.Quantity, 0))
          ELSE 0
        END AS avg_unit_cost,
        SUM(COALESCE(ib.Quantity, 0)) AS total_purchased,
        i.last_updated
      FROM inventory i
      LEFT JOIN inventorybatch ib ON i.Inventory_ID = ib.Inventory_ID
      GROUP BY i.Inventory_ID, i.product_name, i.stock_limit, i.last_updated
      ORDER BY Current_Stock ASC
    `);
    
    // Get low stock items
    const lowStockItems = inventoryStatus.filter(
      item => item.Current_Stock <= item.stock_limit
    );
    
    // Get top used parts based on JobUsedInventory table
    const [topUsedParts] = await db.query(`
      SELECT 
        i.product_name,
        COUNT(DISTINCT jui.Job_ID) AS used_in_jobs,
        SUM(COALESCE(jui.Quantity_Used, 0)) AS total_quantity_used
      FROM inventory i
      LEFT JOIN JobUsedInventory jui ON i.Inventory_ID = jui.Inventory_ID
      GROUP BY i.Inventory_ID, i.product_name
      ORDER BY used_in_jobs DESC, total_quantity_used DESC
      LIMIT 10
    `);
    
    // Get purchase history summary by month
    const [purchaseSummary] = await db.query(`
      SELECT 
        DATE_FORMAT(pi.Purchase_Date, '%Y-%m') AS month,
        COUNT(DISTINCT pi.Purchase_ID) AS purchase_count,
        COALESCE(SUM(pi.Quantity), 0) AS total_purchased,
        COALESCE(SUM(pi.Total_Amount), 0) AS total_cost
      FROM purchaseitems pi
      GROUP BY DATE_FORMAT(pi.Purchase_Date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    // Calculate inventory value
    const totalInventoryValue = inventoryStatus.reduce(
      (sum, item) => sum + (parseFloat(item.Current_Stock || 0) * parseFloat(item.avg_unit_cost || 0)),
      0
    );
    
    res.status(200).json({
      summary: {
        total_inventory_value: totalInventoryValue.toFixed(2),
        total_items: inventoryStatus.length,
        low_stock_count: lowStockItems.length,
        last_updated: inventoryStatus.length > 0 ? inventoryStatus[0].last_updated : new Date().toISOString()
      },
      low_stock_items: lowStockItems,
      inventory_status: inventoryStatus,
      most_used_parts: topUsedParts,
      purchase_summary: purchaseSummary
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

/**
 * @route GET /api/reports/performance
 * @desc Get employee performance report
 * @access Private
 */
router.get('/performance', async (req, res) => {
  try {
    const startDate = req.query.startDate || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const endDate = req.query.endDate || format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    // Employee repair performance
    const [employeePerformance] = await db.query(`
      SELECT 
        e.id AS employee_id,
        CONCAT(e.firstName, ' ', e.lastName) AS employee_name,
        e.role,
        COUNT(j.job_id) AS assigned_jobs,
        SUM(CASE WHEN j.repair_status IN ('Completed', 'Paid') THEN 1 ELSE 0 END) AS completed_jobs,
        AVG(DATEDIFF(j.completion_date, j.handover_date)) AS avg_completion_days,
        COUNT(i.Invoice_ID) AS invoices_generated,
        SUM(COALESCE(i.Total_Amount, 0)) AS revenue_generated
      FROM employees e
      LEFT JOIN jobs j ON e.id = j.assigned_employee AND j.handover_date BETWEEN ? AND ?
      LEFT JOIN invoice i ON j.job_id = i.Job_ID AND j.repair_status IN ('Completed', 'Paid')
      WHERE e.role = 'technician'
      GROUP BY e.id
      ORDER BY completed_jobs DESC
    `, [startDate, endDate]);
    
    // Calculate metrics for each employee
    const enhancedPerformance = employeePerformance.map(emp => {
      const completionRate = emp.assigned_jobs > 0 ? 
        (emp.completed_jobs / emp.assigned_jobs * 100).toFixed(2) : 0;
      
      const efficiency = emp.avg_completion_days ? 
        (7 / emp.avg_completion_days * 100).toFixed(2) : 0;
      
      return {
        ...emp,
        completion_rate: completionRate + '%',
        efficiency_score: efficiency + '%',
        avg_revenue_per_job: emp.completed_jobs > 0 ? 
          (emp.revenue_generated / emp.completed_jobs).toFixed(2) : 0
      };
    });
    
    res.status(200).json({
      report_period: {
        start_date: startDate,
        end_date: endDate
      },
      employee_performance: enhancedPerformance,
      team_averages: {
        avg_completion_rate: enhancedPerformance.length > 0 ?
          (enhancedPerformance.reduce((sum, emp) => sum + parseFloat(emp.completion_rate), 0) / 
          enhancedPerformance.length).toFixed(2) + '%' : '0%',
        avg_revenue_per_employee: enhancedPerformance.length > 0 ?
          (enhancedPerformance.reduce((sum, emp) => sum + parseFloat(emp.revenue_generated || 0), 0) / 
          enhancedPerformance.length).toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

/**
 * @route GET /api/reports/customer
 * @desc Get customer analysis report
 * @access Private
 */
router.get('/customer', async (req, res) => {
  try {
    // Top customers by revenue
    const [topCustomers] = await db.query(`
      SELECT 
        c.id,
        CONCAT(c.firstName, ' ', c.lastName) AS customer_name,
        c.email,
        COUNT(j.job_id) AS total_jobs,
        SUM(COALESCE(i.Total_Amount, 0)) AS total_spent,
        MAX(j.handover_date) AS last_visit
      FROM customers c
      JOIN jobs j ON c.id = j.customer_id
      LEFT JOIN invoice i ON j.job_id = i.Job_ID
      GROUP BY c.id
      ORDER BY total_spent DESC, total_jobs DESC
      LIMIT 10
    `);
    
    // Customer retention statistics
    const [returnCustomers] = await db.query(`
      SELECT 
        COUNT(DISTINCT c.id) AS total_customers,
        COUNT(DISTINCT CASE WHEN job_count > 1 THEN c.id END) AS returning_customers
      FROM customers c
      JOIN (
        SELECT customer_id, COUNT(*) as job_count 
        FROM jobs 
        GROUP BY customer_id
      ) j ON c.id = j.customer_id
    `);
    
    // Calculate retention rate
    const totalCustomers = returnCustomers[0].total_customers || 0;
    const returningCount = returnCustomers[0].returning_customers || 0;
    const retentionRate = totalCustomers > 0 ? 
      (returningCount / totalCustomers * 100).toFixed(2) : 0;
    
    // Most common repair types
    const [commonRepairs] = await db.query(`
      SELECT 
        repair_description,
        COUNT(*) AS count
      FROM jobs
      GROUP BY repair_description
      ORDER BY count DESC
      LIMIT 5
    `);
    
    res.status(200).json({
      customer_statistics: {
        total_customers: totalCustomers,
        returning_customers: returningCount,
        retention_rate: retentionRate + '%'
      },
      top_customers: topCustomers,
      common_repairs: commonRepairs,
    });
    
  } catch (error) {
    console.error('Error generating customer report:', error);
    res.status(500).json({ error: 'Failed to generate customer report' });
  }
});

// Register the report routes
module.exports = router;
