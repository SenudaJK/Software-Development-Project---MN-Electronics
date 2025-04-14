import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyJobs: React.FC = () => {
  interface Job {
    job_id: string;
    product_name: string;
    model: string;
    customer_first_name: string;
    customer_last_name: string;
    repair_description: string;
    repair_status: string;
    handover_date: string;
  }

  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeJobs = async () => {
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
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Error fetching jobs");
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    fetchEmployeeJobs();
  }, [navigate]);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/jobs/update-status/${jobId}`, {
        repair_status: newStatus,
      });

      // Update the job list after the status change
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.job_id === jobId ? { ...job, repair_status: newStatus } : job
        )
      );
    } catch (error) {
      console.error("Error updating job status:", error);
      setError("Failed to update job status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="container mx-auto pt-20 px-4">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          My Jobs
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Job ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Product Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Model
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Customer Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Repair Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Recieved Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.job_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.product_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.model || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {`${job.customer_first_name} ${job.customer_last_name}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {job.repair_description}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      <select
                        value={job.repair_status}
                        onChange={(e) =>
                          handleStatusChange(job.job_id, e.target.value)
                        }
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(job.handover_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        onClick={() => navigate(`/job-used-inventory/${job.job_id}`)}
                      >
                        Update Inventory
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                  >
                    No jobs assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MyJobs;