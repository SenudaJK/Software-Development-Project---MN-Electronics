import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { AlertCircle, CheckCircle, Mail, Phone } from 'lucide-react';

const VerifyCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerData, setCustomerData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Verify customer exists in the system
  const handleCustomerLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email && !phoneNumber) {
      setError('Please enter either your email or phone number');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/customers/verify-existence', {
        email: email || undefined,
        phoneNumber: phoneNumber || undefined
      });
      
      if (response.data.exists) {
        setSuccess('Customer found! Sending verification code...');
        setCustomerData(response.data.customerData);
        
        // Send verification code
        await sendVerificationCode();
        
        // Move to next step
        setStep(2);
      } else {
        setError('No customer found with that email or phone number');
      }
    } catch (err: any) {
      console.error('Error looking up customer:', err);
      setError(err?.response?.data?.message || 'Failed to verify customer');
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification code via email or SMS
  const sendVerificationCode = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-verification', {
        email,
        phoneNumber
      });
      
      setSuccess(response.data.message || 'Verification code sent!');
    } catch (err: any) {
      setError('Failed to send verification code. Please try again.');
    }
  };

  // Step 2: Verify the code sent to email or phone
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/auth/verify-code', {
        email,
        phoneNumber,
        code: verificationCode
      });
      
      if (response.data.verified) {
        setSuccess('Verification successful!');
        setStep(3);
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Create account with username and password
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/customers/complete-registration', {
        customerId: customerData.id,
        username,
        password,
        email,
        phoneNumber
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully. Please log in with your new credentials.'
          }
        });
      }, 2000);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setError('');
    await sendVerificationCode();
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text font-heading">
            Complete Your Registration
          </h1>
          <p className="text-text-secondary">
            Verify your details to activate your account
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
            step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className="w-16 h-1 bg-gray-200 self-center mx-1">
            <div className={`h-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} style={{ width: `${step >= 2 ? '100%' : '0%'}` }}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
            step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className="w-16 h-1 bg-gray-200 self-center mx-1">
            <div className={`h-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} style={{ width: `${step >= 3 ? '100%' : '0%'}` }}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 ${
            step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-error-light text-error rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-success-light text-success rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-2" />
            <span>{success}</span>
          </div>
        )}

        {/* Step 1: Email/Phone Verification */}
        {step === 1 && (
          <form onSubmit={handleCustomerLookup}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-text-secondary text-sm font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter your email"
                />
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                Or, use your phone number
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="phoneNumber" className="block text-text-secondary text-sm font-medium mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={(!email && !phoneNumber) || isLoading}
            >
              Verify & Continue
            </Button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-6">
              <label htmlFor="verificationCode" className="block text-text-secondary text-sm font-medium mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="form-input"
                placeholder="Enter verification code"
              />
              <p className="mt-1 text-sm text-text-secondary">
                We sent a verification code to {email || phoneNumber}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={!verificationCode || isLoading}
              >
                Verify Code
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Create Account */}
        {step === 3 && (
          <form onSubmit={handleCreateAccount}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-text-secondary text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Choose a username"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Create a password"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-text-secondary text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={!username || !password || !confirmPassword || isLoading}
            >
              Complete Registration
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default VerifyCustomerPage;