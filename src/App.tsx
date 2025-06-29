import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AppRoutes from './routes';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    return localStorage.getItem('darkMode') === 'true';
  });

  // Apply dark mode class to the <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Wrapper component to check the current route
  const AppContent = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';
    const isEmployeeRegisterPage = location.pathname === '/register-employee'

    if (isLoginPage || isEmployeeRegisterPage) {
      return <AppRoutes />;
    }

    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar with animation */}
        <div
          className={`transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64 bg-gray-800 text-white h-screen fixed z-10`}
        >
          <Sidebar isOpen={sidebarOpen} />
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <Navbar
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
            <AppRoutes />
          </main>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;