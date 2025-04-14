import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { Menu, LogOut, User, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, darkMode, toggleDarkMode }) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Retrieve user details from local storage
  useEffect(() => {
    const fetchUserDetails = () => {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      if (employeeData.username) setUsername(employeeData.username);
      if (employeeData.fullName) setFullName(employeeData.fullName);
      if (employeeData.role) setRole(employeeData.role);
    };

    fetchUserDetails();

    // Optional: Add an event listener to detect changes in local storage
    window.addEventListener('storage', fetchUserDetails);

    return () => {
      window.removeEventListener('storage', fetchUserDetails);
    };
  }, []);

  const handleProfileClick = () => {
    setShowProfileDetails(!showProfileDetails); // Toggle profile details visibility
  };

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.clear();

    // Navigate back to the login page
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 flex justify-between items-center">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
          MN Electronics
        </span>
      </div>

      <div className="relative flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Profile Button */}
        <button
          onClick={handleProfileClick}
          className="flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
        >
          <User className="h-5 w-5 mr-1" />
          <span>{username || 'Profile'}</span>
        </button>

        {/* Profile Details Dropdown */}
        {showProfileDetails && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 z-10">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Full Name:</strong> {fullName || 'N/A'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Role:</strong> {role || 'N/A'}
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
        >
          <LogOut className="h-5 w-5 mr-1" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;