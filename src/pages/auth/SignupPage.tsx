import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Add this import
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, Mail, Lock, AlertCircle, UserPlus, Phone } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleAddPhoneNumber = () => {
    if (!phoneNumber) {
      setError('Phone number cannot be empty');
      return;
    }

    if (!/^07\d{8}$/.test(phoneNumber)) {
      setError('Phone number should contain 10 digits and start with 07');
      return;
    }

    if (phoneNumbers.includes(phoneNumber)) {
      setError('Phone number already added');
      return;
    }

    setPhoneNumbers([...phoneNumbers, phoneNumber]);
    setPhoneNumber('');
    setError('');
  };

  const handleRemovePhoneNumber = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };
  
  const validateForm = () => {
    // First name validation
    if (!firstName) {
      setError('First name is mandatory');
      return false;
    }
    if (!/^[a-zA-Z']+$/.test(firstName)) {
      setError("First name should only contain letters and ' symbol");
      return false;
    }
    if (firstName.length > 10) {
      setError('First name should not exceed 10 characters');
      return false;
    }

    // Last name validation
    if (!lastName) {
      setError('Last name is mandatory');
      return false;
    }
    if (!/^[a-zA-Z']+$/.test(lastName)) {
      setError("Last name should only contain letters and ' symbol");
      return false;
    }
    if (lastName.length > 20) {
      setError('Last name should not exceed 20 characters');
      return false;
    }

    // Email validation
    if (!email) {
      setError('Email is mandatory');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    if (email.length > 100) {
      setError('Email should not exceed 100 characters');
      return false;
    }

    // Username validation
    if (!username) {
      setError('Username is mandatory');
      return false;
    }
    if (username.length > 50) {
      setError('Username should not exceed 50 characters');
      return false;
    }

    // Password validation
    if (!password) {
      setError('Password is mandatory');
      return false;
    }
    if (password.length < 8) {
      setError('Password should be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      setError('Password must contain at least one uppercase letter, one number, and one symbol');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Phone numbers validation
    if (phoneNumbers.length === 0) {
      setError('At least one phone number is required');
      return false;
    }

    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Direct API call to your backend endpoint
      const response = await axios.post('http://localhost:5000/api/customers/sign-up', {
        firstName,
        lastName,
        email,
        username,
        password,
        phoneNumbers
      });
      
      // If successful, navigate to dashboard
      if (response.status === 201) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle specific error messages from backend
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.errors && err.response.data.errors.length > 0) {
          setError(err.response.data.errors[0].msg);
        } else {
          setError('Failed to create account');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text font-heading">Create Account</h1>
            <p className="text-text-secondary">Sign up to track your repairs and bookings</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-error-light text-error p-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="firstName"
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              leftIcon={<User size={20} className="text-text-light" />}
              required
            />
            
            <Input
              id="lastName"
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              leftIcon={<User size={20} className="text-text-light" />}
              required
            />

            <Input
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              leftIcon={<UserPlus size={20} className="text-text-light" />}
              required
            />
            
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              leftIcon={<Mail size={20} className="text-text-light" />}
              required
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              leftIcon={<Lock size={20} className="text-text-light" />}
              required
              // helperText="Must contain at least 8 characters, one uppercase letter, one number, and one symbol"
            />
            
            <Input
              id="confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              leftIcon={<Lock size={20} className="text-text-light" />}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">Phone Numbers</label>
              <div className="flex items-center">
                <div className="flex-grow">
                  <Input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XXXXXXXX"
                    leftIcon={<Phone size={20} className="text-text-light" />}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="ml-2"
                  onClick={handleAddPhoneNumber}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-text-secondary mt-1">Must start with 07 and have 10 digits</p>
            </div>

            {phoneNumbers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-1">Added Phone Numbers</label>
                <ul className="border rounded-md divide-y">
                  {phoneNumbers.map((phone, index) => (
                    <li key={index} className="flex justify-between items-center p-2">
                      <span>{phone}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemovePhoneNumber(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-dark">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary-dark">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;