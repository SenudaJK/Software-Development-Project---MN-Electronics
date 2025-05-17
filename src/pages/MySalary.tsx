import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  FileText,
  Download,
  Percent,
  Minus,
  Plus,
  CreditCard
} from "lucide-react";

const MySalary = () => {
  interface SalaryDetail {
    Payment_Date: string;
    Base_Salary?: number;
    Overtime_Pay?: number;
    Bonus?: number;
    Deductions?: number;
    Total_Salary: number;
    Payment_Status?: string;
    Payment_Method?: string;
    Description?: string;
    Hours_Worked?: number;
    Overtime_Hours?: number;
  }

  interface SalarySummary {
    totalSalary: number;
    averageSalary: number;
    highestSalary: number;
    totalBonus: number;
    totalOvertime: number;
  }
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [salaryStats, setSalaryStats] = useState<SalarySummary>({
    totalSalary: 0,
    averageSalary: 0,
    highestSalary: 0,
    totalBonus: 0,
    totalOvertime: 0
  });
  useEffect(() => {
    const fetchEmployeeSalary = async () => {
      // Retrieve the logged-in employee's ID from sessionStorage
      const employeeData = JSON.parse(sessionStorage.getItem("employee") || "{}");
      
      // Create a properly formatted name property if it doesn't exist
      if (!employeeData.name && (employeeData.firstName || employeeData.lastName)) {
        employeeData.name = `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim();
      }
      
      setEmployee(employeeData);

      if (!employeeData || !employeeData.employeeId) {
        setError("Employee ID not found. Please log in again.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/salary/salary/${employeeData.employeeId}?year=${selectedYear}`
        );        
        const salaryData = response.data.salaryDetails || [];
        setSalaryDetails(salaryData);
        setTotalSalary(parseFloat(response.data.totalSalary) || 0);        // If the response includes employee data, update it
        if (response.data.employee) {
          const apiEmployeeData = response.data.employee;
          
          // Create a properly formatted name property if it doesn't exist
          if (!apiEmployeeData.name && (apiEmployeeData.firstName || apiEmployeeData.lastName)) {
            apiEmployeeData.name = `${apiEmployeeData.firstName || ''} ${apiEmployeeData.lastName || ''}`.trim();
          }
          
          setEmployee((prevEmployee: any) => ({
            ...prevEmployee,
            ...apiEmployeeData
          }));
        }
        
        // Calculate statistics
        if (salaryData.length > 0) {
          const totalSalaryAmount = salaryData.reduce((sum: number, item: SalaryDetail) => 
            sum + parseFloat(item.Total_Salary.toString()), 0);
          
          const averageSalary = totalSalaryAmount / salaryData.length;
          
          const highestSalary = Math.max(...salaryData.map((item: SalaryDetail) => 
            parseFloat(item.Total_Salary.toString())));
          
          const totalBonus = salaryData.reduce((sum: number, item: SalaryDetail) => 
            sum + parseFloat((item.Bonus || 0).toString()), 0);
          
          const totalOvertime = salaryData.reduce((sum: number, item: SalaryDetail) => 
            sum + parseFloat((item.Overtime_Pay || 0).toString()), 0);
          
          setSalaryStats({
            totalSalary: totalSalaryAmount,
            averageSalary,
            highestSalary,
            totalBonus,
            totalOvertime
          });
        }
      } catch (err: any) {
        console.error("Error fetching salary details:", err);
        setError(err.response?.data?.message || "Failed to fetch salary details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeSalary();
  }, [selectedYear]);

  const toggleRowExpansion = (index: number) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  // Function to get all months
  const getAllMonths = () => {
    return [
      { value: 0, label: "January" },
      { value: 1, label: "February" },
      { value: 2, label: "March" },
      { value: 3, label: "April" },
      { value: 4, label: "May" },
      { value: 5, label: "June" },
      { value: 6, label: "July" },
      { value: 7, label: "August" },
      { value: 8, label: "September" },
      { value: 9, label: "October" },
      { value: 10, label: "November" },
      { value: 11, label: "December" }
    ];
  };

  // Function to filter salary details by month
  const getFilteredSalaryDetails = () => {
    if (selectedMonth === null) {
      return salaryDetails;
    }
    
    return salaryDetails.filter(salary => {
      const salaryDate = new Date(salary.Payment_Date);
      return salaryDate.getMonth() === selectedMonth;
    });
  };

  // Function to get available years (current year and past 4 years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
  };

  // Function to format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "Rs. 0.00";
    return `Rs. ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Function to get month name from date
  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long' });
  };

  // Function to generate mock PDF payslip (in a real app this would download a real PDF)
  const downloadPayslip = (paymentDate: string) => {
    alert(`Downloading payslip for ${new Date(paymentDate).toLocaleDateString()}`);
    // In a real implementation, this would trigger a backend API call to generate and download a PDF
  };

  // Status badge styles
  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // New function to categorize monthly salary
  const getSalaryCategory = (amount: number) => {
    if (amount >= 100000) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (amount >= 75000) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (amount >= 50000) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-300";
  };

  // Function to get salary category label
  const getSalaryCategoryLabel = (amount: number) => {
    if (amount >= 100000) return "High";
    if (amount >= 75000) return "Above Average";
    if (amount >= 50000) return "Average";
    return "Entry";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <DollarSign className="mr-2" size={28} />
              My Salary & Compensation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and track your salary payments and compensation
            </p>          </div>            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-gray-700 dark:text-gray-300 font-medium">
                Year: {selectedYear}
              </div>
              <div>                <select
                  value={selectedMonth !== null ? selectedMonth : ""}
                  onChange={(e) => setSelectedMonth(e.target.value === "" ? null : parseInt(e.target.value))}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-200 text-sm"
                >
                  <option value="">All Months</option>
                  {getAllMonths().map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                {selectedMonth !== null && (
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading salary data...</span>
          </div>
        )}

        {!isLoading && salaryDetails.length > 0 && getFilteredSalaryDetails().length > 0 && (
          <>
            {/* Salary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Earnings ({selectedYear})</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{formatCurrency(salaryStats.totalSalary)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Average Monthly</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{formatCurrency(salaryStats.averageSalary)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Highest Monthly</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{formatCurrency(salaryStats.highestSalary)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Bonus</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{formatCurrency(salaryStats.totalBonus)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Overtime</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{formatCurrency(salaryStats.totalOvertime)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Employee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{employee.employeeId || "N/A"}</p>
                </div>                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {employee.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{employee.role || "N/A"}</p>
                </div>                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employment Type</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{employee.employmentType || "Full Time"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Direct Deposit</p>
                </div>
              </div>
            </div>

            {/* Salary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Salary History for {selectedYear} {selectedMonth !== null ? `- ${getAllMonths().find(m => m.value === selectedMonth)?.label}` : ''}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Month
                      </th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Base Salary
                      </th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Overtime
                      </th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Bonus
                      </th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Deductions
                      </th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Net Salary
                      </th>
                      <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold tracking-wider">
                        Category
                      </th>
                    </tr>                  </thead>
                  <tbody>
                    {getFilteredSalaryDetails().map((salary, index) => (
                      <React.Fragment key={index}>
                        <tr className={`border-b border-gray-200 dark:border-gray-700 
                          ${expandedRow === index ? 'bg-blue-50 dark:bg-blue-900/10' : 
                          'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <button 
                                onClick={() => toggleRowExpansion(index)} 
                                className="hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                              >
                                {getMonthName(salary.Payment_Date)}, {new Date(salary.Payment_Date).getDate()}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                            {formatCurrency(salary.Base_Salary || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                            {formatCurrency(salary.Overtime_Pay || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                            {formatCurrency(salary.Bonus || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200 text-red-600 dark:text-red-400">
                            -{formatCurrency(salary.Deductions || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200 font-semibold">
                            {formatCurrency(salary.Total_Salary)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(salary.Payment_Status)}`}>
                              {salary.Payment_Status || "Paid"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSalaryCategory(salary.Total_Salary)}`}>
                              {getSalaryCategoryLabel(salary.Total_Salary)}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded details row */}
                        {expandedRow === index && (
                          <tr className="bg-gray-50 dark:bg-gray-700/30">
                            <td colSpan={8} className="px-4 py-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    Working Hours
                                  </h3>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Regular Hours:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {salary.Hours_Worked || 160} hrs
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Overtime Hours:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {salary.Overtime_Hours || 0} hrs
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Hourly Rate:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {formatCurrency((salary.Base_Salary || 0) / (salary.Hours_Worked || 160))}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <Minus className="h-4 w-4 mr-1.5" />
                                    Deduction Details
                                  </h3>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {formatCurrency((salary.Deductions || 0) * 0.7)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Insurance:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {formatCurrency((salary.Deductions || 0) * 0.2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Other:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {formatCurrency((salary.Deductions || 0) * 0.1)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <CreditCard className="h-4 w-4 mr-1.5" />
                                    Payment Details
                                  </h3>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Method:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {salary.Payment_Method || "Direct Deposit"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {new Date(salary.Payment_Date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                                      <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {`SAL${new Date(salary.Payment_Date).getMonth() + 1}${new Date(salary.Payment_Date).getFullYear()}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {salary.Description && (
                                <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FileText className="h-4 w-4 mr-1.5" />
                                    Notes
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {salary.Description}
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-3 flex justify-end">
                                <button 
                                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  onClick={() => downloadPayslip(salary.Payment_Date)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download Payslip
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                    Showing {getFilteredSalaryDetails().length} of {salaryDetails.length} payment records for {selectedYear}
                    {selectedMonth !== null ? ` - ${getAllMonths().find(m => m.value === selectedMonth)?.label}` : ''}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                      {selectedMonth !== null ? 'Month' : 'Year'} Total:
                    </span>
                    {formatCurrency(getFilteredSalaryDetails().reduce((sum, item) => 
                      sum + parseFloat(item.Total_Salary.toString()), 0))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}        {/* No Salary Found */}
        {!isLoading && ((salaryDetails.length === 0 && !error) || (getFilteredSalaryDetails().length === 0 && salaryDetails.length > 0)) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">No Salary Records</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {salaryDetails.length === 0 ? 
                `We couldn't find any salary records for ${selectedYear}.` :
                `No records found for ${getAllMonths().find(m => m.value === selectedMonth)?.label} ${selectedYear}.`
              }
              {salaryDetails.length === 0 ? 
                ' Try selecting a different year or contact HR if you believe this is an error.' : 
                ''
              }
            </p>            
            <div className="mt-6 flex flex-col items-center space-y-3">
              {salaryDetails.length === 0 ? (
                // When no records for the year
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-200"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              ) : (
                // When records exist for the year but not for the selected month
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Show All Months
                </button>
              )}
              
              {salaryDetails.length === 0 && (
                <button
                  onClick={() => setSelectedYear(new Date().getFullYear())}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Current Year
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySalary;