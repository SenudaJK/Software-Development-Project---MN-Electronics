// Updated JobDetails.tsx with live search feature
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react"; // Make sure to install lucide-react

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

  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from the backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/jobs/get");
        console.log("Fetched Jobs:", response.data); // Debugging
        setJobs(response.data);
        setFilteredJobs(response.data); // Initialize filtered jobs with all jobs
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching jobs:", error.response?.data?.message || error.message);
        setError("Failed to load jobs. Please try again.");
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredJobs(jobs);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = jobs.filter((job) => {
      const customerName = `${job.customer_first_name} ${job.customer_last_name}`.toLowerCase();
      const productName = job.product_name.toLowerCase();
      const description = job.repair_description.toLowerCase();

      return (
        customerName.includes(lowerCaseSearchTerm) ||
        productName.includes(lowerCaseSearchTerm) ||
        description.includes(lowerCaseSearchTerm)
      );
    });

    setFilteredJobs(results);
  }, [searchTerm, jobs]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Navigate to edit page when update button is clicked
  const handleUpdateClick = (jobId: string) => {
    navigate(`/edit-job/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">Job Details</h2>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by customer, product, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm("")}
              >
                <span className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  &times;
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search Results Count */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} matching "{searchTerm}"
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded mb-4">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Job Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Assigned Employee</th>
                <th className="py-3 px-4">Repair Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Handover Date</th>
                <th className="py-3 px-4">Actions</th>
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
                        {job.product_image ? (
                          <img
                            src={job.product_image}
                            alt={job.product_name}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=NA";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">N/A</div>
                        )}
                        <span>{job.product_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{`${job.customer_first_name} ${job.customer_last_name}`}</td>
                    <td className="py-3 px-4">{`${job.employee_first_name || "N/A"} ${
                      job.employee_last_name || ""
                    }`}</td>
                    <td className="py-3 px-4">
                      {/* Highlight matching text in repair description */}
                      {searchTerm && job.repair_description.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                        highlightText(job.repair_description, searchTerm)
                      ) : (
                        job.repair_description
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          job.repair_status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : job.repair_status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : job.repair_status === 'Paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : job.repair_status === 'Cannot Repair'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {job.repair_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{
                      job.handover_date 
                        ? new Date(job.handover_date).toLocaleDateString() 
                        : "Not set"
                    }</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUpdateClick(job.job_id)}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        Update
                      </button>
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
  );
};

// Helper function to highlight matching text
const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  
  const regex = new RegExp(`(${highlight})`, 'gi');
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
};

export default JobDetails;