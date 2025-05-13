import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { 
  Search, 
  UserCog,
  UserPlus, 
  Trash2, 
  Edit2, 
  RefreshCw,
  X,
  Check,
  ArrowUpDown,
  UserX,
  Download,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  User,
  AlertCircle,
  Filter,
  ChevronDown
} from "lucide-react";

const EmployeeTable = () => {
  interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nic: string;
    role: string;
    email: string;
    phoneNumbers: string; // Comma-separated phone numbers
    employmentType?: string;
  }

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  
  // Sorting
  const [sortField, setSortField] = useState<keyof Employee>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Count of employees by role
  const [roleStats, setRoleStats] = useState<{[key: string]: number}>({});
  const [typeStats, setTypeStats] = useState<{[key: string]: number}>({});

  // Field-specific error states
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // New state to track if form is being validated
  const [isValidating, setIsValidating] = useState(false);

  // Client-side validation function that mirrors backend validation
  const validateEmployeeForm = (employee: Employee): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    
    // First name validation
    if (!employee.firstName) {
      errors.firstName = "First name is mandatory";
    } else if (!/^[a-zA-Z']+$/.test(employee.firstName)) {
      errors.firstName = "First name should only contain letters and ' symbol";
    } else if (employee.firstName.length > 50) {
      errors.firstName = "First name should not exceed 50 characters";
    }
    
    // Last name validation
    if (!employee.lastName) {
      errors.lastName = "Last name is mandatory";
    } else if (!/^[a-zA-Z']+$/.test(employee.lastName)) {
      errors.lastName = "Last name should only contain letters and ' symbol";
    } else if (employee.lastName.length > 50) {
      errors.lastName = "Last name should not exceed 50 characters";
    }
    
    // Email validation
    if (!employee.email) {
      errors.email = "Email is mandatory";
    } else if (!/^\S+@\S+\.\S+$/.test(employee.email)) {
      errors.email = "Invalid email format";
    } else if (employee.email.length > 100) {
      errors.email = "Email should not exceed 100 characters";
    }
    
    // Date of birth validation
    if (!employee.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is mandatory";
    } else {
      const dob = moment(employee.dateOfBirth);
      const now = moment();
      const age = now.diff(dob, "years");
      
      if (!dob.isValid()) {
        errors.dateOfBirth = "Invalid date format";
      } else if (dob.isAfter(now)) {
        errors.dateOfBirth = "Date of birth cannot be a future date";
      } else if (age < 18) {
        errors.dateOfBirth = "Employee must be at least 18 years old";
      }
    }
    
    // NIC validation
    if (!employee.nic) {
      errors.nic = "NIC is mandatory";
    } else if (!/^\d{9}[vVxX]$|^\d{12}$/.test(employee.nic)) {
      errors.nic = "Invalid NIC format";
    } else {
      const dateOfBirth = moment(employee.dateOfBirth);
      if (dateOfBirth.isValid()) {
        const year = dateOfBirth.year();
        const yearString = year.toString();
        
        if (employee.nic.length === 12) {
          // New NIC: First 4 digits must match the full birth year
          if (employee.nic.substring(0, 4) !== yearString) {
            errors.nic = "For new NICs, the first 4 digits must match the birth year";
          }
        } else if (employee.nic.length === 10) {
          // Old NIC: First 2 digits must match the last 2 digits of the birth year
          if (employee.nic.substring(0, 2) !== yearString.substring(2, 4)) {
            errors.nic = "For old NICs, the first 2 digits must match the last 2 digits of the birth year";
          }
        }
      }
    }
    
    // Role validation
    if (!employee.role) {
      errors.role = "Role is mandatory";
    } else if (!["technician", "owner"].includes(employee.role)) {
      errors.role = "Role must be either 'technician' or 'owner'";
    }
    
    // Employment type validation
    if (!employee.employmentType) {
      errors.employmentType = "Employment type is mandatory";
    } else if (!["Full-Time", "Part-Time"].includes(employee.employmentType)) {
      errors.employmentType = "Employment type must be either 'Full-Time' or 'Part-Time'";
    }
    
    // Phone numbers validation
    if (employee.phoneNumbers) {
      const phones = employee.phoneNumbers
        .split(',')
        .map(phone => phone.trim())
        .filter(phone => phone !== "");
      
      for (let phone of phones) {
        if (!/^07\d{8}$/.test(phone)) {
          errors.phoneNumbers = "Telephone number should contain 10 digits and start with 07";
          break;
        }
      }
    }
    
    return errors;
  };

  // Fetch employees from the backend
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/employees/all");
        
        // Transform the data to handle employment_type field
        const transformedData = response.data.map((emp: any) => ({
          ...emp,
          employmentType: emp.employment_type // Add this line to map from backend field
        }));
        
        setEmployees(transformedData);
        setFilteredEmployees(transformedData);
        
        // Calculate stats
        const roles: {[key: string]: number} = {};
        const types: {[key: string]: number} = {};
        
        transformedData.forEach((emp: Employee) => {
          // Count roles
          if (emp.role) {
            roles[emp.role] = (roles[emp.role] || 0) + 1;
          }
          
          // Count employment types
          if (emp.employmentType) {
            types[emp.employmentType] = (types[emp.employmentType] || 0) + 1;
          }
        });
        
        setRoleStats(roles);
        setTypeStats(types);
      } catch (error: any) {
        console.error("Error fetching employees:", error.response?.data?.message || error.message);
        setError("Failed to fetch employees. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter and sort employees
  useEffect(() => {
    let result = [...employees];
    
    // Apply search filter
    if (search) {
      result = result.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
          employee.email.toLowerCase().includes(search.toLowerCase()) ||
          employee.id.toLowerCase().includes(search.toLowerCase()) ||
          employee.nic.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      result = result.filter(employee => employee.role === roleFilter);
    }
    
    // Apply employment type filter
    if (employmentTypeFilter) {
      result = result.filter(employee => employee.employmentType === employmentTypeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortField === "dateOfBirth") {
        // Date sorting
        const aDate = new Date(aValue || "");
        const bDate = new Date(bValue || "");
        return sortDirection === "asc" 
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        // String sorting
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        return sortDirection === "asc" 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      }
    });
    
    setFilteredEmployees(result);
  }, [employees, search, roleFilter, employmentTypeFilter, sortField, sortDirection]);

  // Handle Update Button Click
  const handleUpdateClick = async (employeeId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      
      // Log the response from the server
      console.log("Employee data from server:", response.data);
      console.log("Employment type from server:", response.data.employment_type);
      
      setSelectedEmployee({
        id: response.data.id || "",
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        dateOfBirth: moment(response.data.dateOfBirth).format("YYYY-MM-DD"),
        nic: response.data.nic || "",
        role: response.data.role || "",
        email: response.data.email || "",
        phoneNumbers: response.data.phoneNumbers || "",
        employmentType: response.data.employment_type || "", // Use employment_type from backend
      });
      
      // Log the selected employee after setting state
      console.log("Selected employee after state update:", selectedEmployee);
      
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error("Error fetching employee details:", error.response?.data?.message || error.message);
      setError("Failed to fetch employee details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Button Click
  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsConfirmDialogOpen(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/employees/${employeeToDelete}`);
        
        // Remove the deleted employee from the state
        setEmployees((prevEmployees) =>
          prevEmployees.filter((employee) => employee.id !== employeeToDelete)
        );

        // Show success message
        setMessage("Employee deleted successfully!");
        setError("");
        setIsConfirmDialogOpen(false);
        setEmployeeToDelete(null);

        // Clear the success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } catch (error: any) {
        console.error("Error deleting employee:", error.response?.data?.message || error.message);
        setError("Failed to delete employee. Please try again.");
        setIsConfirmDialogOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setEmployeeToDelete(null);
  };

  // Handle Save Button in Dialog
  const handleDialogSave = async () => {
    if (selectedEmployee) {
      // Clear previous messages and errors
      setError("");
      setMessage("");
      setFormErrors({});
      setIsValidating(true);
      
      // Perform client-side validation first
      const validationErrors = validateEmployeeForm(selectedEmployee);
      
      if (Object.keys(validationErrors).length > 0) {
        // If there are validation errors, display them and don't submit
        setFormErrors(validationErrors);
        setError("Please fix the validation errors below.");
        setIsValidating(false);
        return;
      }
      
      // Proceed with the API call if validation passes
      setIsLoading(true);
      
      try {
        // Format data according to backend expectations
        const phoneNumbersArray = selectedEmployee.phoneNumbers
          .split(',')
          .map(phone => phone.trim())
          .filter(phone => phone !== "");
        
        const payload = {
          ...selectedEmployee,
          dateOfBirth: moment(selectedEmployee.dateOfBirth).format("YYYY-MM-DD"),
          phoneNumbers: phoneNumbersArray,
          employment_type: selectedEmployee.employmentType, // Map from frontend to backend field name
        };
        
        const response = await axios.put(
          `http://localhost:5000/api/employees/${selectedEmployee.id}`,
          payload
        );
        
        setMessage(response.data.message || "Employee updated successfully");
        setIsDialogOpen(false);

        // Refresh the employee list
        const updatedEmployees = await axios.get("http://localhost:5000/api/employees/all");
        
        // Transform the refreshed data
        const transformedData = updatedEmployees.data.map((emp: any) => ({
          ...emp,
          employmentType: emp.employment_type
        }));
        
        setEmployees(transformedData);
      } catch (error: any) {
        console.error("Error updating employee:", error);
        
        // Handle validation errors from the server
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          
          // Create a mapping of field-specific errors
          const newFormErrors: { [key: string]: string } = {};
          
          // Process each validation error
          validationErrors.forEach((err: any) => {
            // Map backend field names to frontend field names if needed
            const fieldName = err.param === "employment_type" ? "employmentType" : err.param;
            newFormErrors[fieldName] = err.msg;
          });
          
          // Set field-specific errors
          setFormErrors(newFormErrors);
          
          // Also set a general error message
          setError("Please fix the validation errors below.");
        } else if (error.response?.data?.message) {
          // Handle specific error message from backend (like "Email or NIC already exists")
          setError(error.response.data.message);
        } else {
          // Generic error
          setError("Failed to update employee. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  };

  // Export employees to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Employee ID",
      "First Name",
      "Last Name",
      "Date of Birth",
      "NIC",
      "Role",
      "Email",
      "Phone Numbers",
      "Employment Type"
    ].join(",");
    
    const rows = filteredEmployees.map(emp => [
      emp.id,
      `"${emp.firstName}"`,
      `"${emp.lastName}"`,
      emp.dateOfBirth,
      emp.nic,
      emp.role,
      emp.email,
      `"${emp.phoneNumbers}"`,
      emp.employmentType
    ].join(","));
    
    const csvContent = [headers, ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle sorting
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setEmploymentTypeFilter("");
    setSortField("id");
    setSortDirection("asc");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Check if any filter is active
  const isFilterActive = search || roleFilter || employmentTypeFilter || sortField !== "id" || sortDirection !== "asc";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <UserCog className="mr-2" size={28} /> 
              Employee Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View, edit and manage employee information
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredEmployees.length === 0 || isLoading}
              className={`flex items-center px-4 py-2 rounded-lg 
                ${filteredEmployees.length === 0 || isLoading 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                }
                border border-green-200 dark:border-green-800 transition-colors`}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </button>
            
            <a
              href="/add-employee"
              className="flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Employee
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">{employees.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Technicians</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                  {roleStats['technician'] || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full-Time Employees</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                  {typeStats['Full-Time'] || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Success and Error Messages */}
        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Box - takes more space */}
            <div className="relative lg:flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee name, ID, email, NIC..."
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Role Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full h-full py-2.5 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Roles</option>
                  <option value="technician">Technician</option>
                  <option value="owner">Owner</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Employment Type Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <select
                  value={employmentTypeFilter}
                  onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                  className="w-full h-full py-2.5 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            <div className="lg:w-40">
              <button
                onClick={clearFilters}
                disabled={!isFilterActive}
                className={`w-full py-2.5 flex items-center justify-center rounded-lg ${
                  isFilterActive 
                    ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50"
                    : "text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Active Filter Indicators */}
          {isFilterActive && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                
                {search && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Search: {search.length > 20 ? search.substring(0, 20) + "..." : search}
                    <button 
                      onClick={() => setSearch("")}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {roleFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Role: {roleFilter}
                    <button 
                      onClick={() => setRoleFilter("")}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {employmentTypeFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Employment Type: {employmentTypeFilter}
                    <button 
                      onClick={() => setEmploymentTypeFilter("")}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {(sortField !== "id" || sortDirection !== "asc") && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Sorted by: {sortField} ({sortDirection})
                  </span>
                )}
                
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Employee Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center p-10">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading employee data...</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500 dark:text-gray-400">
              <UserX className="h-12 w-12" />
              <p className="mt-4">No employees found matching your criteria</p>
              {isFilterActive && (
                <button 
                  onClick={clearFilters} 
                  className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <tr>
                      <th onClick={() => handleSort("id")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          Employee ID
                          {sortField === "id" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort("firstName")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          Name
                          {sortField === "firstName" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort("dateOfBirth")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          Date of Birth
                          {sortField === "dateOfBirth" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort("nic")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          NIC
                          {sortField === "nic" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort("role")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          Role
                          {sortField === "role" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort("employmentType")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          Type
                          {sortField === "employmentType" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th onClick={() => handleSort("email")} className="py-3 px-4 cursor-pointer">
                        <div className="flex items-center">
                          Contact
                          {sortField === "email" && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                            {employee.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {employee.firstName} {employee.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                            {moment(employee.dateOfBirth).format("MMM DD, YYYY")}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                            {employee.nic}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.role === 'technician' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          }`}>
                            {employee.role ? employee.role.charAt(0).toUpperCase() + employee.role.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.employmentType === 'Full-Time' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {employee.employmentType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                              <span className="text-gray-700 dark:text-gray-300">{employee.email}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                              <span className="text-gray-700 dark:text-gray-300">{employee.phoneNumbers}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleUpdateClick(employee.id)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                              title="Edit Employee"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredEmployees.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredEmployees.length}</span> employees
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 
                          dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === 1
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page number buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 
                          ? i + 1
                          : currentPage >= totalPages - 2 
                            ? totalPages - 4 + i
                            : currentPage - 2 + i;

                        if (pageNum <= totalPages && pageNum > 0) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600
                                ${
                                  currentPage === pageNum
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                } text-sm font-medium`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 
                          dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === totalPages || totalPages === 0
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Dialog */}
      {isDialogOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Update Employee</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                    {formErrors.firstName && (
                      <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.firstName}
                    onChange={(e) =>
                      setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                      ${formErrors.firstName 
                        ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                        : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                      dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                    {formErrors.lastName && (
                      <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.lastName}
                    onChange={(e) =>
                      setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                      ${formErrors.lastName 
                        ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                        : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                      dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  Date of Birth
                  {formErrors.dateOfBirth && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                </label>
                <input
                  type="date"
                  value={selectedEmployee.dateOfBirth}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, dateOfBirth: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                    ${formErrors.dateOfBirth 
                      ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                    dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.dateOfBirth}</p>
                )}
              </div>

              {/* NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="inline-block mr-1 h-4 w-4" />
                  NIC
                  {formErrors.nic && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={selectedEmployee.nic}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, nic: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                    ${formErrors.nic 
                      ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                    dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                />
                {formErrors.nic && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.nic}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: 9 digits followed by V/X or 12 digits
                </p>
                {selectedEmployee.dateOfBirth && selectedEmployee.nic && (
                  formErrors.nic?.includes("match the birth year") ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 mt-2">
                      <div className="flex">
                        <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            NIC and date of birth mismatch:
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                            {selectedEmployee.nic.length === 12 
                              ? `First 4 digits should match birth year ${moment(selectedEmployee.dateOfBirth).format("YYYY")}`
                              : `First 2 digits should match last 2 digits of birth year ${moment(selectedEmployee.dateOfBirth).format("YY")}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Briefcase className="inline-block mr-1 h-4 w-4" />
                  Role
                  {formErrors.role && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                </label>
                <select
                  value={selectedEmployee.role}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, role: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                    ${formErrors.role 
                      ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                    dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                >
                  <option value="">Select Role</option>
                  <option value="technician">Technician</option>
                  <option value="owner">Owner</option>
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.role}</p>
                )}
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type
                  {formErrors.employmentType && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employment_type"
                      value="Full-Time"
                      checked={selectedEmployee.employmentType === "Full-Time"}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, employmentType: e.target.value })
                      }
                      className={`mr-2 ${formErrors.employmentType ? "text-red-500" : "text-blue-500"}`}
                    />
                    <span className="text-gray-800 dark:text-gray-300">Full-Time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employment_type"
                      value="Part-Time"
                      checked={selectedEmployee.employmentType === "Part-Time"}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, employmentType: e.target.value })
                      }
                      className={`mr-2 ${formErrors.employmentType ? "text-red-500" : "text-blue-500"}`}
                    />
                    <span className="text-gray-800 dark:text-gray-300">Part-Time</span>
                  </label>
                </div>
                {formErrors.employmentType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.employmentType}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Mail className="inline-block mr-1 h-4 w-4" />
                  Email
                  {formErrors.email && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                </label>
                <input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                    ${formErrors.email 
                      ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                    dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </div>

              {/* Phone Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="inline-block mr-1 h-4 w-4" />
                  Phone Numbers 
                  {formErrors.phoneNumbers && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                  <span className="text-xs text-gray-500 ml-1">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={selectedEmployee.phoneNumbers}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, phoneNumbers: e.target.value })
                  }
                  placeholder="e.g. 0712345678, 0767654321"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                    ${formErrors.phoneNumbers 
                      ? "border-red-500 focus:ring-red-500 dark:border-red-700" 
                      : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"}
                    dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white`}
                />
                {formErrors.phoneNumbers && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.phoneNumbers}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Phone numbers must start with 07 and be 10 digits long
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                disabled={isLoading || isValidating}
              >
                Cancel
              </button>
              <button
                onClick={handleDialogSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                disabled={isLoading || isValidating}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isValidating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this employee? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;