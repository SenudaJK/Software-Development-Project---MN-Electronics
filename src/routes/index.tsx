import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import RepairJobs from "../pages/RepairJobs";
import Products from "../pages/Products";
import Salary from "../pages/Salary";
import Login from "../pages/Login";
import RegisterJobAndCustomer from "../pages/RegisterJobAndCustomer";
import EmployeeRegistrationForm from "../pages/EmployeeRegistrationForm";
import InventoryForm from "../pages/InventoryForm";
import InventoryBatchRegistration from "../pages/InventoryBatchRegistration";
import ViewInventory from "../pages/ViewInventory";
import EmployeeTable from "../pages/EmployeeTable";
import AdvanceInvoice from "../pages/AdvanceInvoice";
import FullInvoice from "../pages/FullInvoice";
import MyJobs from "../pages/MyJobs";
import InventoryBatch from "../pages/InventoryBatch";
import JobUsedInventory from "../pages/JobUsedInventory";
import JobDetails from "../pages/JobDetails";
import EditJob from "../pages/EditJob";
import WarrantyJobs from "../pages/WarrantyJobs";
import MySalary from "../pages/MySalary";
import RegisterSalary from "../pages/RegisterSalary";
import ViewInvoices from "../pages/ViewInvoices";
import InvoiceDetails from "../pages/InvoiceDetail";
import ViewJobUsedInventory from "../pages/ViewJobUsedInventory";
import ViewAdvancePayments from "../pages/ViewAdvancePayments";
import AdvanceInvoiceDetail from "../pages/AdvanceInvoiceDetail";
import PurchaseItems from "../pages/PurchaseItems";
import RegisterWarrantyClaim from "../pages/RegisterWarrantyClaim";
import BookingDetail from "../pages/BookingDetail";
import EditAccount from "../pages/EditAccount";
import FullTimeSalaryManagement from "../pages/FullTimeSalaryManagement";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      
      {/* Routes accessible by both owners and technicians */}
      <Route element={<ProtectedRoute allowedRoles={['owner', 'technician']} />}>
        <Route path="/customers" element={<Customers />} />
        <Route path="/myjobs" element={<MyJobs />} />
        <Route path="/warranty-jobs" element={<WarrantyJobs />} />
        <Route path="/my-salary" element={<MySalary />} />
        <Route path="/inventory/view-inventory" element={<ViewInventory />} />
        <Route path="/view-invoice" element={<ViewInvoices />} />
        <Route path="/view-advance-invoice" element={<ViewAdvancePayments />} />
        <Route path="/view-job-used-inventory" element={<ViewJobUsedInventory />} />
        <Route path="/purchase-items" element={<PurchaseItems />} />
        <Route path="/view-job-used-inventory/:jobId" element={<ViewJobUsedInventory />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/account/edit" element={<EditAccount />} />
      </Route>

      {/* Owner-only routes */}
      <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repair-jobs" element={<RepairJobs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/salary" element={<Salary />} />
        <Route path="/register/register-job-customer" element={<RegisterJobAndCustomer />} />
        <Route path="/register-employee" element={<EmployeeRegistrationForm />} />
        <Route path="/add-inventory" element={<InventoryForm />} />
        <Route path="/inventory/inventory-batch" element={<InventoryBatchRegistration />} />
        <Route path="/employees" element={<EmployeeTable />} />
        <Route path="/fulltime-salary" element={<FullTimeSalaryManagement />} />
        <Route path="invoice/advance-payment" element={<AdvanceInvoice />} />
        <Route path="invoice/full-payment" element={<FullInvoice />} />
        <Route path="/inventory-batch/:inventoryId" element={<InventoryBatch />} />
        <Route path="/job-used-inventory/:jobId" element={<JobUsedInventory />} />
        <Route path="/jobs" element={<JobDetails />} />
        <Route path="/edit-job/:jobId" element={<EditJob />} />
        <Route path="/register-salary" element={<RegisterSalary />} />
        <Route path="/invoice/:id" element={<InvoiceDetails />} />
        <Route path="/advance-payment/:jobId" element={<AdvanceInvoiceDetail />} />
        <Route path="/register-warranty-claim/:jobId" element={<RegisterWarrantyClaim />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;