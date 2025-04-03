const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models"); // Import Sequelize instance
const mysql = require("mysql2/promise"); // Import mysql2 for database creation

dotenv.config();

// Import routes
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const productRoutes = require("./routes/productRoutes");
const jobRoutes = require("./routes/jobRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const inventoryBatchRoutes = require("./routes/inventoryBatchRoutes");
const jobUsedInventoryRoutes = require("./routes/jobUsedInventoryRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventoryBatch', inventoryBatchRoutes);
app.use('/api/jobUsedInventory', jobUsedInventoryRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/invoices', invoiceRoutes);

// Function to ensure the database exists
async function ensureDatabaseExists() {
  const config = require("./config/config.json").development; // Load database config
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
    });

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
    console.log(`Database "${config.database}" is ready.`);
    await connection.end();
  } catch (error) {
    console.error("Error creating database:", error);
    process.exit(1); // Exit the process if database creation fails
  }
}

// Start the server
(async () => {
  try {
    // Ensure the database exists
    await ensureDatabaseExists();

    // Sync Sequelize models (create or update tables)
    await sequelize.sync({ alter: true }); // Use `force: true` to drop and recreate tables
    console.log("All models were synchronized successfully.");

    // Start the Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit the process if something goes wrong
  }
})();