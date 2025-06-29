import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  RefreshCw,
  Calendar,
  DollarSign,
  Save,
  X,
  Edit
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
    current_basic_salary: number; // This comes from the latest salary record
    isSelected?: boolean;
    basicSalary?: number;
    overtimePay?: number;
    bonus?: number;
    deductions?: number;
    isEditingBasicSalary?: boolean;
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

  // Function to handle month selection changes with validation
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedMonthValue = e.target.value;
    const selectedDate = new Date(selectedMonthValue + '-01');
    const currentDate = new Date();
    
    // Extract year and month for comparison
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Only allow current month selection for salary entry
    if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
      setError('Only current month salary entries are allowed. Please select the current month.');
      return;
    }
    
    // Clear any existing error messages
    setError('');
    setSelectedMonth(selectedMonthValue);
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
        // Initialize basicSalary with the current_basic_salary value from the latest salary record
        basicSalary: emp.current_basic_salary || 0,
        overtimePay: 0,
        bonus: 0,
        deductions: 0,
        isEditingBasicSalary: false
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
  }, [employees, searchQuery]);

  // Toggle employee selection
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
          // Employee already has a salary record for this month
          setError(`${employee.firstName} ${employee.lastName} already has a salary record for ${selectedMonth}. Only one salary record per month is allowed.`);
          return; // Don't toggle selection
        }
      } catch (e) {
        console.error('Error parsing payment date:', e);
      }
    }
    
    // Update employees state
    const updatedEmployees = employees.map(emp =>
      emp.id === id ? { ...emp, isSelected: !emp.isSelected } : emp
    );
    setEmployees(updatedEmployees);
    
    // Also update filteredEmployees to ensure UI reflects changes immediately
    setFilteredEmployees(prevFilteredEmployees =>
      prevFilteredEmployees.map(emp =>
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
    
    // Update the employees state with the new value
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === id ? { ...emp, [field]: value } : emp
      )
    );
    
    // Also update filteredEmployees to ensure UI reflects changes immediately
    setFilteredEmployees(prevFilteredEmployees =>
      prevFilteredEmployees.map(emp =>
        emp.id === id ? { ...emp, [field]: value } : emp
      )
    );
  };

  // Toggle editing mode for basic salary
  const toggleEditBasicSalary = (id: string) => {
    // Get the current state of editing for this employee
    const employee = employees.find(emp => emp.id === id);
    const isCurrentlyEditing = employee?.isEditingBasicSalary || false;
    const newBasicSalary = !isCurrentlyEditing ? employee?.current_basic_salary || 0 : employee?.basicSalary || 0;
    
    // Update both state arrays for consistent UI
    const updatedEmployees = employees.map(emp =>
      emp.id === id 
        ? { 
            ...emp, 
            isEditingBasicSalary: !isCurrentlyEditing,
            basicSalary: newBasicSalary
          } 
        : emp
    );
    
    setEmployees(updatedEmployees);
    
    setFilteredEmployees(prevFiltered =>
      prevFiltered.map(emp =>
        emp.id === id 
          ? { 
              ...emp, 
              isEditingBasicSalary: !isCurrentlyEditing,
              basicSalary: newBasicSalary
            } 
          : emp
      )
    );
  };

  // Save basic salary to database
  const saveBasicSalary = async (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    
    if (!employee) {
      setError('Employee not found');
      return;
    }
    
    const basicSalary = employee.basicSalary || 0;
    
    if (basicSalary <= 0) {
      setError('Basic salary must be greater than 0');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Call the API to update the basic salary, including the current month
      const effectiveMonth = selectedMonth; // Use the selected month from the UI
      
      const response = await axios.put(`http://localhost:5000/api/salary/update-basic-salary/${id}`, {
        basicSalary,
        effectiveMonth
      });
      
      console.log('API Response:', response.data);
      
      // Update the employee's current_basic_salary in both state arrays
      const updatedEmployees = employees.map(emp =>
        emp.id === id 
          ? { 
              ...emp, 
              current_basic_salary: basicSalary,
              basicSalary: basicSalary,
              isEditingBasicSalary: false
            } 
          : emp
      );
      
      setEmployees(updatedEmployees);
      setFilteredEmployees(prevFiltered => 
        prevFiltered.map(emp =>
          emp.id === id 
            ? { 
                ...emp, 
                current_basic_salary: basicSalary,
                basicSalary: basicSalary,
                isEditingBasicSalary: false
              } 
            : emp
        )
      );
      
      setSuccess(`Basic salary updated for ${employee.firstName} ${employee.lastName}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err: any) {
      console.error('Error updating basic salary:', err);
      
      if (err.response) {
        console.error('Error Response:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      
      setError(err.response?.data?.message || 'Error updating basic salary');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total salary for an employee
  const calculateTotalSalary = (employee: Employee): number => {
    const basic = parseFloat((employee.basicSalary || 0).toString());
    const overtime = parseFloat((employee.overtimePay || 0).toString());
    const bonus = parseFloat((employee.bonus || 0).toString());
    const deductions = parseFloat((employee.deductions || 0).toString());
    
    const total = basic + overtime + bonus - deductions;
    return isNaN(total) ? 0 : total;
  };

  // Submit salary data for selected employees
  const submitSalaries = async () => {
    // Validate that the selected month is the current month
    const selectedDate: Date = new Date(selectedMonth + '-01');
    const currentDate = new Date();
    
    // Extract year and month for comparison
    const selectedYear = selectedDate.getFullYear();
    const selectedMonthNum = selectedDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    if (selectedYear !== currentYear || selectedMonthNum !== currentMonth) {
      setError('Only current month salary entries are allowed. Please select the current month.');
      return;
    }
    
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
    
    // Prepare data for submission
    const salaryData = selectedEmployees.map(emp => ({
      employeeId: emp.id,
      basicSalary: emp.basicSalary || 0,
      overtimePay: emp.overtimePay || 0,
      bonus: emp.bonus || 0,
      deductions: emp.deductions || 0,
      salaryMonth: selectedMonth
    }));
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/salary/insert-full-time-salary', {
        salaryData
      });
      
      console.log('Salary insert response:', response.data);
      
      // Check if there were any errors with specific employees
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors.map((err: any) => {
          const emp = employees.find(e => e.id === err.employeeId);
          const name = emp ? `${emp.firstName} ${emp.lastName}` : `Employee ${err.employeeId}`;
          return `${name}: ${err.message}`;
        }).join('; ');
        
        if (response.data.results && response.data.results.length > 0) {
          setSuccess(`Partially successful: ${response.data.results.length} records processed, but ${response.data.errors.length} failed.`);
          setError(`Failed for some employees: ${errorMessages}`);
        } else {
          setError(`Failed to record salaries: ${errorMessages}`);
        }
      } else {
        setSuccess(response.data.message || `Successfully recorded salary for ${selectedEmployees.length} employees for ${selectedMonth}`);
      }
      
      // Check if any employees had their Basic_Salary updated for the first time
      const employeesWithUpdatedBasicSalary = response.data.results?.filter((r: any) => r.basicSalaryUpdated) || [];
      
      if (employeesWithUpdatedBasicSalary.length > 0) {
        const updatedEmployeeIds = employeesWithUpdatedBasicSalary.map((r: any) => r.employeeId);
        const updatedEmployeeNames = employees
          .filter(emp => updatedEmployeeIds.includes(emp.id))
          .map(emp => `${emp.firstName} ${emp.lastName}`)
          .join(', ');
        
        setSuccess(prev => `${prev}. Basic salary was set for the first time for: ${updatedEmployeeNames}`);
      }
      
      // Reset form and refresh data
      fetchFullTimeEmployees();
    } catch (err: any) {
      console.error('Error submitting salaries:', err);
      setError(err.response?.data?.message || 'Error recording salaries');
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

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
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-center text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>{success}</div>
          </div>
        )}
        
        {/* Salary period selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Salary Period
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
            Note: Only one salary record per month is allowed for each employee
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month and Year (Current Month Only)
              </label>
              <div className="relative">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  min={`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`}
                  max={`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-describedby="month-constraint"
                />
                <div id="month-constraint" className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    Only current month permitted ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-8">
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
        
        {/* Basic Salary Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Basic Salary Management
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Update the basic salary for full-time employees. This is the base amount used for monthly salary generation.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Current Basic Salary (LKR)</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={`basic-${employee.id}`}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {employee.firstName} {employee.lastName}
                      <div className="text-xs text-gray-500 dark:text-gray-400">{employee.email}</div>
                    </td>
                    <td className="px-4 py-4 capitalize">{employee.role}</td>
                    <td className="px-4 py-4">
                      {employee.isEditingBasicSalary ? (
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                          </div>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={employee.basicSalary || ''}
                            onChange={(e) => updateSalaryField(employee.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 py-2 pr-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="font-medium">
                          LKR {Number(employee.basicSalary || 0).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {employee.isEditingBasicSalary ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveBasicSalary(employee.id)}
                            disabled={submitting}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Save basic salary"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => toggleEditBasicSalary(employee.id)}
                            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Cancel"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleEditBasicSalary(employee.id)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit basic salary"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Record Monthly Salaries Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Record Monthly Salaries
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select employees and enter their salary details for the selected month. If this is the first salary for an employee, the basic salary will be saved as their standard rate.
          </p>
          
          {/* Search box */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          {/* Employees table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">
                    <span title="Select/deselect employee for salary entry">Select</span>
                  </th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">
                    <span title="Basic salary must be greater than 0. This is the base payment amount.">Basic Salary (LKR)</span>
                  </th>
                  <th className="px-4 py-3">
                    <span title="Overtime pay must be 0 or greater. This amount will be added to the basic salary in the total calculation.">Overtime Pay (LKR)</span>
                  </th>
                  <th className="px-4 py-3">
                    <span title="Bonus must be 0 or greater. This amount will be added to the basic salary in the total calculation.">Bonus (LKR)</span>
                  </th>
                  <th className="px-4 py-3">
                    <span title="Deductions must be 0 or greater. This amount will be subtracted from the total of basic salary, overtime, and bonus.">Deductions (LKR)</span>
                  </th>
                  <th className="px-4 py-3">
                    <span title="Total Salary = Basic Salary + Overtime Pay + Bonus - Deductions">Total Salary (LKR)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id}
                    className={`border-b dark:border-gray-700 ${
                      employee.isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={employee.isSelected || false}
                        onChange={() => toggleEmployeeSelection(employee.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {employee.firstName} {employee.lastName}
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{employee.role}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                        </div>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={employee.basicSalary || ''}
                          onChange={(e) => updateSalaryField(employee.id, 'basicSalary', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-10 py-2 pr-2 border rounded-md ${
                            employee.isSelected 
                              ? 'bg-white dark:bg-gray-700 dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                          }`}
                          disabled={!employee.isSelected}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={employee.overtimePay || ''}
                          onChange={(e) => updateSalaryField(employee.id, 'overtimePay', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-10 py-2 pr-2 border rounded-md ${
                            employee.isSelected 
                              ? 'bg-white dark:bg-gray-700 dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                          }`}
                          disabled={!employee.isSelected}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={employee.bonus || ''}
                          onChange={(e) => updateSalaryField(employee.id, 'bonus', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-10 py-2 pr-2 border rounded-md ${
                            employee.isSelected 
                              ? 'bg-white dark:bg-gray-700 dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                          }`}
                          disabled={!employee.isSelected}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">LKR</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={employee.deductions || ''}
                          onChange={(e) => updateSalaryField(employee.id, 'deductions', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-10 py-2 pr-2 border rounded-md ${
                            employee.isSelected 
                              ? 'bg-white dark:bg-gray-700 dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                          }`}
                          disabled={!employee.isSelected}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">LKR {calculateTotalSalary(employee).toFixed(2)}</span>
                        {employee.isSelected && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Formula: LKR {employee.basicSalary || 0} + LKR {employee.overtimePay || 0} + LKR {employee.bonus || 0} - LKR {employee.deductions || 0}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Salary validation rules */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
              <span>
                <strong>Validation Rules:</strong> Basic salary must be greater than 0. Overtime, bonus, and deductions must be 0 or greater. 
                <br />
                <strong>Calculation Formula:</strong> Total Salary = Basic Salary + Overtime Pay + Bonus - Deductions
                <br />
                <strong>Note:</strong> If this is the first salary for an employee, the basic salary will also be saved to their employee record.
              </span>
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
                  Total payment: <span className="font-medium text-green-600 dark:text-green-400">LKR {
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
                  const resetEmployees = employees.map(emp => ({
                    ...emp,
                    isSelected: false,
                    basicSalary: emp.basicSalary || 0,
                    overtimePay: 0,
                    bonus: 0,
                    deductions: 0
                  }));
                  
                  setEmployees(resetEmployees);
                  setFilteredEmployees(
                    searchQuery 
                      ? resetEmployees.filter(emp => 
                          emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      : resetEmployees
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