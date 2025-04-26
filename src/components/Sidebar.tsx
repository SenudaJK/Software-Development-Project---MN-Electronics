import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);

  const handleInvoiceClick = () => setOpenInvoice(!openInvoice);
  const handleInventoryClick = () => setOpenInventory(!openInventory);

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/employees', icon: <UserCog />, label: 'View Employee Details' },
    { path: '/register/register-job-customer', icon: <Wrench />, label: 'Register Job And Customer' },
    { path: '/customers', icon: <Users />, label: 'View Customers' },
    { path: '/create-account-customer', icon: <Users />, label: 'Register Customer' },
    { path: '/jobs', icon: <Wrench />, label: 'View Jobs' },
    { path: '/myjobs', icon: <Wrench />, label: 'My Jobs' },
    { path: '/warranty-jobs', icon: <Wrench />, label: 'Warranty Jobs' },
    { path: '/my-salary', icon: <DollarSign />, label: 'My Salary' },
  ];

  const invoiceSubItems = [
    { path: '/invoice/advance-payment', label: 'Advanced Payment Invoice' },
    { path: '/invoice/full-payment', label: 'Full Payment Invoice' },
    { path: '/view-invoice', label: 'View Invoices' },
    { path: '/view-advance-invoice', label: 'View Advance Invoices' },
  ];

  const inventorySubItems = [
    { path: '/add-inventory', label: 'Add Inventory' },
    { path: '/inventory/view-inventory', label: 'View Inventory' },
    { path: '/inventory/inventory-batch', label: 'Inventory Batch' },
    { path: 'purchase-items', label: 'Purchase Items' },
  ];

  return (
    <aside className={`bg-gray-800 text-white w-64 min-h-screen ${isOpen ? '' : '-ml-64'} transition-all duration-300`}>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-8">MN Electronics</h2>
        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Invoice Section */}
          <div>
            <button
              onClick={handleInvoiceClick}
              className="flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText />
                <span>Invoice</span>
              </div>
              {openInvoice ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openInvoice && (
              <div className="ml-6">
                {invoiceSubItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div>
            <button
              onClick={handleInventoryClick}
              className="flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Layers />
                <span>Inventory</span>
              </div>
              {openInventory ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openInventory && (
              <div className="ml-6">
                {inventorySubItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;