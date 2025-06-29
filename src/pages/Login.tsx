import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/employees/login", {
        email,
        password,
      });

      if (response.data.success) {
        const { employeeId, username, fullName, role } = response.data;

        // Store employee data in both sessionStorage and localStorage
        // sessionStorage is cleared when browser is closed, localStorage persists
        const employeeData = { 
          id: employeeId, // Changed to match what AdvanceInvoice expects
          employeeId,     // Keep original for backward compatibility
          username, 
          fullName, 
          role 
        };
        
        sessionStorage.setItem("employee", JSON.stringify(employeeData));
        localStorage.setItem("employee", JSON.stringify(employeeData));
        
        console.log(`Login successful: ${fullName} (${role})`);

        // Redirect based on role
        if (role === "technician") {
          navigate("/myjobs");
        } else if (role === "owner") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.data.message || "Login failed.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MN Electronics</h1>
          <p className="text-gray-600">Employee Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white py-2 px-4 rounded-lg transition duration-200 font-medium flex justify-center items-center`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
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