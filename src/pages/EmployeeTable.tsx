import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

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
    employmentType?: string; // Added employmentType
  }

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch employees from the backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees/all");
        console.log("Fetched Employees:", response.data); // Debugging
        setEmployees(response.data);
      } catch (error: any) {
        console.error("Error fetching employees:", error.response?.data?.message || error.message);
      }
    };

    fetchEmployees();
  }, []);

  // Handle Update Button Click
  const handleUpdateClick = async (employeeId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      console.log("Fetched Employee Details:", response.data); // Debugging
      setSelectedEmployee({
        id: response.data.id || "",
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        dateOfBirth: moment(response.data.dateOfBirth).format("YYYY-MM-DD"), // Format dateOfBirth
        nic: response.data.nic || "",
        role: response.data.role || "",
        email: response.data.email || "",
        phoneNumbers: response.data.phoneNumbers || "", // Ensure phoneNumbers is a string
        employmentType: response.data.employmentType || "", // Added employmentType
      });
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error("Error fetching employee details:", error.response?.data?.message || error.message);
    }
  };

  // Handle Delete Button Click
  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsConfirmDialogOpen(true); // Open confirmation dialog
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/employees/${employeeToDelete}`);
        console.log("Delete Response:", response.data); // Debugging

        // Remove the deleted employee from the state
        setEmployees((prevEmployees) =>
          prevEmployees.filter((employee) => employee.id !== employeeToDelete)
        );

        setMessage("Employee deleted successfully!");
        setError("");
        setIsConfirmDialogOpen(false); // Close confirmation dialog
        setEmployeeToDelete(null);

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } catch (error: any) {
        console.error("Error deleting employee:", error.response?.data?.message || error.message);
        setError("Failed to delete employee. Please try again.");
        setIsConfirmDialogOpen(false); // Close confirmation dialog
      }
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setIsConfirmDialogOpen(false); // Close confirmation dialog
    setEmployeeToDelete(null);
  };

  // Handle Save Button in Dialog
  const handleDialogSave = async () => {
    if (selectedEmployee) {
      try {
        const payload = {
          ...selectedEmployee,
          dateOfBirth: moment(selectedEmployee.dateOfBirth).format("YYYY-MM-DD"), // Format dateOfBirth
          phoneNumbers: selectedEmployee.phoneNumbers.split(",").map((phone) => phone.trim()), // Convert phone numbers to an array
          employment_type: selectedEmployee.employmentType, // Map employmentType to employment_type for the backend
        };

        console.log("Update Payload:", payload); // Debugging

        const response = await axios.put(
          `http://localhost:5000/api/employees/${selectedEmployee.id}`,
          payload
        );

        setMessage(response.data.message);
        setError("");
        setIsDialogOpen(false);

        // Refresh the employee list
        const updatedEmployees = await axios.get("http://localhost:5000/api/employees/all");
        setEmployees(updatedEmployees.data);
      } catch (error: any) {
        setMessage("");
        setError(error.response?.data?.message || "Error updating employee");
      }
    }
  };

  // Filter employees based on the search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">View Employee Details</h2>

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

        {/* Search Section */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search Employees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">First Name</th>
                <th className="py-3 px-4">Last Name</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">NIC</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone Numbers</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">{employee.id}</td>
                    <td className="py-3 px-4">{employee.firstName}</td>
                    <td className="py-3 px-4">{employee.lastName}</td>
                    <td className="py-3 px-4">{moment(employee.dateOfBirth).format("YYYY-MM-DD")}</td>
                    <td className="py-3 px-4">{employee.nic}</td>
                    <td className="py-3 px-4">{employee.role}</td>
                    <td className="py-3 px-4">{employee.email}</td>
                    <td className="py-3 px-4">{employee.phoneNumbers}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() => handleUpdateClick(employee.id)}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee.id)}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-3 px-4 text-center">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Dialog */}
      {isDialogOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Update Employee</h2>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input
                  type="text"
                  value={selectedEmployee.firstName}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input
                  type="text"
                  value={selectedEmployee.lastName}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <input
                  type="date"
                  value={selectedEmployee.dateOfBirth}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                />
              </div>

              {/* NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIC</label>
                <input
                  type="text"
                  value={selectedEmployee.nic}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, nic: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={selectedEmployee.role}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                >
                  <option value="">Select Role</option>
                  <option value="technician">Technician</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employmentType"
                      value="Full-Time"
                      checked={selectedEmployee.employmentType === "Full-Time"}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, employmentType: e.target.value })
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-800 dark:text-gray-300">Full-Time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employmentType"
                      value="Part-Time"
                      checked={selectedEmployee.employmentType === "Part-Time"}
                      onChange={(e) =>
                        setSelectedEmployee({ ...selectedEmployee, employmentType: e.target.value })
                      }
                      className="mr-2"
                    />
                    <span className="text-gray-800 dark:text-gray-300">Part-Time</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                />
              </div>

              {/* Phone Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Numbers</label>
                <input
                  type="text"
                  value={selectedEmployee.phoneNumbers}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, phoneNumbers: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDialogSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;