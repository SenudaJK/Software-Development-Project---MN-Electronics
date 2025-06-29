import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, X, Mail, Phone, User, UserPlus, AlertCircle, Loader2, Lock } from 'lucide-react';

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
  const [userRole, setUserRole] = useState('');

  // Get the current user's role from localStorage
  useEffect(() => {
    try {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      setUserRole(employeeData.role || '');
    } catch (error) {
      console.error('Error parsing employee data:', error);
    }
  }, []);

  // Check if the user has owner role
  const isOwner = userRole === 'owner';
  
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

  // Enhance validation function to match the backend validations
  const validateForm = (customer: any) => {
    const errors: {[key: string]: string} = {};
    
    // First name validation
    if (!customer.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z']+$/.test(customer.firstName)) {
      errors.firstName = "First name should only contain letters and ' symbol";
    } else if (customer.firstName.length > 10) {
      errors.firstName = "First name should not exceed 10 characters";
    }
    
    // Last name validation
    if (!customer.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z']+$/.test(customer.lastName)) {
      errors.lastName = "Last name should only contain letters and ' symbol";
    } else if (customer.lastName.length > 20) {
      errors.lastName = "Last name should not exceed 20 characters";
    }
    
    // Email validation
    if (!customer.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (customer.email.length > 100) {
      errors.email = "Email should not exceed 100 characters";
    }
    
    // Phone numbers validation
    if (customer.phoneNumbers) {
      const phoneArray = customer.phoneNumbers.split(',').map((p: string) => p.trim());
      for (let phone of phoneArray) {
        if (!/^07\d{8}$/.test(phone)) {
          errors.phoneNumbers = "Phone numbers should be 10 digits and start with 07";
          break;
        }
      }
    }
    
    return errors;
  };

  // Handle Update Button Click
  const handleUpdateClick = (customer: Customer) => {
    // Only allow owner to update customers
    if (!isOwner) {
      setError('Only owners can edit customer information.');
      return;
    }
    
    setSelectedCustomer(customer);
    setValidationErrors({});
    setIsDialogOpen(true);
  };

  // Handle Delete Button Click
  const handleDeleteClick = (customerId: string, customerName: string) => {
    // Only allow owner to delete customers
    if (!isOwner) {
      setError('Only owners can delete customers.');
      return;
    }
    
    setDeleteConfirmation(customerId);
  };

  // Confirm Delete
  const confirmDelete = async (customerId: string) => {
    if (!isOwner) return;
    
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
    if (!isOwner || !selectedCustomer) return;
    
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
      await axios.put(
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
      const err = error as any;
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors) {
        // Handle validation errors from backend
        const backendErrors = err.response.data.errors.reduce((acc: any, curr: any) => {
          acc[curr.param] = curr.msg;
          return acc;
        }, {});
        setValidationErrors(backendErrors);
      } else {
        setError('Failed to update customer. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Add New Customer
  const handleAddCustomer = () => {
    // Only allow owner to add customers
    if (!isOwner) {
      setError('Only owners can add new customers.');
      return;
    }
    
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
    if (!isOwner) return;
    
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

      {/* Permission info for non-owners */}
      {!isOwner && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md flex items-center text-blue-700 dark:text-blue-400">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>You are in view-only mode. Only owners can modify customer information.</span>
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
                            className={`${
                              isOwner
                                ? 'bg-green-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/30'
                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-700/20 dark:text-gray-500 dark:border-gray-700'
                            } px-3 py-1 rounded-md flex items-center border transition-colors`}
                            disabled={!isOwner}
                          >
                            {isOwner ? (
                              <Edit className="h-4 w-4 mr-1" />
                            ) : (
                              <Lock className="h-4 w-4 mr-1" />
                            )}
                            Edit
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

      {/* Edit Customer Dialog */}
      {isDialogOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Edit Customer</h2>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.firstName}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, firstName: e.target.value})}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.firstName ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                  )}
                </div>
                
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.lastName}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, lastName: e.target.value})}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.lastName ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.email ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                  )}
                </div>
                
                {/* Phone Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Numbers (comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.phoneNumbers || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, phoneNumbers: e.target.value})}
                    placeholder="e.g. 0712345678, 0723456789"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.phoneNumbers ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.phoneNumbers && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phoneNumbers}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Phone numbers should be 10 digits and start with 07
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDialogSave}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the Delete Confirmation Dialog here if not already present */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete Customer</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmation)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Dialog - add this if not already present */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add New Customer</h2>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.firstName ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                  )}
                </div>
                
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.lastName ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.email ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                  )}
                </div>
                
                {/* Phone Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Numbers (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newCustomer.phoneNumbers || ''}
                    onChange={(e) => setNewCustomer({...newCustomer, phoneNumbers: e.target.value})}
                    placeholder="e.g. 0712345678, 0723456789"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      validationErrors.phoneNumbers ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  />
                  {validationErrors.phoneNumbers && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phoneNumbers}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Phone numbers should be 10 digits and start with 07
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewCustomer}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    'Create Customer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleAddCustomer}
          disabled={!isOwner}
          className={`${
            isOwner
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          } rounded-full p-4 shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800`}
        >
          {isOwner ? <UserPlus className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};

export default Customers;