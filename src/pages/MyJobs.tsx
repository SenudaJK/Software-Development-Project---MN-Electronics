import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface MyJobsProps {
  employeeId: string;
  role: string;
}

const MyJobs: React.FC<MyJobsProps> = ({ employeeId, role }) => {
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
      // if (!employeeId) {
      //   setError("Employee ID not found. Please log in again.");
      //   navigate("/login");
      //   return;
      // }

      try {
        // Fetch jobs related to the employee ID
        const response = await axios.get(
          `http://localhost:5000/api/jobs/${employeeId}`
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
  }, [employeeId, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      {/* <header className="bg-black text-white py-4 px-6 fixed top-0 left-0 w-full z-50">
        <h1 className="text-lg font-bold">MN Electronics</h1>
      </header> */}

      {/* Main Content */}
      <main className="container mx-auto pt-20 px-4">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">My Jobs</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Job ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Product Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Model
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Customer Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Repair Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Handover Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {job.job_id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {job.product_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {job.model}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {`${job.customer_first_name} ${job.customer_last_name}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {job.repair_description}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {job.repair_status}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {job.handover_date}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                        onClick={() =>
                          navigate(`/job-used-inventory/${job.job_id}`)
                        }
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
                    className="px-4 py-2 text-center text-gray-500"
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