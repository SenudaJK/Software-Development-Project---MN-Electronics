import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, LogOut, User, Sun, Moon, Bell, AlertTriangle, 
  Package, Edit, ChevronRight, Settings, UserCog
} from 'lucide-react';
import axios from 'axios';

interface NavbarProps {
  onMenuClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface InventoryAlert {
  inventoryId: string;
  productName: string;
  totalQuantity: number;
  stockStatus: string;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, darkMode, toggleDarkMode }) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [showBookingAlerts, setShowBookingAlerts] = useState(false);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [showInventoryAlerts, setShowInventoryAlerts] = useState(false);

  const navigate = useNavigate();

  const fetchMissingUserData = async (employeeId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      const userData = response.data;
      
      // Update the missing information
      const updatedData = {
        ...JSON.parse(localStorage.getItem('employee') || '{}'),
        username: userData.username,
        fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role
      };
      
      // Save the complete data back to localStorage
      localStorage.setItem('employee', JSON.stringify(updatedData));
      
      // Update component state
      setUsername(userData.username);
      setFullName(userData.fullName || `${userData.firstName} ${userData.lastName}`);
      setEmail(userData.email);
      setRole(userData.role);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = () => {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      
      if (employeeData.username) {
        setUsername(employeeData.username);
      } else if (employeeData.employeeId) {
        // Username is missing but we have employeeId, fetch the missing data
        fetchMissingUserData(employeeData.employeeId);
      }
      
      if (employeeData.fullName) setFullName(employeeData.fullName);
      if (employeeData.role) setRole(employeeData.role);
      if (employeeData.email) setEmail(employeeData.email);
      if (employeeData.employeeId) setEmployeeId(employeeData.employeeId);
    };

    fetchUserDetails();

    window.addEventListener('storage', fetchUserDetails);

    return () => {
      window.removeEventListener('storage', fetchUserDetails);
    };
  }, []);

  useEffect(() => {
    if (username) {
      fetchPendingBookings();
      fetchInventoryAlerts();

      const bookingIntervalId = setInterval(fetchPendingBookings, 120000);
      const inventoryIntervalId = setInterval(fetchInventoryAlerts, 120000);

      return () => {
        clearInterval(bookingIntervalId);
        clearInterval(inventoryIntervalId);
      };
    }
  }, [username]);

  const fetchPendingBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/status/pending');
      setPendingBookings(response.data);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const fetchInventoryAlerts = () => {
    try {
      const storedAlerts = localStorage.getItem('inventoryAlerts');
      if (storedAlerts) {
        const alerts = JSON.parse(storedAlerts);
        setInventoryAlerts(alerts);
      }
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
    }
  };

  const handleProfileClick = () => {
    setShowProfileDetails(!showProfileDetails);
    setShowBookingAlerts(false);
    setShowInventoryAlerts(false);
  };

  const handleBookingAlertsClick = () => {
    setShowBookingAlerts(!showBookingAlerts);
    setShowProfileDetails(false);
    setShowInventoryAlerts(false);
  };

  const handleInventoryAlertsClick = () => {
    setShowInventoryAlerts(!showInventoryAlerts);
    setShowProfileDetails(false);
    setShowBookingAlerts(false);
  };

  const navigateToBooking = (bookingId: number) => {
    navigate(`/bookings/${bookingId}`);
    setShowBookingAlerts(false);
  };

  const navigateToInventory = (inventoryId: string) => {
    navigate(`/inventory-batch/${inventoryId}`);
    setShowInventoryAlerts(false);
  };

  const handleEditAccount = () => {
    navigate('/account/edit');
    setShowProfileDetails(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
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
        {/* Notification Icons Section with consistent styling */}
        <div className="flex items-center space-x-3">
          {/* Inventory Alert Icon */}
          <div className="relative flex items-center justify-center h-8 w-8">
            <button
              onClick={handleInventoryAlertsClick}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 flex items-center justify-center h-full w-full"
              aria-label="Inventory alerts"
            >
              <Package className="h-5 w-5" />
              {inventoryAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {inventoryAlerts.length}
                </span>
              )}
            </button>

            {/* Inventory Alerts Dropdown */}
            {showInventoryAlerts && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto top-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-yellow-500" />
                    Inventory Alerts
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs font-medium px-2 py-0.5 rounded">
                    {inventoryAlerts.length} Items
                  </span>
                </div>

                {inventoryAlerts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No inventory alerts
                  </div>
                ) : (
                  <div>
                    {inventoryAlerts.map((item) => (
                      <div
                        key={item.inventoryId}
                        className="p-3 border-b border-gray-200 dark:border-gray-600 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-650 cursor-pointer"
                        onClick={() => navigateToInventory(item.inventoryId)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.totalQuantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs font-medium rounded">
                              {item.stockStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-2 text-center border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/inventory/view-inventory');
                          setShowInventoryAlerts(false);
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View All Inventory
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Alert Icon - matched styling with inventory icon */}
          <div className="relative flex items-center justify-center h-8 w-8">
            <button
              onClick={handleBookingAlertsClick}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 flex items-center justify-center h-full w-full"
              aria-label="Booking alerts"
            >
              <Bell className="h-5 w-5" />
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </button>

            {/* Booking Alerts Dropdown */}
            {showBookingAlerts && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto top-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    Pending Bookings
                  </h3>
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 text-xs font-medium px-2 py-0.5 rounded">
                    {pendingBookings.length} New
                  </span>
                </div>

                {pendingBookings.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No pending bookings
                  </div>
                ) : (
                  <div>
                    {pendingBookings.map((booking) => (
                      <div
                        key={booking.BookingID}
                        className="p-3 border-b border-gray-200 dark:border-gray-600 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-650 cursor-pointer"
                        onClick={() => navigateToBooking(booking.BookingID)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {booking.firstName} {booking.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Product: {booking.product_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(booking.Date).toLocaleDateString()} {booking.Time}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {booking.repair_description}
                        </p>
                      </div>
                    ))}

                    <div className="p-2 text-center border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/bookings');
                          setShowBookingAlerts(false);
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View All Bookings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Other navbar elements */}
        <button
          onClick={toggleDarkMode}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 flex items-center justify-center h-8 w-8"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          onClick={handleProfileClick}
          className="flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
        >
          <User className="h-5 w-5 mr-1" />
          <span>{username || 'Profile'}</span>
        </button>

        {/* Enhanced Profile Details Dropdown */}
        {showProfileDetails && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 top-full divide-y divide-gray-200 dark:divide-gray-600">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <UserCog className="h-4 w-4 mr-2 text-blue-500" />
                Account Information
              </h3>
              
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Name:</span> {fullName || 'N/A'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Username:</span> {username || 'N/A'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Email:</span> {email || 'N/A'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Role:</span> {role || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleEditAccount}
                className="w-full flex items-center justify-between p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                <span className="flex items-center">
                  <Edit className="h-4 w-4 mr-2 text-blue-500" />
                  Edit Account
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <span className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

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