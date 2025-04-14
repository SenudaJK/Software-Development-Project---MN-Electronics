import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import RepairJobs from '../pages/RepairJobs';
import Products from '../pages/Products';
import Salary from '../pages/Salary';
import Login from '../pages/Login';
import RegisterJobAndCustomer from '../pages/RegisterJobAndCustomer';
import EmployeeRegistrationForm from '../pages/EmployeeRegistrationForm';
import InventoryForm from '../pages/InventoryForm';
import InventoryBatchRegistration from '../pages/InventoryBatchRegistration';
import ViewInventory from '../pages/ViewInventory';
import EmployeeTable from '../pages/EmployeeTable';
import AdvanceInvoice from '../pages/AdvanceInvoice';
import FullInvoice from '../pages/FullInvoice';
import MyJobs from '../pages/MyJobs';
import InventoryBatch from '../pages/InventoryBatch';



const AppRoutes = () => {

  
  // Retrieve employee details from localStorage
  const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
  const employeeId = employeeData.id || ''; // Default to an empty string if not found
  const role = employeeData.role || ''; // Default to an empty string if not found

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customers" element={<Customers />} />
      {/* <Route path="/employees" element={<Employees />} /> */}
      <Route path="/repair-jobs" element={<RepairJobs />} />
      <Route path="/products" element={<Products />} />
      <Route path="/salary" element={<Salary />} />
      <Route path="/register/register-job-customer" element={<RegisterJobAndCustomer />} />
      <Route path="/register-employee" element={<EmployeeRegistrationForm />} />
      <Route path="/add-inventory" element={<InventoryForm />} />
      <Route path="/inventory/inventory-batch" element={<InventoryBatchRegistration />} />
      <Route path="/inventory/view-inventory" element={<ViewInventory />} />
      <Route path="/employees" element={<EmployeeTable />} />
      <Route path="invoice/advance-payment" element={<AdvanceInvoice />} />
      <Route path="invoice/full-payment" element={<FullInvoice />} />
      <Route path="/inventory-batch/:inventoryId" element={<InventoryBatch />} />
      <Route path="/myjobs" element={<MyJobs employeeId={employeeId} role={role} />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default AppRoutes;