import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, Mail, Phone, MapPin, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    
    // Simulate API call with a delay
    setTimeout(() => {
      // In a real app, this would update the user profile in the database
      console.log('Profile update:', profile);
      
      setProfileUpdateSuccess(true);
      setIsEditingProfile(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setProfileUpdateSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    // Simulate API call with a delay
    setTimeout(() => {
      // In a real app, this would update the user password in the database
      console.log('Password update:', { currentPassword, newPassword });
      
      setPasswordUpdateSuccess(true);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setPasswordUpdateSuccess(false);
      }, 3000);
    }, 1000);
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
                <Input
                  id="name"
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditingProfile}
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
                />
                
                <Input
                  id="phone"
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditingProfile}
                  leftIcon={<Phone size={20} className="text-text-light" />}
                />
                
                <div className="mb-4">
                  <label htmlFor="address" className="form-label flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Address
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    disabled={!isEditingProfile}
                    className="form-input"
                  ></textarea>
                </div>
              </div>
              
              {isEditingProfile && (
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfile({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save size={18} />}
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
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-text-secondary">
                <p>●●●●●●●●●●</p>
                <p className="text-sm mt-2">Last updated: 30 days ago</p>
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-text">Two-Factor Authentication</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-bold text-text font-heading mb-4">Danger Zone</h2>
            
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                These actions are irreversible. Please proceed with caution.
              </p>
              
              <Button
                variant="outline"
                fullWidth
                className="border-error text-error hover:bg-error-light"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;