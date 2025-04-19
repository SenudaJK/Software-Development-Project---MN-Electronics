import React, { useState } from "react";
import axios from "axios";

const EmployeeRegistrationForm = () => {
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumbers: "",
    nic: "",
    dateOfBirth: "",
    role: "",
    employmentType: "", // Added employment type
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (employee.password !== employee.confirmPassword) {
      setMessage("Passwords do not match");
      setErrors([]);
      return;
    }

    try {
      // Prepare data for the backend
      const payload = {
        ...employee,
        phoneNumbers: employee.phoneNumbers.split(",").map((phone) => phone.trim()), // Convert phone numbers to an array
      };

      // Send data to the backend
      const response = await axios.post(
        "http://localhost:5000/api/employees/register",
        payload
      );

      // Handle success response
      setMessage(response.data.message);
      setErrors([]);
      setEmployee({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumbers: "",
        nic: "",
        dateOfBirth: "",
        role: "",
        employmentType: "", // Reset employment type
        username: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      // Handle error response
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors.map((err: any) => err.msg));
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Register an Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={employee.firstName}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={employee.lastName}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter email address"
            />
          </div>

          {/* Telephone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Telephone Number
            </label>
            <input
              type="text"
              name="phoneNumbers"
              value={employee.phoneNumbers}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter phone numbers (comma-separated)"
            />
          </div>

          {/* NIC Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              NIC Number
            </label>
            <input
              type="text"
              name="nic"
              value={employee.nic}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter NIC number"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={employee.dateOfBirth}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Role
            </label>
            <select
              name="role"
              value={employee.role}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
            >
              <option value="">Select Role</option>
              <option value="owner">Owner</option>
              <option value="technician">Technician</option>
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Employment Type
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Full-Time"
                  checked={employee.employmentType === "Full-Time"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-800">Full-Time</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employmentType"
                  value="Part-Time"
                  checked={employee.employmentType === "Part-Time"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-800">Part-Time</span>
              </label>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={employee.username}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={employee.password}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              placeholder="Enter password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={employee.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              placeholder="Confirm password"
            />
          </div>

          {/* Display Errors */}
          {errors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Display Success Message */}
          {message && (
            <div
              className={`p-4 rounded-md ${
                errors.length > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistrationForm;