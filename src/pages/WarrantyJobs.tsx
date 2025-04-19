import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WarrantyJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWarrantyJobs();
  }, []);

  const fetchWarrantyJobs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/check/warranty-jobs');
      setJobs(response.data);
    } catch (err: any) {
      console.error('Error fetching warranty jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch warranty jobs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-5xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Warranty-Eligible Jobs</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center items-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {/* Jobs Table */}
        {!isLoading && jobs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Product Name</th>
                  <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Job Description</th>
                  <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Assigned Employee</th>
                  <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Warranty Expiry</th>
                  <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Warranty Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={index} className="border-b border-gray-300 dark:border-gray-600">
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{job.product_name || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{job.repair_description}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{job.assigned_employee || 'None'}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                      {new Date(job.Warranty_Expiry).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        job.warranty_status === 'Expired'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {job.warranty_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Jobs Found */}
        {!isLoading && jobs.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center text-gray-600 dark:text-gray-400">
            No warranty-eligible jobs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyJobs;