import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUserData } = useAuth();

  if (!updateUserData) {
    console.error("updateUserData is not defined in AuthContext");
  }

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumbers: user?.phoneNumbers || [],
    username: user?.username || ''
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch customer details on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCustomerDetails();
    }
  }, [user?.id]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log("API Response:", response.data); // Add logging to see what's returned

      // Format phone numbers
      const phoneNumbersArray = response.data.phoneNumbers
        ? (typeof response.data.phoneNumbers === 'string'
          ? response.data.phoneNumbers.split(',')
          : response.data.phoneNumbers)
        : [];

      setProfile({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phoneNumbers: phoneNumbersArray,
        // Ensure username is correctly extracted from the response
        username: response.data.username || user?.username || ''
      });
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setProfileError('Failed to load profile information');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileUpdateSuccess(false);

    // Basic validation based on backend requirements
    if (!profile.firstName || !profile.lastName || !profile.email) {
      setProfileError('First name, last name and email are required');
      return;
    }

    // Validate first name
    if (!/^[a-zA-Z']+$/.test(profile.firstName) || profile.firstName.length > 10) {
      setProfileError('First name should only contain letters and apostrophes, and not exceed 10 characters');
      return;
    }

    // Validate last name
    if (!/^[a-zA-Z']+$/.test(profile.lastName) || profile.lastName.length > 20) {
      setProfileError('Last name should only contain letters and apostrophes, and not exceed 20 characters');
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) || profile.email.length > 100) {
      setProfileError('Please enter a valid email address not exceeding 100 characters');
      return;
    }

    // Validate phone numbers
    for (const phone of profile.phoneNumbers) {
      if (phone && !/^07\d{8}$/.test(phone)) {
        setProfileError('Phone numbers should contain 10 digits and start with 07');
        return;
      }
    }

    try {
      setIsLoadingProfile(true);

      // Use the correct endpoint for updating customer details
      const response = await axios.put(
        `http://localhost:5000/api/customers/update/${user?.id}`,
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumbers: profile.phoneNumbers.filter(phone => phone.trim() !== '') // Remove empty entries
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update auth context with new user data
      if (user?.id) {
        updateUserData({
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumbers: profile.phoneNumbers.filter(phone => phone.trim() !== ''),
          id: user.id
        });
      } else {
        console.error("User ID is undefined");
      }

      setProfileUpdateSuccess(true);
      setIsEditingProfile(false);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setProfileUpdateSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Handle validation errors from the backend
        setProfileError(err.response.data.errors.map((e: any) => e.msg).join(', '));
      } else {
        setProfileError(err.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordUpdateSuccess(false);

    // Validate passwords
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    // Check for password requirements
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter, one number, and one symbol');
      return;
    }

    try {
      setIsLoadingPassword(true);

      // Use dedicated password update endpoint
      const response = await axios.put(
        `http://localhost:5000/api/customers/change-password/${user?.id}`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setPasswordUpdateSuccess(true);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setPasswordUpdateSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  // Handle phone number updates
  const handlePhoneNumberChange = (index: number, value: string) => {
    const updatedPhoneNumbers = [...profile.phoneNumbers];
    updatedPhoneNumbers[index] = value;
    setProfile({ ...profile, phoneNumbers: updatedPhoneNumbers });
  };

  const addPhoneNumber = () => {
    setProfile({ ...profile, phoneNumbers: [...profile.phoneNumbers, ''] });
  };

  const removePhoneNumber = (index: number) => {
    const updatedPhoneNumbers = [...profile.phoneNumbers];
    updatedPhoneNumbers.splice(index, 1);
    setProfile({ ...profile, phoneNumbers: updatedPhoneNumbers });
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text font-heading">Profile Settings</h1>
        <p className="text-text-secondary">Update your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text font-heading">Personal Information</h2>

              {!isEditingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {profileUpdateSuccess && (
              <div className="mb-6 bg-success-light text-success p-3 rounded-lg flex items-center">
                <CheckCircle size={20} className="mr-2" />
                <span>Profile updated successfully</span>
              </div>
            )}

            {profileError && (
              <div className="mb-6 bg-error-light text-error p-3 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="firstName"
                    label="First Name"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    disabled={!isEditingProfile}
                    leftIcon={<User size={20} className="text-text-light" />}
                    required
                  />

                  <Input
                    id="lastName"
                    label="Last Name"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    disabled={!isEditingProfile}
                    leftIcon={<User size={20} className="text-text-light" />}
                    required
                  />
                </div>

                <Input
                  id="username"
                  label="Username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  disabled={true} // Username can't be changed
                  leftIcon={<User size={20} className="text-text-light" />}
                />

                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditingProfile}
                  leftIcon={<Mail size={20} className="text-text-light" />}
                  required
                />

                <div>
                  <label className="form-label flex items-center mb-2">
                    <Phone size={16} className="mr-2" />
                    Phone Numbers
                  </label>

                  {profile.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                        disabled={!isEditingProfile}
                        className="form-input flex-1 mr-2"
                        placeholder="07XXXXXXXX"
                      />

                      {isEditingProfile && profile.phoneNumbers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="text-error border-error hover:bg-error-light"
                          size="sm"
                          onClick={() => removePhoneNumber(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  {isEditingProfile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPhoneNumber}
                      className="mt-2"
                    >
                      Add Phone Number
                    </Button>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      fetchCustomerDetails();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save size={18} />}
                    isLoading={isLoadingProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Password Change */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text font-heading">Change Password</h2>

              {!isEditingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPassword(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {passwordUpdateSuccess && (
              <div className="mb-6 bg-success-light text-success p-3 rounded-lg flex items-center">
                <CheckCircle size={20} className="mr-2" />
                <span>Password updated successfully</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-6 bg-error-light text-error p-3 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <span>{passwordError}</span>
              </div>
            )}

            {isEditingPassword ? (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <Input
                    id="current-password"
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    leftIcon={<Lock size={20} className="text-text-light" />}
                    required
                  />

                  <Input
                    id="new-password"
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Lock size={20} className="text-text-light" />}
                    required
                  />

                  <Input
                    id="confirm-password"
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock size={20} className="text-text-light" />}
                    required
                  />

                  <div className="text-xs text-text-secondary">
                    <p>Password requirements:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>At least 8 characters long</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save size={18} />}
                    isLoading={isLoadingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-text-secondary">
                <p>●●●●●●●●●●</p>
                <p className="text-sm mt-2">For security reasons, we don't display your password</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="mb-8">
            <h2 className="text-lg font-bold text-text font-heading mb-4">Account Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-text">Email Notifications</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-text">SMS Notifications</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;