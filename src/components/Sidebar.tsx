import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  DollarSign,
  UserCog,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  Shield,
  ShoppingCart,
  CircleDot,
  FileCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [openJobs, setOpenJobs] = useState(false);
  const [openEmployees, setOpenEmployees] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    try {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      if (employeeData.username) setUsername(employeeData.username);
      if (employeeData.role) setRole(employeeData.role);
    } catch (error) {
      console.error('Error parsing employee data:', error);
    }
    
    // Auto-expand sections based on current route
    const currentPath = location.pathname;
    
    if (currentPath.includes('/invoice') || currentPath.includes('/view-invoice') || 
        currentPath.includes('/view-advance-invoice')) {
      setOpenInvoice(true);
    }
    
    if (currentPath.includes('/inventory') || currentPath.includes('/add-inventory') || 
        currentPath === '/purchase-items') {
      setOpenInventory(true);
    }
    
    if (currentPath.includes('/jobs') || currentPath.includes('/myjobs') || 
        currentPath.includes('/warranty-jobs') || currentPath.includes('/register-job')) {
      setOpenJobs(true);
    }
    
    if (currentPath.includes('/employees') || currentPath.includes('/register/employee')) {
      setOpenEmployees(true);
    }
  }, [location.pathname]);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return () => setter(prev => !prev);
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  ];

  const employeeItems = [
    { path: '/employees', icon: <Users size={18} />, label: 'View Employees' },
    { path: '/register-employee', icon: <UserCog size={18} />, label: 'Register Employee' },
  ];

  const jobItems = [
    { path: '/register/register-job-customer', icon: <Wrench size={18} />, label: 'Register Job' },
    { path: '/jobs', icon: <FileCheck size={18} />, label: 'All Jobs' },
    { path: '/myjobs', icon: <CircleDot size={18} />, label: 'My Jobs' },
    { path: '/warranty-jobs', icon: <Shield size={18} />, label: 'Warranty Jobs' },
  ];

  const singleItems = [
    { path: '/customers', icon: <Users size={20} />, label: 'View Customers' },
    { path: '/my-salary', icon: <DollarSign size={20} />, label: 'My Salary' },
  ];

  const invoiceSubItems = [
    { path: '/invoice/advance-payment', icon: <DollarSign size={18} />, label: 'Advanced Payment' },
    { path: '/invoice/full-payment', icon: <FileText size={18} />, label: 'Full Payment' },
    { path: '/view-invoice', icon: <FileText size={18} />, label: 'View Invoices' },
    { path: '/view-advance-invoice', icon: <FileText size={18} />, label: 'View Advance Invoices' },
  ];

  const inventorySubItems = [
    { path: '/add-inventory', icon: <Package size={18} />, label: 'Add Inventory' },
    { path: '/inventory/view-inventory', icon: <Layers size={18} />, label: 'View Inventory' },
    { path: '/inventory/inventory-batch', icon: <Package size={18} />, label: 'Inventory Batch' },
    { path: '/purchase-items', icon: <ShoppingCart size={18} />, label: 'Purchase Items' },
  ];

  return (
    <aside className={`bg-gradient-to-b from-gray-800 to-gray-900 text-white w-64 min-h-screen ${
      isOpen ? '' : '-ml-64'
    } transition-all duration-300 shadow-lg flex flex-col`}>
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="font-bold text-xl">MN</span>
          </div>
          <h2 className="text-xl font-bold">MN Electronics</h2>
        </div>
        {username && (
          <div className="mt-3 px-2 py-2 bg-gray-700/50 rounded-md">
            <div className="text-sm text-gray-300">Welcome back,</div>
            <div className="font-medium text-white">{username}</div>
            <div className="text-xs text-gray-400 mt-1">{role}</div>
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-grow custom-scrollbar">
        <nav className="p-4">
          <div className="space-y-1">
            {/* Dashboard */}
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium shadow-md'
                      : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                  }`
                }
              >
                <span className="text-blue-400">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Employees Section */}
            <div className="mb-2">
              <button
                onClick={handleToggle(setOpenEmployees)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors ${
                  openEmployees
                    ? 'bg-gray-700 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400"><UserCog size={20} /></span>
                  <span>Employees</span>
                </div>
                {openEmployees ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {openEmployees && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-600">
                  {employeeItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors
                        ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
                        }`
                      }
                    >
                      <span className="text-current opacity-80">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Jobs Section */}
            <div className="mb-2">
              <button
                onClick={handleToggle(setOpenJobs)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors ${
                  openJobs
                    ? 'bg-gray-700 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400"><Wrench size={20} /></span>
                  <span>Jobs</span>
                </div>
                {openJobs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {openJobs && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-600">
                  {jobItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors
                        ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
                        }`
                      }
                    >
                      <span className="text-current opacity-80">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Single Items */}
            {singleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium shadow-md'
                      : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                  }`
                }
              >
                <span className="text-blue-400">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Invoice Section */}
            <div className="mb-2">
              <button
                onClick={handleToggle(setOpenInvoice)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors ${
                  openInvoice
                    ? 'bg-gray-700 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400"><FileText size={20} /></span>
                  <span>Invoice</span>
                </div>
                {openInvoice ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {openInvoice && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-600">
                  {invoiceSubItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors
                        ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
                        }`
                      }
                    >
                      <span className="text-current opacity-80">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Inventory Section */}
            <div className="mb-2">
              <button
                onClick={handleToggle(setOpenInventory)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors ${
                  openInventory
                    ? 'bg-gray-700 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400"><Layers size={20} /></span>
                  <span>Inventory</span>
                </div>
                {openInventory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {openInventory && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-600">
                  {inventorySubItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors
                        ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
                        }`
                      }
                    >
                      <span className="text-current opacity-80">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <NavLink
          to="/account/edit"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700/70'
            }`
          }
        >
          <Settings size={20} className="text-gray-400" />
          <span>Account Settings</span>
        </NavLink>
        
        <NavLink
          to="/login"
          onClick={() => localStorage.clear()}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700/70 hover:text-white transition-colors mt-2"
        >
          <LogOut size={20} className="text-gray-400" />
          <span>Log Out</span>
        </NavLink>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;