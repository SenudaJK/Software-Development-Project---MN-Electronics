import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeRegistrationForm = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumbers: "",
    nic: "",
    dateOfBirth: "",
    role: "",
    employment_type: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setErrors([]);
    setFieldErrors({});

    // Form validation
    const validationErrors: {[key: string]: string} = {};
    
    // Validate passwords match
    if (employee.password !== employee.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    // Check for empty required fields
    if (!employee.firstName) validationErrors.firstName = "First name is required";
    if (!employee.lastName) validationErrors.lastName = "Last name is required";
    if (!employee.email) validationErrors.email = "Email is required";
    if (!employee.nic) validationErrors.nic = "NIC is required";
    if (!employee.dateOfBirth) validationErrors.dateOfBirth = "Date of birth is required";
    if (!employee.role) validationErrors.role = "Role is required";
    if (!employee.employment_type) validationErrors.employment_type = "Employment type is required";
    if (!employee.username) validationErrors.username = "Username is required";
    if (!employee.password) validationErrors.password = "Password is required";
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for the backend
      const payload = {
        ...employee,
        phoneNumbers: employee.phoneNumbers.split(",").map((phone) => phone.trim()),
      };

      // Send data to the backend
      const response = await axios.post(
        "http://localhost:5000/api/employees/register",
        payload
      );      // Handle success response
      setMessage(response.data.message || "Employee registered successfully!");
      setErrors([]);
      setEmployee({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumbers: "",
        nic: "",
        dateOfBirth: "",
        role: "",
        employment_type: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      
      // Display success message for a brief moment before redirecting to login
      setTimeout(() => {
        navigate("/"); // Navigate to the login page (root route)
      }, 2000);
    } catch (error: any) {
      // Handle error response - specific handling for duplicate fields
      if (error.response) {
        // Check for duplicate entry errors from the server
        if (error.response.status === 400 || error.response.status === 409) {
          const errorData = error.response.data;
          
          // Handle field-specific errors
          if (errorData.field && errorData.message) {
            // This is a field-specific error (e.g. duplicate email)
            setFieldErrors({
              [errorData.field]: errorData.message
            });
          } 
          // Handle array of validation errors
          else if (error.response.data.errors) {
            const validationErrors: {[key: string]: string} = {};
            const generalErrors: string[] = [];
            
            error.response.data.errors.forEach((err: any) => {
              if (err.param) {
                validationErrors[err.param] = err.msg;
              } else {
                generalErrors.push(err.msg);
              }
            });
            
            setFieldErrors(validationErrors);
            setErrors(generalErrors);
          } 
          // Handle general error message
          else if (error.response.data.message) {
            setErrors([error.response.data.message]);
          }
        } else {
          // Server error or other HTTP status codes
          setErrors(["Server error. Please try again later."]);
        }
      } else if (error.request) {
        // Network error - no response received
        setErrors(["Network error. Please check your connection."]);
      } else {
        // Other errors
        setErrors(["An unexpected error occurred"]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to determine if a field has an error
  const hasError = (field: string) => {
    return !!fieldErrors[field];
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
                className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  hasError("firstName") 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {hasError("firstName") && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
              )}
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
                className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  hasError("lastName") 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Enter last name"
              />
              {hasError("lastName") && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
              )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("email") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
              placeholder="Enter email address"
            />
            {hasError("email") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Telephone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Mobile Number
            </label>
            <input
              type="text"
              name="phoneNumbers"
              value={employee.phoneNumbers}
              onChange={handleChange}
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("phoneNumbers") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
              placeholder="Enter phone numbers (comma-separated)"
            />
            {hasError("phoneNumbers") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.phoneNumbers}</p>
            )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("nic") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
              placeholder="Enter NIC number"
            />
            {hasError("nic") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.nic}</p>
            )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("dateOfBirth") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
            />
            {hasError("dateOfBirth") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.dateOfBirth}</p>
            )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("role") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
            >
              <option value="">Select Role</option>
              <option value="owner">Owner</option>
              <option value="technician">Technician</option>
            </select>
            {hasError("role") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
            )}
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
                  name="employment_type"
                  value="Full-Time"
                  checked={employee.employment_type === "Full-Time"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-800">Full-Time</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employment_type"
                  value="Part-Time"
                  checked={employee.employment_type === "Part-Time"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-800">Part-Time</span>
              </label>
            </div>
            {hasError("employment_type") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.employment_type}</p>
            )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("username") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
              placeholder="Enter username"
            />
            {hasError("username") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
            )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("password") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
              placeholder="Enter password"
            />
            {hasError("password") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
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
              className={`mt-1 w-full p-2 border rounded-md focus:ring focus:ring-blue-300 ${
                hasError("confirmPassword") 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-300"
              }`}
              placeholder="Confirm password"
            />
            {hasError("confirmPassword") && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Display General Errors */}
          {errors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md border border-red-300">
              {errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Display Success Message */}
          {message && (
            <div className="bg-green-100 text-green-700 p-4 rounded-md border border-green-300">
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => {
                // Clear form or redirect
                window.history.back();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistrationForm;