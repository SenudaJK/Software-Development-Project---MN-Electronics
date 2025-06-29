import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Save, Loader2, AlertCircle, ArrowLeft, Trash2, User, Mail, Phone, Plus, X } from 'lucide-react';
import axios from 'axios';

interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumbers: string[];
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmployeeDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  dateOfBirth?: string;
  phoneNumbers?: string;
  nic?: string;
}

const EditAccount: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [employeeData, setEmployeeData] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Get basic info from local storage first
    const storedEmployeeData = JSON.parse(localStorage.getItem('employee') || '{}');
    if (!storedEmployeeData.employeeId) {
      navigate('/login');
      return;
    }

    setFormData(prev => ({
      ...prev,
      username: storedEmployeeData.username || '',
    }));
    
    // Fetch complete data on component mount
    fetchEmployeeDetails(storedEmployeeData.employeeId);
  }, [navigate]);

  const fetchEmployeeDetails = async (employeeId: string) => {
    try {
      setFetchLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      const employee = response.data;
      
      setEmployeeData(employee);
      
      // Parse phone numbers
      let phoneNumbersArray: string[] = [];
      if (employee.phoneNumbers) {
        phoneNumbersArray = employee.phoneNumbers.split(',').map((phone: string) => phone.trim());
      }

      setFormData(prev => ({
        ...prev,
        username: employee.username || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phoneNumbers: phoneNumbersArray,
      }));
      
      // Update localStorage with fresh data
      const updatedLocalData = {
        employeeId: employee.id,
        username: employee.username,
        fullName: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        role: employee.role
      };
      
      localStorage.setItem('employee', JSON.stringify(updatedLocalData));
      
    } catch (error: any) {
      setError('Failed to fetch your account details. ' + 
        (error.response?.data?.message || 'Please try again.'));
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "New passwords don't match";
    }
    
    if (formData.newPassword && formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
    }

    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required to make changes";
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber) return;
    
    // Basic validation for Sri Lankan phone numbers
    if (!/^07\d{8}$/.test(newPhoneNumber)) {
      setValidationErrors(prev => ({
        ...prev,
        phoneNumber: "Phone number should be 10 digits and start with 07"
      }));
      return;
    }
    
    // Check for duplicates
    if (formData.phoneNumbers.includes(newPhoneNumber)) {
      setValidationErrors(prev => ({
        ...prev,
        phoneNumber: "This phone number is already added"
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, newPhoneNumber]
    }));
    setNewPhoneNumber('');
    
    // Clear validation error
    if (validationErrors.phoneNumber) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.phoneNumber;
        return newErrors;
      });
    }
  };

  const handleRemovePhoneNumber = (phoneToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter(phone => phone !== phoneToRemove)
    }));
  };

  const refreshDetails = () => {
    if (employeeData?.id) {
      fetchEmployeeDetails(employeeData.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    if (!employeeData?.id) {
      setError("Employee ID not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for both endpoints
      const accountUpdateData = {
        currentPassword: formData.currentPassword,
        username: formData.username,
        ...(formData.newPassword ? { newPassword: formData.newPassword } : {})
      };
      
      const profileUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumbers: formData.phoneNumbers
      };
      
      // Update account (username/password)
      await axios.put(
        `http://localhost:5000/api/employees/account/${employeeData.id}`,
        accountUpdateData
      );
      
      // Update profile information
      await axios.put(
        `http://localhost:5000/api/employees/${employeeData.id}`,
        profileUpdateData
      );
      
      setSuccess('Account updated successfully');
      
      // Update local storage with new info
      const updatedEmployeeData = {
        employeeId: employeeData.id,
        username: formData.username,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: employeeData.role
      };
      
      localStorage.setItem('employee', JSON.stringify(updatedEmployeeData));
      
      // Clear the password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Refresh employee data
      fetchEmployeeDetails(employeeData.id);
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!employeeData?.id) {
      setError("Employee ID not found. Please log in again.");
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(`http://localhost:5000/api/employees/${employeeData.id}`);
      
      localStorage.clear();
      navigate('/login');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete account');
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 dark:text-blue-400 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Your Account
            </h1>
            <button
              onClick={refreshDetails}
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center"
              disabled={fetchLoading}
            >
              {fetchLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                "Refresh"
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-md">
              {success}
            </div>
          )}
          
          {/* Account Information Summary */}
          {employeeData && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Current Account Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {employeeData.firstName} {employeeData.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {employeeData.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {employeeData.email}
                  </p>
                </div>
                
                {employeeData.phoneNumbers && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {employeeData.phoneNumbers.split(',').join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Section */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
              </div>
              
              {/* First Name field */}
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                )}
              </div>
              
              {/* Last Name field */}
              <div>
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                )}
              </div>
              
              {/* Email field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                )}
              </div>
              
              {/* Username field */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${validationErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
                )}
              </div>
              
              {/* Phone Numbers */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Numbers
                </label>
                
                <div className="mb-2">
                  <div className="flex">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Add phone number (e.g., 0712345678)"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border ${validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPhoneNumber}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {validationErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phoneNumber}</p>
                  )}
                </div>
                
                {/* Phone numbers list */}
                <div className="space-y-2">
                  {formData.phoneNumbers.length > 0 ? (
                    formData.phoneNumbers.map((phone) => (
                      <div 
                        key={phone}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
                      >
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoneNumber(phone)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No phone numbers added</p>
                  )}
                </div>
              </div>
              
              {/* Divider */}
              <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
              </div>

              {/* Current Password field */}
              <div className="md:col-span-2">
                <label 
                  htmlFor="currentPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.currentPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.currentPassword}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Required to make any changes
                  </p>
                )}
              </div>

              {/* New Password field */}
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${validationErrors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.newPassword ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.newPassword}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave blank if you don't want to change your password
                  </p>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Delete Your Account?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm font-medium rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 flex items-center"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAccount;