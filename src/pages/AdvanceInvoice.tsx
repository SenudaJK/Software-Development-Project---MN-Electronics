import React, { useState } from 'react';
import axios from 'axios';

const AdvanceInvoice = () => {
  const [jobId, setJobId] = useState('');
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Retrieve ownerId from localStorage
  const ownerId = JSON.parse(localStorage.getItem('employee') || '{}').id;

  // Fetch job details by Job ID
  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/job-details/${jobId}`);
      setJobDetails(response.data);
      setError('');
    } catch (err: any) {
      setJobDetails(null);
      setError(err.response?.data?.message || 'Error fetching job details');
    }
  };

  // Add advance amount to the invoice
  const handleAddAdvance = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/invoices/add-advance', {
        jobId,
        advanceAmount,
        ownerId, // Include ownerId in the request body
      });
      setMessage(response.data.message);
      setError('');
    } catch (err: any) {
      setMessage('');
      setError(err.response?.data?.message || 'Error adding advance amount');
    }
  };

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
                />
                <button
                  onClick={fetchJobDetails}
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
          )}

          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
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

        {/* Success/Error Message */}
        {message && (
          <p className="text-sm text-green-500 mt-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvanceInvoice;