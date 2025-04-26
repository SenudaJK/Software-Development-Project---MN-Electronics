import React, { useState, useEffect } from "react";
import axios from "axios";

const RegisterSalary: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [defaultSalary, setDefaultSalary] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [reduction, setReduction] = useState<number>(0);
  const [overtimePay, setOvertimePay] = useState<number>(0);
  const [month, setMonth] = useState<string>("");
  const [totalSalary, setTotalSalary] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees/full-time");
        setEmployees(response.data);
      } catch (err: any) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees. Please try again.");
      }
    };

    fetchEmployees();
  }, []);

  // Fetch default salary when an employee is selected
  useEffect(() => {
    const fetchDefaultSalary = async () => {
      if (!selectedEmployee) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/employees/${selectedEmployee}/salary`);
        setDefaultSalary(response.data.defaultSalary);
        setBonus(0);
        setReduction(0);
        setOvertimePay(0);
      } catch (err: any) {
        console.error("Error fetching default salary:", err);
        setError("Failed to load default salary. Please try again.");
      }
    };

    fetchDefaultSalary();
  }, [selectedEmployee]);

  // Calculate total salary dynamically
  useEffect(() => {
    const calculatedSalary = defaultSalary + bonus + overtimePay - reduction;
    setTotalSalary(calculatedSalary);
  }, [defaultSalary, bonus, reduction, overtimePay]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !month) {
      setError("Please select an employee and a month.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/salaries/register", {
        employeeId: selectedEmployee,
        month,
        defaultSalary,
        bonus,
        reduction,
        overtimePay,
        totalSalary,
      });

      setMessage(response.data.message || "Salary registered successfully!");
      setError("");
    } catch (err: any) {
      console.error("Error registering salary:", err);
      setError(err.response?.data?.message || "Failed to register salary. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-3xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Register Salary</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md dark:bg-green-900 dark:border-green-700 dark:text-green-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Employee Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Select an Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Default Salary */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Default Salary</label>
            <input
              type="number"
              value={defaultSalary}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Bonus */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bonus</label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Reduction */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Reduction</label>
            <input
              type="number"
              value={reduction}
              onChange={(e) => setReduction(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Overtime Pay */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Overtime Pay</label>
            <input
              type="number"
              value={overtimePay}
              onChange={(e) => setOvertimePay(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Total Salary */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Salary</label>
            <input
              type="number"
              value={totalSalary}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Register Salary
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterSalary;