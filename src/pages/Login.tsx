import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { Mail, Lock } from "lucide-react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send login request to the backend
      const response = await axios.post(
        "http://localhost:5000/api/employees/login",
        {
          email,
          password,
        }
      );

      // Check if login is successful
      if (response.data.success) {
        const { id, role, username, fullName } = response.data;

        // Store user details in local storage
        localStorage.setItem(
          "employee",
          JSON.stringify({ id, role, username, fullName })
        );

        // Redirect based on role
        if (role === "technician") {
          navigate("/my-jobs"); // Redirect to MyJobs page for technicians
        } else {
          navigate("/dashboard"); // Redirect to dashboard for other roles
        }
      } else {
        setError(response.data.message || "Login failed.");
      }
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MN Electronics
          </h1>
          <p className="text-gray-600">Employee Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/register-employee"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Register as an Employee
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Authorized personnel only. Please contact administration for access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;