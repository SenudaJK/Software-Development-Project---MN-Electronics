import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Settings, LogOut, User, Cpu } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Cpu className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-primary font-heading">MN Electronics</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-text hover:border-primary hover:text-primary">
                Home
              </Link>
              <Link to="/repair-status" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-text hover:border-primary hover:text-primary">
                Repair Status
              </Link>
              <Link to="/new-booking" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-text hover:border-primary hover:text-primary">
                Book Repair
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div className="flex items-center">
                  <Link to="/dashboard" className="text-sm font-medium text-text hover:text-primary px-3 py-2">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="inline-flex items-center text-sm font-medium text-text hover:text-primary px-3 py-2">
                    <User className="h-5 w-5 mr-1" />
                    {user?.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center text-sm font-medium text-text hover:text-primary px-3 py-2"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-text hover:text-primary px-3 py-2">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-text hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/repair-status"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Repair Status
          </Link>
          <Link
            to="/new-booking"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book Repair
          </Link>
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                to="/dashboard"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text hover:bg-gray-50 hover:border-primary hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;