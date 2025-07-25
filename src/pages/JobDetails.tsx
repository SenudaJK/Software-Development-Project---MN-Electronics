// Enhanced JobDetails.tsx with advanced search, filtering, and improved UI
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar, 
  User, 
  Edit, 
  Package, 
  Trash2,
  Download,
  FileText,
  ArrowUp,
  ArrowDown,
  Wrench,
  ClipboardList,
  Lock // Add Lock icon for disabled buttons
} from "lucide-react";

const JobDetails: React.FC = () => {
  interface Job {
    job_id: string;
    product_name: string;
    model: string;
    product_image: string;
    customer_first_name: string;
    customer_last_name: string;
    employee_first_name: string;
    employee_last_name: string;
    repair_description: string;
    repair_status: string;
    handover_date: string;
  }

  const jobStatuses = [
    "Booking Pending",
    "Booking Approved",
    "Booking Cancelled",
    "Pending",
    "Cannot Repair",
    "In Progress",
    "Completed",
    "Paid",
  ];

  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); 
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  // Added advanced features
  const [sortField, setSortField] = useState<string>("job_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  // Unique lists for filters
  const [customers, setCustomers] = useState<string[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [jobCounts, setJobCounts] = useState<{[key: string]: number}>({});

  // Add user role state
  const [userRole, setUserRole] = useState('');
  
  // Get the current user's role from localStorage
  useEffect(() => {
    try {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      setUserRole(employeeData.role || '');
    } catch (error) {
      console.error('Error parsing employee data:', error);
    }
  }, []);

  // Check if the user can perform actions (not technician)
  const canPerformActions = userRole !== 'technician';

  // Fetch jobs from the backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/jobs/get");
        console.log("Fetched Jobs:", response.data);
        setJobs(response.data);
        setFilteredJobs(response.data);
        
        // Extract unique customers and employees for filter dropdowns
        const uniqueCustomers = Array.from(new Set(
          response.data.map((job: Job) => `${job.customer_first_name} ${job.customer_last_name}`)
        )) as string[];
        
        const uniqueEmployees = Array.from(new Set(
          response.data.map((job: Job) => {
            if (job.employee_first_name) {
              return `${job.employee_first_name} ${job.employee_last_name || ""}`.trim();
            }
            return null;
          }).filter(Boolean)
        )) as string[];
        
        // Calculate job counts by status
        const statusCounts = response.data.reduce((acc: any, job: Job) => {
          acc[job.repair_status] = (acc[job.repair_status] || 0) + 1;
          return acc;
        }, {});
        
        setCustomers(uniqueCustomers);
        setEmployees(uniqueEmployees);
        setJobCounts(statusCounts);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching jobs:", error.response?.data?.message || error.message);
        setError("Failed to load jobs. Please try again.");
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs when search term or selected status changes
  useEffect(() => {
    let results = jobs;    // Text search
    if (searchTerm.trim() !== "") {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = results.filter((job) => {
        try {
          // Safely concatenate customer name with null/undefined check
          const customerName = `${job.customer_first_name || ""} ${job.customer_last_name || ""}`.toLowerCase();
          
          // Safely access properties with null/undefined checks and ensure they are strings
          const productName = typeof job.product_name === 'string' ? job.product_name.toLowerCase() : '';
          const description = typeof job.repair_description === 'string' ? job.repair_description.toLowerCase() : '';
          const jobId = typeof job.job_id === 'string' ? job.job_id.toLowerCase() : String(job.job_id || '').toLowerCase();
          const model = typeof job.model === 'string' ? job.model.toLowerCase() : '';

          // Safely check if searchTerm is included in any field
          return (
            customerName.includes(lowerCaseSearchTerm) ||
            productName.includes(lowerCaseSearchTerm) ||
            description.includes(lowerCaseSearchTerm) ||
            jobId.includes(lowerCaseSearchTerm) ||
            model.includes(lowerCaseSearchTerm)
          );
        } catch (error) {
          console.error("Error filtering job:", error);
          return false; // Skip this job if there's an error
        }
      });
    }

    // Status filter
    if (selectedStatus) {
      results = results.filter((job) => job.repair_status === selectedStatus);
    }
      // Customer filter
    if (selectedCustomer) {
      results = results.filter(
        (job) => `${job.customer_first_name || ""} ${job.customer_last_name || ""}`.trim() === selectedCustomer
      );
    }
    
    // Employee filter
    if (selectedEmployee) {
      results = results.filter(
        (job) => {
          const employeeName = `${job.employee_first_name || ""} ${job.employee_last_name || ""}`.trim();
          return employeeName === selectedEmployee;
        }
      );
    }
    
    // Date range filter
    if (dateRange.start || dateRange.end) {
      results = results.filter((job) => {
        if (!job.handover_date) return false;
        
        const jobDate = new Date(job.handover_date);
        
        if (dateRange.start && dateRange.end) {
          return jobDate >= new Date(dateRange.start) && jobDate <= new Date(dateRange.end);
        } else if (dateRange.start) {
          return jobDate >= new Date(dateRange.start);
        } else if (dateRange.end) {
          return jobDate <= new Date(dateRange.end);
        }
        
        return true;
      });
    }
    
    // Sort results
    results = [...results].sort((a, b) => {
      // Handle string comparisons
      if (sortField === 'customer') {
        const customerA = `${a.customer_first_name} ${a.customer_last_name}`.toLowerCase();
        const customerB = `${b.customer_first_name} ${b.customer_last_name}`.toLowerCase();
        return sortDirection === 'asc' 
          ? customerA.localeCompare(customerB)
          : customerB.localeCompare(customerA);
      }
      
      // Handle date comparisons
      if (sortField === 'handover_date') {
        const dateA = a.handover_date ? new Date(a.handover_date).getTime() : 0;
        const dateB = b.handover_date ? new Date(b.handover_date).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Handle employee name comparison
      if (sortField === 'employee') {
        const employeeA = `${a.employee_first_name || ""} ${a.employee_last_name || ""}`.toLowerCase();
        const employeeB = `${b.employee_first_name || ""} ${b.employee_last_name || ""}`.toLowerCase();
        return sortDirection === 'asc' 
          ? employeeA.localeCompare(employeeB)
          : employeeB.localeCompare(employeeA);
      }
      
      // Handle generic string field comparisons
      if (typeof a[sortField as keyof Job] === 'string') {
        return sortDirection === 'asc' 
          ? String(a[sortField as keyof Job]).localeCompare(String(b[sortField as keyof Job]))
          : String(b[sortField as keyof Job]).localeCompare(String(a[sortField as keyof Job]));
      }
      
      return 0;
    });

    setFilteredJobs(results);
  }, [searchTerm, selectedStatus, selectedCustomer, selectedEmployee, dateRange, jobs, sortField, sortDirection]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Modify the handleUpdateClick function to check permissions
  const handleUpdateClick = (jobId: string) => {
    if (!canPerformActions) {
      setError('Only owners and managers can update jobs.');
      return;
    }
    navigate(`/edit-job/${jobId}`);
  };
  
  // Handle sort click
  const handleSortClick = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle clearing all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedCustomer("");
    setSelectedEmployee("");
    setDateRange({ start: "", end: "" });
  };
  
  // Toggle job details
  const toggleJobDetails = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };
    // Generate status badge based on repair status
  const getStatusBadge = (status: string) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          Unknown
        </span>
      );
    }

    switch(status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Wrench className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Cannot Repair':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Booking Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <RefreshCw className="animate-spin h-5 w-5" />
          <span className="text-lg">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0 flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              Job Management
            </h2>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search Bar */}              <div className="relative w-full md:w-96">                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by customer, product, job ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <span className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      &times;
                    </span>
                  </button>
                )}
              </div>              {/* Filter Toggle */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`flex items-center justify-center px-4 py-2 border ${
                  isFiltersOpen || selectedStatus || selectedCustomer || selectedEmployee || dateRange.start || dateRange.end
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400"
                    : "border-gray-300 bg-white text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                } rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              >
                <Filter className="h-5 w-5 mr-2" />
                {(selectedStatus || selectedCustomer || selectedEmployee || dateRange.start || dateRange.end) ? 
                  "Filters Applied" : "Filters"}
                <ChevronDown className="h-5 w-5 ml-2 text-gray-600 dark:text-gray-200" />
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
              <button 
                className="ml-auto" 
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Permission info for technicians */}
          {!canPerformActions && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md flex items-center text-blue-700 dark:text-blue-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>You are in view-only mode. As a technician, you can view job details but cannot perform actions.</span>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{jobs.length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{jobCounts["In Progress"] || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{jobCounts["Completed"] || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{jobCounts["Pending"] || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>          {/* Filter Panel */}
          {isFiltersOpen && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Repair Status
                  </label>
                  <div className="relative">
                    <select
                      id="statusFilter"
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      {jobStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    </div>
                  </div>
                </div>
                
                {/* Customer Filter */}
                <div>
                  <label htmlFor="customerFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer
                  </label>
                  <div className="relative">
                    <select
                      id="customerFilter"
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                    >                      <option value="">All Customers</option>                      {customers.map((customer) => (
                        <option key={customer} value={customer}>
                          {customer}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    </div>
                  </div>
                </div>
                
                {/* Employee Filter */}
                <div>
                  <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employee
                  </label>
                  <div className="relative">
                    <select
                      id="employeeFilter"
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >                      <option value="">All Employees</option>                      {employees.map((employee) => (
                        <option key={employee} value={employee}>
                          {employee}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                    </div>
                  </div>
                </div>
                
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      placeholder="End Date"
                    />
                  </div>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Search Results & Filter Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search result count */}
            {searchTerm && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Found {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} matching "{searchTerm}"
              </div>
            )}
            
            {/* Active filters indicators */}
            {selectedStatus && (
              <div className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full flex items-center">
                Status: {selectedStatus}
                <button 
                  onClick={() => setSelectedStatus("")}
                  className="ml-1 hover:text-blue-600"
                  aria-label="Remove status filter"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {selectedCustomer && (
              <div className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full flex items-center">
                Customer: {selectedCustomer}
                <button 
                  onClick={() => setSelectedCustomer("")}
                  className="ml-1 hover:text-blue-600"
                  aria-label="Remove customer filter"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {selectedEmployee && (
              <div className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full flex items-center">
                Employee: {selectedEmployee}
                <button 
                  onClick={() => setSelectedEmployee("")}
                  className="ml-1 hover:text-blue-600"
                  aria-label="Remove employee filter"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {(dateRange.start || dateRange.end) && (
              <div className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full flex items-center">
                Date: {dateRange.start} - {dateRange.end}
                <button 
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="ml-1 hover:text-blue-600"
                  aria-label="Remove date range filter"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Job Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <tr>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortClick('job_id')}>
                    Job ID
                    {sortField === 'job_id' && (sortDirection === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />)}
                  </th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortClick('product_name')}>
                    Product
                    {sortField === 'product_name' && (sortDirection === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />)}
                  </th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortClick('customer')}>
                    Customer
                    {sortField === 'customer' && (sortDirection === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />)}
                  </th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortClick('employee')}>
                    Assigned Employee
                    {sortField === 'employee' && (sortDirection === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />)}
                  </th>
                  <th className="py-3 px-4">Repair Description</th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortClick('repair_status')}>
                    Status
                    {sortField === 'repair_status' && (sortDirection === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />)}
                  </th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortClick('handover_date')}>
                    Handover Date
                    {sortField === 'handover_date' && (sortDirection === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr
                      key={job.job_id}
                      className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">{job.job_id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {job.product_image ? (                            <img
                              src={job.product_image || "https://via.placeholder.com/40?text=NA"}
                              alt={job.product_name || "Product"}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=NA";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">N/A</div>
                          )}
                          <span>{job.product_name || "Unnamed Product"}</span>
                        </div>
                      </td>                      <td className="py-3 px-4">{`${job.customer_first_name || ""} ${job.customer_last_name || ""}`}</td>
                      <td className="py-3 px-4">{`${job.employee_first_name || "N/A"} ${
                        job.employee_last_name || ""
                      }`}</td><td className="py-3 px-4">
                        {/* Highlight matching text in repair description with null safety */}
                        {searchTerm && typeof job.repair_description === 'string' && job.repair_description.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                          highlightText(job.repair_description, searchTerm)
                        ) : (
                          job.repair_description || ""
                        )}
                      </td>                      <td className="py-3 px-4">
                        {job.repair_status ? getStatusBadge(job.repair_status) : 
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                           Unknown
                         </span>
                        }
                      </td>                      <td className="py-3 px-4">{
                        job.handover_date 
                          ? (() => {
                              try {
                                return new Date(job.handover_date).toLocaleDateString();
                              } catch (error) {
                                console.error("Invalid date format:", job.handover_date);
                                return "Invalid date";
                              }
                            })()
                          : "Not set"
                      }</td><td className="px-4 py-3">
                        <div className="flex flex-col md:flex-row gap-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateClick(job.job_id)}
                              className={`p-2 ${
                                canPerformActions
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                              } rounded-md focus:outline-none focus:ring focus:ring-blue-300`}
                              disabled={!canPerformActions}
                            >
                              {canPerformActions ? (
                                <Edit className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              <span className="ml-1">Update</span>
                            </button>
                            
                            <button
                              onClick={() => canPerformActions ? navigate(`/view-job-used-inventory/${job.job_id}`) : setError('Only owners and managers can view inventory details.')}
                              className={`p-2 ${
                                canPerformActions
                                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                              } rounded-md focus:outline-none focus:ring focus:ring-purple-300`}
                              disabled={!canPerformActions}
                            >
                              {canPerformActions ? (
                                <ClipboardList className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              <span className="ml-1">View Inventory</span>
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => canPerformActions ? navigate(`/invoice/full-payment?jobId=${job.job_id}`) : setError('Only owners and managers can generate invoices.')}
                              className={`p-2 ${
                                canPerformActions
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                              } rounded-md focus:outline-none focus:ring focus:ring-green-300`}
                              disabled={!canPerformActions}
                            >
                              {canPerformActions ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              <span className="ml-1">Full Invoice</span>
                            </button>
                            <button
                              onClick={() => {
                                if (!canPerformActions) {
                                  setError('Only owners and managers can generate invoices.');
                                  return;
                                }
                                if (!['Booking Cancelled', 'Cannot Repair', 'Paid', 'Completed'].includes(job.repair_status)) {
                                  navigate(`/invoice/advance-payment?jobId=${job.job_id}`);
                                }
                              }}
                              className={`p-2 ${
                                !canPerformActions
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                  : ['Booking Cancelled', 'Cannot Repair', 'Paid', 'Completed'].includes(job.repair_status)
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-amber-500 hover:bg-amber-600 focus:ring focus:ring-amber-300 dark:bg-amber-700 dark:hover:bg-amber-800'
                              } text-white rounded-md focus:outline-none`}
                              disabled={!canPerformActions || ['Booking Cancelled', 'Cannot Repair', 'Paid', 'Completed'].includes(job.repair_status)}
                            >
                              {canPerformActions ? (
                                <Download className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              <span className="ml-1">Advance Invoice</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-3 px-4 text-center">
                      {searchTerm ? `No jobs found matching "${searchTerm}"` : "No jobs found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to highlight matching text
const highlightText = (text: string, highlight: string) => {
  if (!text || !highlight || !highlight.trim()) {
    return <span>{text || ""}</span>;
  }
  
  try {
    // Escape special regex characters to prevent errors
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => (
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </span>
    );
  } catch (error) {
    // If regex fails for any reason, just return the text
    console.error("Error highlighting text:", error);
    return <span>{text}</span>;
  }
};

export default JobDetails;