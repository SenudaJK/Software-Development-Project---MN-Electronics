import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AdvanceInvoice = () => {
  const [jobId, setJobId] = useState('');
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get employee data from localStorage
  const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
  const { id: ownerId, role } = employeeData;
  // Check authorization on component mount and handle URL parameters
  useEffect(() => {
    if (!employeeData || !employeeData.id) {
      // Not logged in
      setError('You must be logged in to create invoices');
      setIsAuthorized(false);
      return;
    }

    if (role !== 'owner') {
      // Not owner
      setError('Only owners can create invoices');
      setIsAuthorized(false);
      return;
    }

    // User is logged in and is an owner
    setIsAuthorized(true);
      // Get jobId from URL query parameters if available
    const params = new URLSearchParams(location.search);
    const jobIdParam = params.get('jobId');
    
    // Only set jobId and fetch if it's different from current jobId
    if (jobIdParam && jobIdParam !== jobId) {
      setJobId(jobIdParam);
      
      // Only fetch if we don't already have details for this job
      if (!jobDetails || jobDetails.job_id !== jobIdParam) {
        fetchJobDetails(jobIdParam);
      }
    }
  }, [employeeData, role, location.search, jobId, jobDetails, isAuthorized]);  // Fetch job details by Job ID
  const fetchJobDetails = async (id?: string) => {
    if (!isAuthorized) return;
    
    const jobIdToUse = id || jobId;
    if (!jobIdToUse) return;
    
    // Validate job ID format
    if (!/^\d+$/.test(jobIdToUse)) {
      setError('Please enter a valid Job ID (numbers only)');
      return;
    }    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/jobs/job-details/${jobIdToUse}`);
        // Check if job status is eligible for advance invoice
      const ineligibleStatuses = ['Booking Cancelled', 'Cannot Repair', 'Paid', 'Completed'];
      if (ineligibleStatuses.includes(response.data.repair_status)) {
        setError(`Cannot create advance invoice for jobs with status "${response.data.repair_status}".`);
        setJobDetails(null);
        return;
      }
      
      if (response.data.invoiceExists) {
        setError(`An advance payment already exists for Job ID ${jobIdToUse}. Please use a different Job ID.`);
        setJobDetails(null);
      } else {
        setJobDetails(response.data);
        setError('');
      }
    } catch (err: any) {
      setJobDetails(null);
      
      // More specific error messages
      if (err.response?.status === 404) {
        setError('Job ID not found. Please check and try again.');
      } else if (err.response?.status === 409) {
        setError('An advance payment already exists for this job.');
      } else {
        setError(err.response?.data?.message || 'Error fetching job details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add advance amount to the invoice
  const handleAddAdvance = async () => {
    if (!isAuthorized) {
      setError('You are not authorized to create invoices');
      return;
    }
    
    if (!jobDetails) {
      setError('Please fetch job details first');
      return;
    }
    
    if (!advanceAmount || isNaN(Number(advanceAmount))) {
      setError('Please enter a valid advance amount');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/invoices/add-advance', {
        jobId,
        advanceAmount,
        ownerId,
      });
      setMessage(response.data.message);
      setError('');
    } catch (err: any) {
      setMessage('');
      setError(err.response?.data?.message || 'Error adding advance amount');
    }
  };

  // Redirect to login if not logged in
  const redirectToLogin = () => {
    navigate('/login');
  };

  // Show unauthorized message if not owner
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center items-center">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {!employeeData || !employeeData.id
              ? 'You must be logged in to create invoices.'
              : 'Only owners can create invoices.'}
          </p>
          {(!employeeData || !employeeData.id) && (
            <button
              onClick={redirectToLogin}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Go to Login
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-3 py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-4xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Invoice for Advance Payment
        </h2>

        {/* Job Details Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Job Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Job ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter Job ID"
                />                <button
                  onClick={() => fetchJobDetails()}
                  className="absolute right-2 top-2 text-gray-500 dark:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16l-4-4m0 0l4-4m-4 4h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {jobDetails && (
            <div className="mt-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Product Name:</strong> {jobDetails.product_name}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Model Number:</strong> {jobDetails.model_number}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Repair Description:</strong> {jobDetails.repair_description}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Customer Name:</strong> {jobDetails.customer_name}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Email:</strong> {jobDetails.email}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Phone Numbers:</strong> {jobDetails.phone_numbers}
              </p>
            </div>
          )}          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Billing Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Billing Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Advance Amount
            </label>
            <input
              type="text"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter Advance Amount"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setJobId('');
              setJobDetails(null);
              setAdvanceAmount('');
              setMessage('');
              setError('');
            }}
            className="w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAddAdvance}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Save Invoice
          </button>
        </div>

        {/* Success Message */}
        {message && (
          <p className="text-sm text-green-500 mt-4">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvanceInvoice;