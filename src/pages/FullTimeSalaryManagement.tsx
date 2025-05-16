import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  UserPlus,
  Save,
  X
} from 'lucide-react';

const FullTimeSalaryManagement = () => {
  // Employee type definition
  interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    last_payment_date: string;
    last_salary: number;
    isSelected?: boolean;
    basicSalary?: number;
    overtimePay?: number;
    bonus?: number;
    deductions?: number;
  }

  // State for employees and salary data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Current month and year for salary records
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  
  // State to track employees with existing salary records for the selected month
  const [employeesWithExistingSalary, setEmployeesWithExistingSalary] = useState<string[]>([]);
  // Check for existing salary records for the selected month
  const checkExistingSalaries = async (employeeIds: string[]) => {
    setError('');
    
    try {
      // Extract year and month from selectedMonth (format: YYYY-MM)
      const [year, month] = selectedMonth.split('-');
      
      // First try to use the API if it exists
      try {
        // Call API to check if any employees already have salary records for this month
        const response = await axios.post('http://localhost:5000/api/salary/check-existing-salaries', {
          employeeIds,
          year,
          month
        });
        
        // Return array of employee IDs that already have salary records
        return response.data.employeesWithExistingSalary || [];
      } catch (apiError) {
        console.warn('API for checking existing salaries not available, falling back to client-side validation', apiError);
        
        // If the API call fails, fall back to checking with employee data we already have
        // This is a temporary client-side validation until the backend endpoint is implemented
        const existingRecords: string[] = [];
        
        // Check if any selected employee has a last_payment_date that matches the selected month
        for (const employeeId of employeeIds) {
          const employee = employees.find(emp => emp.id === employeeId);
          if (employee && employee.last_payment_date) {
            // Parse the last payment date to check if it's in the current selected month
            try {
              const paymentDate = new Date(employee.last_payment_date);
              const paymentMonth = (paymentDate.getMonth() + 1).toString().padStart(2, '0');
              const paymentYear = paymentDate.getFullYear().toString();
              
              if (paymentYear === year && paymentMonth === month) {
                existingRecords.push(employeeId);
              }
            } catch (e) {
              // If date parsing fails, skip this check
              console.error('Error parsing payment date:', e);
            }
          }
        }
        
        return existingRecords;
      }
    } catch (err: any) {
      console.error('Error checking existing salaries:', err);
      setError(err.response?.data?.message || 'Error checking existing salary records');
      return [];
    }
  };

  // Fetch full-time employees
  const fetchFullTimeEmployees = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/salary/full-time-employees');
      
      // Update employee data with additional fields for salary entry
      const enhancedEmployees = response.data.map((emp: Employee) => ({
        ...emp,
        isSelected: false,
        basicSalary: 0,
        overtimePay: 0,
        bonus: 0,
        deductions: 0,
      }));
      
      setEmployees(enhancedEmployees);
      setFilteredEmployees(enhancedEmployees);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Error fetching full-time employees');
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    fetchFullTimeEmployees();
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEmployees(employees);
      return;
    }
    
    const filtered = employees.filter(
      emp => 
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredEmployees(filtered);
  }, [employees, searchQuery]);  // Toggle employee selection
  const toggleEmployeeSelection = (id: string) => {
    // First check if employee already has a salary record for this month
    const employee = employees.find(emp => emp.id === id);
    if (employee && employee.last_payment_date) {
      try {
        const [currentYear, currentMonth] = selectedMonth.split('-');
        const paymentDate = new Date(employee.last_payment_date);
        const paymentMonth = (paymentDate.getMonth() + 1).toString().padStart(2, '0');
        const paymentYear = paymentDate.getFullYear().toString();
        
        if (paymentYear === currentYear && paymentMonth === currentMonth) {
          // Employee already has a salary record for this month, show warning
          setError(`${employee.firstName} ${employee.lastName} already has a salary record for ${selectedMonth}. Only one salary record per month is allowed.`);
          return; // Don't toggle selection
        }
      } catch (e) {
        // If date parsing fails, continue with toggle
        console.error('Error parsing payment date:', e);
      }
    }
    
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === id ? { ...emp, isSelected: !emp.isSelected } : emp
      )
    );
    
    // Clear any previous error messages when successfully toggling selection
    setError('');
  };
  // Update salary field for an employee
  const updateSalaryField = (id: string, field: string, value: number) => {
    // Validate input based on the field type
    if (field === 'basicSalary' && value <= 0) {
      setError('Basic salary must be greater than 0');
      return;
    } else if ((field === 'overtimePay' || field === 'bonus' || field === 'deductions') && value < 0) {
      setError(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be negative`);
      return;
    } else {
      // Clear any previous error if the input is valid
      setError('');
    }
    
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === id ? { ...emp, [field]: value } : emp
      )
    );
  };

  // Calculate total salary for an employee
  const calculateTotalSalary = (employee: Employee): number => {
    const basic = employee.basicSalary || 0;
    const overtime = employee.overtimePay || 0;
    const bonus = employee.bonus || 0;
    const deductions = employee.deductions || 0;
    
    return basic + overtime + bonus - deductions;
  };

  // Submit salary data for selected employees
  const submitSalaries = async () => {
    // Get selected employees
    const selectedEmployees = employees.filter(emp => emp.isSelected);
    
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee to record salary');
      return;
    }
      // Validate salary data - basic salary must be positive
    const invalidBasicSalaryEmployees = selectedEmployees.filter(emp => 
      !emp.basicSalary || emp.basicSalary <= 0
    );
    
    if (invalidBasicSalaryEmployees.length > 0) {
      setError(`Please enter valid basic salary (greater than 0) for ${invalidBasicSalaryEmployees.map(e => e.firstName).join(', ')}`);
      return;
    }
    
    // Validate that overtime, bonus, and deductions are non-negative
    const invalidOvertimeEmployees = selectedEmployees.filter(emp => 
      emp.overtimePay !== undefined && emp.overtimePay < 0
    );
    
    if (invalidOvertimeEmployees.length > 0) {
      setError(`Overtime pay cannot be negative for ${invalidOvertimeEmployees.map(e => e.firstName).join(', ')}`);
      return;
    }
    
    const invalidBonusEmployees = selectedEmployees.filter(emp => 
      emp.bonus !== undefined && emp.bonus < 0
    );
    
    if (invalidBonusEmployees.length > 0) {
      setError(`Bonus cannot be negative for ${invalidBonusEmployees.map(e => e.firstName).join(', ')}`);
      return;
    }
    
    const invalidDeductionsEmployees = selectedEmployees.filter(emp => 
      emp.deductions !== undefined && emp.deductions < 0
    );
    
    if (invalidDeductionsEmployees.length > 0) {
      setError(`Deductions cannot be negative for ${invalidDeductionsEmployees.map(e => e.firstName).join(', ')}`);
      return;
    }
      // Check for existing salary records for the selected month
    const employeeIds = selectedEmployees.map(emp => emp.id);
    const existingSalaryRecords = await checkExistingSalaries(employeeIds);
    
    if (existingSalaryRecords.length > 0) {
      // Find employee names for the IDs with existing records
      const employeesWithExisting = selectedEmployees.filter(emp => 
        existingSalaryRecords.includes(emp.id)
      );
      
      // Show error with employee names
      const employeeNames = employeesWithExisting.map(emp => 
        `${emp.firstName} ${emp.lastName}`
      ).join(', ');
      
      setError(`Salary records for ${employeeNames} already exist for ${selectedMonth}. Only one salary record per month is allowed.`);
      return;
    }
      // Prepare data for submission
    const salaryData = selectedEmployees.map(emp => ({
      employeeId: emp.id,
      basicSalary: emp.basicSalary || 0,
      overtimePay: emp.overtimePay || 0,
      bonus: emp.bonus || 0,
      deductions: emp.deductions || 0,
      salaryMonth: selectedMonth // Include the selected month in the payload
    }));
    
    setSubmitting(true);
    setError('');
    setSuccess('');
      try {
      await axios.post('http://localhost:5000/api/salary/insert-full-time-salary', {
        salaryData
      });
      
      setSuccess(`Successfully recorded salary for ${selectedEmployees.length} employees for ${selectedMonth}`);
      
      // Reset form and refresh data
      fetchFullTimeEmployees();
    } catch (err: any) {
      console.error('Error submitting salaries:', err);
      setError(err.response?.data?.message || 'Error recording salaries');
    } finally {
      setSubmitting(false);
    }
  };
  // Format currency is directly used in the component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <CreditCard className="mr-2" size={28} />
            Full-Time Employee Salary Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Record monthly salaries for full-time employees
          </p>
        </div>
        
        {/* Error and Success messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-center text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}
        
        {/* Salary period selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Salary Period
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
            Note: Only one salary record per month is allowed for each employee
          </p>
          
          <div className="flex gap-4 items-center">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month and Year
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                &nbsp;
              </label>
              <button 
                onClick={fetchFullTimeEmployees}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Employee List
              </button>
            </div>
          </div>
        </div>
        
        {/* Employee selection and search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Full-Time Employees
            </h2>
            
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading employee data...</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12" />
              <p className="mt-4">No full-time employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Select</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3" title="Required - Must be greater than 0">Basic Salary (LKR) *</th>
                    <th className="px-4 py-3" title="Optional - Must be 0 or greater">Overtime (LKR)</th>
                    <th className="px-4 py-3" title="Optional - Must be 0 or greater">Bonus (LKR)</th>
                    <th className="px-4 py-3" title="Optional - Must be 0 or greater">Deductions (LKR)</th>
                    <th className="px-4 py-3">Total (LKR)</th>
                    <th className="px-4 py-3">Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr 
                      key={employee.id}
                      className={`
                        border-b dark:border-gray-700
                        ${employee.isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                      `}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={employee.isSelected || false}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {employee.firstName} {employee.lastName}
                        <div className="text-xs text-gray-500 dark:text-gray-400">{employee.email}</div>
                      </td>
                      <td className="px-4 py-4 capitalize">{employee.role}</td>
                      <td className="px-4 py-4">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                          </div>                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            disabled={!employee.isSelected}
                            value={employee.basicSalary || ''}
                            onChange={(e) => updateSalaryField(employee.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                            className={`
                              w-full pl-10 py-2 pr-2 border rounded-md 
                              ${!employee.isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
                              dark:text-white
                            `}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                          </div>                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={!employee.isSelected}
                            value={employee.overtimePay || ''}
                            onChange={(e) => updateSalaryField(employee.id, 'overtimePay', parseFloat(e.target.value) || 0)}
                            className={`
                              w-full pl-10 py-2 pr-2 border rounded-md 
                              ${!employee.isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
                              dark:text-white
                            `}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                          </div>                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={!employee.isSelected}
                            value={employee.bonus || ''}
                            onChange={(e) => updateSalaryField(employee.id, 'bonus', parseFloat(e.target.value) || 0)}
                            className={`
                              w-full pl-10 py-2 pr-2 border rounded-md 
                              ${!employee.isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
                              dark:text-white
                            `}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                          </div>                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={!employee.isSelected}
                            value={employee.deductions || ''}
                            onChange={(e) => updateSalaryField(employee.id, 'deductions', parseFloat(e.target.value) || 0)}
                            className={`
                              w-full pl-10 py-2 pr-2 border rounded-md 
                              ${!employee.isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
                              dark:text-white
                            `}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-right">
                          LKR {calculateTotalSalary(employee).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div>{employee.last_payment_date}</div>
                          {employee.last_salary > 0 && (
                            <div className="font-medium">LKR {Number(employee.last_salary).toFixed(2)}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            {/* Salary validation rules */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
              <span><strong>Validation Rules:</strong> Basic salary must be greater than 0. Overtime, bonus, and deductions must be 0 or greater.</span>
            </p>
          </div>
          
          {/* Summary and Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-medium">{employees.filter(e => e.isSelected).length}</span> of {employees.length} employees
              </p>
              {employees.filter(e => e.isSelected).length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total payment: <span className="font-medium">LKR {
                    employees
                      .filter(e => e.isSelected)
                      .reduce((sum, emp) => sum + calculateTotalSalary(emp), 0)
                      .toFixed(2)
                  }</span>
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Reset all selections
                  setEmployees(prevEmployees => 
                    prevEmployees.map(emp => ({
                      ...emp,
                      isSelected: false,
                      basicSalary: 0,
                      overtimePay: 0,
                      bonus: 0,
                      deductions: 0
                    }))
                  );
                }}
                className="px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Reset Form
              </button>
              
              <button
                onClick={submitSalaries}
                disabled={submitting || employees.filter(e => e.isSelected).length === 0}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center
                  ${submitting || employees.filter(e => e.isSelected).length === 0
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }
                `}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Salary Records
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullTimeSalaryManagement;