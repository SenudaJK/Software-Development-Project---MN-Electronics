import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/DashboardUI';
import EmployeeTable from './components/EmployeeTable';
import EmployeeDetail from './components/EmployeeDetail';
import CustomerTable from './components/CustomerTable';
import EmployeeRegistrationForm from './components/EmployeeRegistrationForm';
import InventoryForm from './components/InventoryForm';
import Sidebar from './components/Sidebar';
import RegisterJobAndCustomer from './components/RegisterJobAndCustomer';
import JobTable from './components/JobTable';
import CustomerRegistrationForm from './components/CustomerRegistrationForm';
import './App.css';
import '@fontsource/roboto/400.css'; // Regular weight
import '@fontsource/roboto/500.css'; // Medium weight (if needed)
import '@fontsource/roboto/700.css'; // Bold weight (if needed)
import CalculatePartTimeSalary from './components/CalculatePartTimeSalary';
import ViewInventory from './components/ViewInventory';
import MyJobs from './components/MyJobs';
// import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex' }}>
      {isAuthenticated && <Sidebar />}
      <div style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeTable />} />
          <Route path="/customers" element={<CustomerTable />} />
          <Route path ="/part-time-salary" element={<CalculatePartTimeSalary />} />
          <Route path="/view-inventory" element={<ViewInventory />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/register-employee" element={<EmployeeRegistrationForm />} />
          <Route path="/create-account-customer" element={<CustomerRegistrationForm />} />
          <Route path="/add-inventory" element={<InventoryForm />} />
          <Route path="/register-job" element={<RegisterJobAndCustomer />} />
          <Route path="/jobs" element={<JobTable />} />
          <Route path="/myjobs" element={<MyJobs />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;