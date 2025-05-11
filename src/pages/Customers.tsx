import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, X, Mail, Phone, User, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

const Customers = () => {
  interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumbers?: string;
  }

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Fetch customers from the backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/api/customers/all');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on the search term
  const filteredCustomers = customers.filter((customer) =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phoneNumbers && customer.phoneNumbers.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Validate form
  const validateForm = (customer: any) => {
    const errors: {[key: string]: string} = {};
    
    if (!customer.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!customer.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!customer.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  // Handle Update Button Click
  const handleUpdateClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValidationErrors({});
    setIsDialogOpen(true);
  };

  // Handle Delete Button Click
  const handleDeleteClick = (customerId: string, customerName: string) => {
    setDeleteConfirmation(customerId);
  };

  // Confirm Delete
  const confirmDelete = async (customerId: string) => {
    try {
      setActionLoading(true);
      await axios.delete(`http://localhost:5000/api/customers/${customerId}`);
      setCustomers(customers.filter((customer) => customer.id !== customerId));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Dialog Save
  const handleDialogSave = async () => {
    if (selectedCustomer) {
      // Validate form
      const errors = validateForm(selectedCustomer);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      try {
        setActionLoading(true);
        // Prepare phone numbers as an array
        const phoneNumbersArray = selectedCustomer.phoneNumbers
          ? selectedCustomer.phoneNumbers.split(',').map((phone) => phone.trim())
          : [];

        // Send updated customer data to the backend
        const response = await axios.put(
          `http://localhost:5000/api/customers/update/${selectedCustomer.id}`,
          {
            firstName: selectedCustomer.firstName,
            lastName: selectedCustomer.lastName,
            email: selectedCustomer.email,
            phoneNumbers: phoneNumbersArray,
          }
        );

        // Update the customer in the UI
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === selectedCustomer.id ? selectedCustomer : customer
          )
        );

        setIsDialogOpen(false);
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Error updating customer:', error);
        setError('Failed to update customer. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle Add New Customer
  const handleAddCustomer = () => {
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumbers: ''
    });
    setValidationErrors({});
    setIsAddDialogOpen(true);
  };

  // Save New Customer
  const saveNewCustomer = async () => {
    // Validate form
    const errors = validateForm(newCustomer);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setActionLoading(true);
      // Prepare phone numbers as an array
      const phoneNumbersArray = newCustomer.phoneNumbers
        ? newCustomer.phoneNumbers.split(',').map((phone) => phone.trim())
        : [];

      const response = await axios.post('http://localhost:5000/api/customers/add', {
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phoneNumbers: phoneNumbersArray
      });

      // Add the new customer to the UI
      setCustomers([...customers, {
        id: response.data.customerId,
        ...newCustomer
      }]);

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Failed to add customer. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <button
          onClick={handleAddCustomer}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-sm"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Customer
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
          <button 
            className="ml-auto" 
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading customers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredCustomers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact Information</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{`${customer.firstName} ${customer.lastName}`}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Customer ID: {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center mb-1">
                          <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          {customer.email}
                        </div>
                        {customer.phoneNumbers && (
                          <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                            {customer.phoneNumbers.split(',').join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateClick(customer)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md flex items-center border border-emerald-200 transition-colors dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/30"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer.id, `${customer.firstName} ${customer.lastName}`)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-md flex items-center border border-red-200 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No customers found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try using different search terms or clear the search' : 'Get started by adding your first customer'}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Update Dialog */}
      {isDialogOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Customer</h2>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={selectedCustomer.firstName}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, firstName: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 ${
                    validationErrors.firstName ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={selectedCustomer.lastName}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, lastName: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 ${
                    validationErrors.lastName ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, email: e.target.value })
                    }
                    className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 ${
                      validationErrors.email ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Numbers</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={selectedCustomer.phoneNumbers || ''}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, phoneNumbers: e.target.value })
                    }
                    placeholder="Add comma separated phone numbers"
                    className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple numbers with commas</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDialogSave}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[80px] transition-colors"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Customer</h2>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, firstName: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 ${
                    validationErrors.firstName ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, lastName: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 ${
                    validationErrors.lastName ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    className={`w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400 ${
                      validationErrors.email ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Numbers</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={newCustomer.phoneNumbers || ''}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phoneNumbers: e.target.value })
                    }
                    placeholder="Add comma separated phone numbers"
                    className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple numbers with commas</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={saveNewCustomer}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[80px] transition-colors"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add Customer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-center">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
                Delete Customer
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this customer? This action cannot be undone.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex-1 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmation)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex-1 flex items-center justify-center transition-colors"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;