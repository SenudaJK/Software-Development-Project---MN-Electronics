import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { RefreshCw, Shield, ShieldAlert, ShieldCheck, Clock, Tag, Search, Check, X, FileText, CalendarClock, Package } from 'lucide-react';

const WarrantyJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarrantyJobs();
    
    // Set up polling for automatic refresh
    const intervalId = setInterval(() => {
      fetchWarrantyJobs();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [refreshTrigger]);

  const fetchWarrantyJobs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/check/warranty-jobs');
      setJobs(response.data);
      // Clear selected job when data refreshes
      setSelectedJob(null);
    } catch (err: any) {
      console.error('Error fetching warranty jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch warranty jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimWarranty = () => {
    if (!selectedJob) return;
    navigate(`/register-warranty-claim/${selectedJob.job_id}`);
  };
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Function to determine if a job has a warranty claim associated with it
  const hasWarrantyClaim = (job: any) => {
    return job.repair_status === 'Warranty-Claimed' || 
           (job.related_jobs && job.related_jobs.some((relatedJob: any) => 
             relatedJob.repair_status === 'Warranty-Claimed' || 
             relatedJob.repair_status === 'Pending'));
  };
  
  // Get appropriate warranty status display
  const getWarrantyStatusDisplay = (job: any) => {
    // If job already has a warranty claim or is a warranty claim itself
    if (hasWarrantyClaim(job)) {
      return "Warranty-Claimed";
    }
    // Otherwise show the original status
    return job.warranty_status;
  };
  
  // Check if claim button should be disabled
  const isClaimButtonDisabled = () => {
    if (!selectedJob) return true;
    
    // Disable if warranty is expired or already claimed
    return getWarrantyStatusDisplay(selectedJob) === "Expired" || 
           hasWarrantyClaim(selectedJob);
  };

  // Handle row selection
  const handleRowClick = (job: any) => {
    setSelectedJob(job === selectedJob ? null : job); // Toggle selection
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (job.customer_firstName && job.customer_firstName.toLowerCase().includes(searchLower)) ||
      (job.customer_lastName && job.customer_lastName.toLowerCase().includes(searchLower)) ||
      (job.customer_email && job.customer_email.toLowerCase().includes(searchLower)) ||
      (job.product_name && job.product_name.toLowerCase().includes(searchLower)) ||
      (job.Invoice_Id && job.Invoice_Id.toString().includes(searchTerm))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-7xl bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                Warranty-Eligible Jobs
              </h1>
              <p className="mt-1 text-blue-100">
                Manage and process warranty claims for eligible products
              </p>
            </div>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md flex items-center transition duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <X className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by customer name, email, product, or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
            </div>
          )}

          {/* Selected Job and Actions Panel */}
          {!isLoading && (
            <div className="mb-6">
              {selectedJob ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-blue-100 dark:border-blue-800 flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        {selectedJob.product_name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Model: {selectedJob.model || 'N/A'} {selectedJob.model_number ? `(${selectedJob.model_number})` : ''}
                      </p>
                    </div>
                    
                    <div className="md:text-right">
                      <div className="flex items-center justify-end">
                        <span className="font-medium mr-2 text-gray-700 dark:text-gray-300">Warranty Status:</span>
                        <WarrantyStatusBadge job={selectedJob} />
                      </div>
                      
                      {selectedJob.days_remaining > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-end">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedJob.days_remaining} days remaining
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 p-4">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Customer Details</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedJob.customer_firstName} {selectedJob.customer_lastName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {selectedJob.customer_email}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {selectedJob.customer_phone_numbers && selectedJob.customer_phone_numbers.length > 0
                          ? selectedJob.customer_phone_numbers.join(', ')
                          : 'No phone number'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Warranty Information</h3>
                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Invoice: {selectedJob.Invoice_Id || 'N/A'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        Expires: {selectedJob.formatted_warranty_expiry || 'N/A'}
                      </p>
                      {selectedJob.employee_name && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Technician: {selectedJob.employee_name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 flex justify-end">
                    <button
                      onClick={handleClaimWarranty}
                      disabled={isClaimButtonDisabled()}
                      className={`px-5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isClaimButtonDisabled()
                          ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-gray-400"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500"
                      }`}
                    >
                      {hasWarrantyClaim(selectedJob) 
                        ? "Already Claimed" 
                        : getWarrantyStatusDisplay(selectedJob) === "Expired" 
                          ? "Warranty Expired" 
                          : "Claim Warranty"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
                  <Shield className="h-12 w-12 mx-auto text-blue-500 dark:text-blue-400 mb-3 opacity-75" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Select a Job</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click on any job from the table below to view details and claim warranty
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Jobs Table */}
          {!isLoading && filteredJobs.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium">Customer</th>
                    <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium">Product</th>
                    <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hidden lg:table-cell">Invoice ID</th>
                    <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hidden lg:table-cell">Expiry Date</th>
                    <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, index) => (
                    <tr 
                      key={index} 
                      className={`border-t border-gray-200 dark:border-gray-700 cursor-pointer transition duration-150 ${
                        selectedJob && selectedJob.job_id === job.job_id 
                          ? "bg-blue-50 dark:bg-blue-900/20" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-750"
                      }`}
                      onClick={() => handleRowClick(job)}
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {job.customer_firstName} {job.customer_lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {job.customer_email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {job.product_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                        {job.Invoice_Id || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                        {job.formatted_warranty_expiry || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <WarrantyStatusBadge job={job} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Jobs Found - Empty State */}
          {!isLoading && jobs.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-12 text-center">
              <ShieldAlert className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No Warranty-Eligible Jobs</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                There are currently no jobs with active warranty eligibility. New eligible jobs will appear here when available.
              </p>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && jobs.length > 0 && filteredJobs.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No matching jobs found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search term or clear the search field to see all jobs
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for warranty status badge
const WarrantyStatusBadge = ({ job }: { job: any }) => {
  const status = job.repair_status === 'Warranty-Claimed' || 
                (job.related_jobs && job.related_jobs.some((relatedJob: any) => 
                  relatedJob.repair_status === 'Warranty-Claimed' || 
                  relatedJob.repair_status === 'Pending'))
                ? "Warranty-Claimed"
                : job.warranty_status;

  if (status === "Active") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  } else if (status === "Expired") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        <ShieldAlert className="h-3 w-3 mr-1" />
        Expired
      </span>
    );
  } else if (status === "Warranty-Claimed") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
        <Check className="h-3 w-3 mr-1" />
        Claimed
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        <Tag className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  }
};

export default WarrantyJobs;