import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  redirectPath = '/' 
}) => {
  const [currentRole, setCurrentRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check authentication and get role from localStorage
    try {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      const role = employeeData.role || '';
      
      setCurrentRole(role);
      setIsAuthenticated(!!employeeData.username); // Consider authenticated if username exists
    } catch (error) {
      console.error('Error parsing employee data:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if the current role is allowed
  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to access this page. This area requires {allowedRoles.join(' or ')} privileges.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the user has the correct role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;