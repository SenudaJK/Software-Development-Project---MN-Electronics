import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Briefcase, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown,
  XCircle,
  ArrowRight,
  CalendarClock,
  User,
  Box,
  Wrench,
  Tag,
  RefreshCw
} from "lucide-react";

const MyJobs: React.FC = () => {
  interface Job {
    job_id: string | number; // Explicitly allowing both string and number
    product_name: string;
    model: string | null;
    customer_first_name: string;
    customer_last_name: string;
    repair_description: string;
    repair_status: string;
    handover_date: string;
  }

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  // Stats counters
  const [jobStats, setJobStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cannotRepair: 0,
    paid: 0
  });

  useEffect(() => {
    const fetchEmployeeJobs = async () => {
      setIsLoading(true);
      const employeeData = JSON.parse(sessionStorage.getItem("employee") || "{}");

      if (!employeeData || !employeeData.employeeId) {
        setError("Employee ID not found. Please log in again.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/jobs/${employeeData.employeeId}`
        );
        setJobs(response.data);
        setFilteredJobs(response.data);
        
        // Calculate job statistics
        const stats = {
          total: response.data.length,
          pending: response.data.filter((job: Job) => job.repair_status === "Pending").length,
          inProgress: response.data.filter((job: Job) => job.repair_status === "In Progress").length,
          completed: response.data.filter((job: Job) => job.repair_status === "Completed").length,
          cannotRepair: response.data.filter((job: Job) => job.repair_status === "Cannot Repair").length,
          paid: response.data.filter((job: Job) => job.repair_status === "Paid").length
        };
        setJobStats(stats);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Error fetching jobs");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeJobs();
  }, [navigate]);

  // Filter jobs based on search term and status filter
  useEffect(() => {
    let result = [...jobs];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(job => {
        // Convert everything to strings and handle possible null/undefined values
        const jobId = job.job_id != null ? String(job.job_id).toLowerCase() : '';
        const productName = job.product_name != null ? job.product_name.toLowerCase() : '';
        const model = job.model != null ? job.model.toLowerCase() : '';
        const firstName = job.customer_first_name != null ? job.customer_first_name.toLowerCase() : '';
        const lastName = job.customer_last_name != null ? job.customer_last_name.toLowerCase() : '';
        const fullName = `${firstName} ${lastName}`;
        
        return jobId.includes(lowerSearchTerm) ||
               productName.includes(lowerSearchTerm) ||
               model.includes(lowerSearchTerm) ||
               firstName.includes(lowerSearchTerm) ||
               lastName.includes(lowerSearchTerm) ||
               fullName.includes(lowerSearchTerm);
      });
    }
    
    if (statusFilter) {
      result = result.filter(job => job.repair_status === statusFilter);
    }
    
    setFilteredJobs(result);
    setIsFiltering(!!searchTerm || !!statusFilter);
  }, [jobs, searchTerm, statusFilter]);

  // Add status workflow validation and dynamic status options

  // First, let's update the isTerminalStatus function to also check for "Paid" status
  const isTerminalStatus = (status: string) => {
    return status === "Completed" || status === "Cannot Repair" || status === "Paid";
  };

  // Then, let's update the getAvailableStatuses function to include the Paid status option
  const getAvailableStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "Pending":
        return ["Pending", "In Progress", "Cannot Repair"];
      case "In Progress":
        return ["In Progress", "Completed"];
      case "Completed":
        return ["Completed", "Paid"]; // Completed can move to Paid
      case "Paid":
        return ["Paid"]; // Terminal state
      case "Cannot Repair":
        return ["Cannot Repair", "Paid"]; // Cannot Repair can also be paid
      default:
        return ["Pending", "In Progress", "Completed", "Cannot Repair"];
    }
  };

  // Update the handleStatusChange function to validate workflow
  const handleStatusChange = async (jobId: string, newStatus: string) => {
    // Get the current job status
    const currentJob = jobs.find(job => job.job_id === jobId);
    if (!currentJob) return;
    
    // Check if the new status is allowed based on current status
    const availableStatuses = getAvailableStatuses(currentJob.repair_status);
    if (!availableStatuses.includes(newStatus)) {
      setError(`Cannot change status from ${currentJob.repair_status} to ${newStatus}. Invalid workflow.`);
      return;
    }

    setUpdatingJobId(jobId);
    try {
      await axios.put(`http://localhost:5000/api/jobs/update-status/${jobId}`, {
        repair_status: newStatus,
      });

      // Update the job list after the status change
      const updatedJobs = jobs.map((job) =>
        job.job_id === jobId ? { ...job, repair_status: newStatus } : job
      );
      
      setJobs(updatedJobs);
      
      // Recalculate job statistics
      const stats = {
        total: updatedJobs.length,
        pending: updatedJobs.filter((job) => job.repair_status === "Pending").length,
        inProgress: updatedJobs.filter((job) => job.repair_status === "In Progress").length,
        completed: updatedJobs.filter((job) => job.repair_status === "Completed").length,
        cannotRepair: updatedJobs.filter((job) => job.repair_status === "Cannot Repair").length,
        paid: updatedJobs.filter((job) => job.repair_status === "Paid").length
      };
      setJobStats(stats);

      // Set success message
      setSuccessMessage(`Job #${jobId} status updated to ${newStatus}`);

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating job status:", error);
      setError("Failed to update job status. Please try again.");
      
      // Clear the error message after 4 seconds
      setTimeout(() => {
        setError("");
      }, 4000);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  // Update the getStatusBadgeClass to include a style for "Paid" status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Paid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Cannot Repair":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Update the getStatusIcon function to include an icon for "Paid" status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "In Progress":
        return <RefreshCw className="h-4 w-4 mr-1" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "Paid":
        return <CheckCircle className="h-4 w-4 mr-1" />; // You could import a Dollar/Payment icon instead
      case "Cannot Repair":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <Briefcase className="mr-2" size={24} />
              My Assigned Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage your assigned repair jobs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{jobStats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{jobStats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{jobStats.inProgress}</p>
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
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{jobStats.completed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cannot Repair</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{jobStats.cannotRepair}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{jobStats.paid}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center shadow">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center shadow">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job ID, product name, customer name..."
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-full py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Paid">Paid</option>
                  <option value="Cannot Repair">Cannot Repair</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="sm:w-32">
              <button
                onClick={clearFilters}
                disabled={!isFiltering}
                className={`w-full py-2 px-3 rounded-md flex items-center justify-center ${
                  isFiltering 
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </button>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {isFiltering && (
            <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400">Active filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Search: {searchTerm.length > 15 ? searchTerm.substring(0, 15) + "..." : searchTerm}
                </span>
              )}
              
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Status: {statusFilter}
                </span>
              )}
              
              <span className="ml-auto text-gray-500 dark:text-gray-400">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </span>
            </div>
          )}
        </div>

        {/* Jobs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading jobs...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <Briefcase className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No jobs found</p>
              <p className="text-gray-400 dark:text-gray-500 mt-1">
                {isFiltering ? "Try adjusting your search or filters" : "You don't have any assigned jobs yet"}
              </p>
              {isFiltering && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Job ID
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Received Date
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.job_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-lg dark:bg-blue-900/30 dark:text-blue-300">
                          #{job.job_id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="flex items-center">
                            <Box className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                            <span className="font-medium text-sm">{job.product_name}</span>
                          </div>
                          {job.model && (
                            <div className="flex items-center mt-1">
                              <Tag className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 mr-1.5" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{job.model}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                          <span className="text-sm">
                            {`${job.customer_first_name} ${job.customer_last_name}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                        <div className="truncate">
                          {job.repair_description || "No description provided"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-2">
                          <div className={`px-2 py-1 rounded-md text-xs font-medium inline-flex items-center 
                            ${getStatusBadgeClass(job.repair_status)}
                            ${isTerminalStatus(job.repair_status) ? 'ring-1 ring-gray-300 dark:ring-gray-600' : ''}
                          `}>
                            {getStatusIcon(job.repair_status)}
                            {job.repair_status}
                            {isTerminalStatus(job.repair_status) && (
                              <span className="ml-1 text-xs">{job.repair_status === "Paid" ? "• Finalized" : "• Final"}</span>
                            )}
                          </div>
                          
                          {/* Only show status dropdown if not Paid */}
                          {job.repair_status !== "Paid" && (
                            <>
                              <select
                                value={job.repair_status}
                                onChange={(e) => handleStatusChange(String(job.job_id), e.target.value)}
                                disabled={updatingJobId === job.job_id || isTerminalStatus(job.repair_status)}
                                className={`text-xs mt-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 ${
                                  isTerminalStatus(job.repair_status) 
                                    ? "opacity-60 cursor-not-allowed text-gray-500 dark:text-gray-400" 
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {getAvailableStatuses(job.repair_status).map(status => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              
                              {/* Helper text */}
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {job.repair_status === "Pending" && (
                                  <p>→ In Progress or Cannot Repair</p>
                                )}
                                {job.repair_status === "In Progress" && (
                                  <p>→ Completed when done</p>
                                )}
                                {job.repair_status === "Completed" && (
                                  <p>→ Mark as Paid when payment received</p>
                                )}
                                {job.repair_status === "Cannot Repair" && (
                                  <p>→ Mark as Paid when payment received</p>
                                )}
                                {job.repair_status === "Paid" && (
                                  <p>Job finalized</p>
                                )}
                              </div>
                            </>
                          )}
                          
                          {/* When Paid, just show a confirmation message */}
                          {job.repair_status === "Paid" && (
                            <div className="text-xs flex items-center text-purple-600 dark:text-purple-400 mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Payment received and processed
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                          {formatDate(job.handover_date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={`px-3 py-2 rounded-md text-sm transition flex items-center ${
                            job.repair_status === "In Progress"
                              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                          }`}
                          onClick={() =>
                            job.repair_status === "In Progress" &&
                            navigate(`/job-used-inventory/${job.job_id}`)
                          }
                          disabled={job.repair_status !== "In Progress"} 
                        >
                          {updatingJobId === job.job_id ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4 mr-1" />
                          )}
                          Update Inventory
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobs;