import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { AlertCircle, CheckCircle, Mail, Phone, Bug, Code, Clock, RefreshCw, ExternalLink } from 'lucide-react';

// Detect development environment
const isDevelopment = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

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
  const [devCode, setDevCode] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [devMode, setDevMode] = useState<boolean>(isDevelopment);
  const [devModeDetails, setDevModeDetails] = useState<any>(null);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  
  // Handle resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Format and validate phone number
  const formatPhoneNumber = (number: string) => {
    let digits = number.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      return digits;
    }
    if (digits.startsWith('94')) {
      return digits;
    }
    return '0' + digits;
  };
  
  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if ((digits.startsWith('0') && digits.length === 10) || 
        (digits.startsWith('94') && digits.length === 11)) {
      return true;
    }
    return false;
  };

  const generateDemoVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCustomerLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDevCode(null);
    setDevModeDetails(null);
    setHasExistingAccount(false);
    
    if (!email && !phoneNumber) {
      setError('Please enter either your email or phone number');
      return;
    }
    
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (e.g., 07XXXXXXXX)');
      return;
    }
    
    try {
      setIsLoading(true);
      const payload: {email?: string; phoneNumber?: string} = {};
      
      if (email && email.trim() !== '') {
        payload.email = email.trim();
      }
      
      if (phoneNumber && phoneNumber.trim() !== '') {
        payload.phoneNumber = formatPhoneNumber(phoneNumber.trim());
      }
      
      console.log('Customer lookup payload:', payload);

      if (devMode) {
        setTimeout(() => {
          const mockExistingUsers = [
            { email: 'existing@example.com', phoneNumber: '0711234567' }
          ];
          
          const hasExistingEmail = mockExistingUsers.some(user => user.email === email);
          const hasExistingPhone = mockExistingUsers.some(user => user.phoneNumber === phoneNumber);
          
          if (hasExistingEmail || hasExistingPhone) {
            setHasExistingAccount(true);
            setError('An account already exists with these details. Please log in instead.');
            setIsLoading(false);
            return;
          }
          
          setSuccess('Customer found! Sending verification code...');
          setCustomerData({
            id: 'dev-customer-id',
            email: email || null,
            phoneNumber: phoneNumber || null,
            name: 'Dev User'
          });
          
          const code = generateDemoVerificationCode();
          setDevCode(code);
          setDevModeDetails({
            timestamp: new Date().toISOString(),
            mode: 'development',
            recipientType: email ? 'email' : 'phone',
            recipient: email || phoneNumber,
            codeExpiry: new Date(Date.now() + 15 * 60000).toISOString(),
            generatedAt: new Date().toISOString()
          });
          setSuccess('Verification code generated in development mode');
          setStep(2);
          setResendTimer(60);
          setIsLoading(false);
        }, 800);
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/customers/verify-existence', payload);
      
      if (response.data.exists) {
        if (response.data.hasAccount) {
          setHasExistingAccount(true);
          setError('An account already exists with these details. Please log in instead.');
          return;
        }
        
        setSuccess('Customer found! Sending verification code...');
        setCustomerData(response.data.customerData);
        await sendVerificationCode();
        setStep(2);
      } else {
        setError('No customer found with that email or phone number');
      }
    } catch (err: any) {
      console.error('Error looking up customer:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to verify customer';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      const payload: {email?: string; phoneNumber?: string} = {};
      
      if (email && email.trim() !== '') {
        payload.email = email.trim();
      }
      
      if (phoneNumber && phoneNumber.trim() !== '') {
        payload.phoneNumber = formatPhoneNumber(phoneNumber.trim());
      }
      
      console.log('Sending verification payload:', payload);
      
      if (devMode) {
        const code = generateDemoVerificationCode();
        setDevCode(code);
        setDevModeDetails({
          timestamp: new Date().toISOString(),
          mode: 'development',
          recipientType: email ? 'email' : 'phone',
          recipient: email || phoneNumber,
          codeExpiry: new Date(Date.now() + 15 * 60000).toISOString(),
          generatedAt: new Date().toISOString()
        });
        setSuccess('Verification code generated (dev mode)');
        setResendTimer(60);
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/auth/send-verification', payload);
      
      console.log('Verification response:', response.data);
      
      setSuccess(response.data.message || 'Verification code sent!');
      
      if (response.data.code) {
        setDevCode(response.data.code);
        console.log('Dev code received:', response.data.code);
      }
      
      if (response.data.success) {
        setResendTimer(60);
      }
    } catch (err: any) {
      console.error('Error in sendVerificationCode:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.';
      setError(errorMsg);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (devMode) {
        setTimeout(() => {
          if (verificationCode === devCode) {
            setSuccess('Verification successful!');
            setStep(3);
          } else {
            setError('Invalid verification code');
          }
          setIsLoading(false);
        }, 800);
        return;
      }
      
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
      
      if (devMode) {
        setTimeout(() => {
          setSuccess('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Account created successfully. Please log in with your new credentials.'
              }
            });
          }, 2000);
          setIsLoading(false);
        }, 1000);
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/customers/complete-registration', {
        customerId: customerData.id,
        username,
        password,
        email,
        phoneNumber
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      
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

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setDevCode(null);
    setDevModeDetails(null);
    setRetryCount(prev => prev + 1);
    await sendVerificationCode();
  };

  const toggleDevMode = () => {
    setDevMode(prev => !prev);
    if (!devMode) {
      setDevCode(null);
      setDevModeDetails(null);
    }
  };

  const handleAutofillCode = () => {
    if (devCode) {
      setVerificationCode(devCode);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <Card>
        <div className="flex justify-end mb-2">
          <button 
            className={`text-xs px-2 py-1 rounded-full flex items-center ${devMode 
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={toggleDevMode}
            type="button"
          >
            <Bug className="w-3 h-3 mr-1" />
            {devMode ? 'Dev Mode: ON' : 'Dev Mode'}
          </button>
        </div>

        {devMode && (
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bug size={18} className="text-amber-700 mr-2" />
                <span className="text-amber-800 font-medium">Development Mode Active</span>
              </div>
              <div className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Demo
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Verification codes are displayed directly on this page instead of being sent.
            </p>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text font-heading">
            Complete Your Registration
          </h1>
          <p className="text-text-secondary">
            Verify your details to activate your account
          </p>
        </div>

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

        {error && (
          <div className="mb-4 p-3 bg-error-light text-error rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-success-light text-success rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {hasExistingAccount && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-blue-800 font-medium mb-1">You already have an account</p>
                <p className="text-blue-600 text-sm">
                  It looks like you've already registered with these details. Please use the login page instead.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex items-center text-blue-700 font-medium text-sm hover:underline"
                  >
                    <ExternalLink size={16} className="mr-1" />
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && !hasExistingAccount && (
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d\s+]/g, '');
                    setPhoneNumber(value);
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      setPhoneNumber(formatPhoneNumber(e.target.value));
                    }
                  }}
                  className="form-input pl-10"
                  placeholder="Enter your phone number (e.g., 07XXXXXXXX)"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={(!email && !phoneNumber) || isLoading}
            >
              Verify & Continue
            </Button>

            {devMode && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-1.5 flex items-center">
                  <Code size={14} className="mr-1.5" />
                  <span className="font-medium">Test Accounts</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmail('test@example.com')}
                    className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-2 rounded text-left"
                  >
                    test@example.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('0712345678')}
                    className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-2 rounded text-left"
                  >
                    0712345678
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {step === 2 && !hasExistingAccount && (
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
                maxLength={6}
              />
              <p className="mt-1 text-sm text-text-secondary">
                {devMode 
                  ? 'Demo code is displayed below'
                  : `We sent a verification code to ${email || phoneNumber}`}
              </p>
              
              {(devMode && devCode) && (
                <div className="mt-3 border border-amber-200 rounded-lg overflow-hidden">
                  <div className="bg-amber-50 p-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Code size={16} className="text-amber-600 mr-1.5" />
                      <span className="text-sm font-medium text-amber-800">Verification Code</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 py-1 px-2 rounded-full flex items-center"
                      onClick={handleAutofillCode}
                    >
                      Auto-fill
                    </button>
                  </div>
                  
                  <div className="p-3 bg-white flex flex-col items-center">
                    <div className="py-2 px-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                      <span className="text-2xl font-mono font-bold tracking-wider text-gray-800">{devCode}</span>
                    </div>
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>Expires in 15 minutes</span>
                    </div>
                    
                    <div className="mt-3 w-full">
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <span className="flex-1 h-px bg-gray-200 mr-2"></span>
                        <span>Demo Details</span>
                        <span className="flex-1 h-px bg-gray-200 ml-2"></span>
                      </div>
                      
                      <div className="text-xs grid grid-cols-2 gap-y-1">
                        <span className="text-gray-500">Recipient:</span>
                        <span className="text-gray-700 font-medium truncate">{email || phoneNumber}</span>
                        
                        <span className="text-gray-500">Generated:</span>
                        <span className="text-gray-700">
                          {devModeDetails?.generatedAt
                            ? new Intl.DateTimeFormat('en', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              }).format(new Date(devModeDetails.generatedAt))
                            : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!verificationCode || isLoading}
              >
                Verify Code
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto flex items-center justify-center"
                onClick={handleResendCode}
                disabled={isLoading || resendTimer > 0}
              >
                {resendTimer > 0 ? (
                  <>
                    <Clock size={16} className="mr-2" />
                    <span>Resend in {resendTimer}s</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    <span>Resend Code</span>
                  </>
                )}
              </Button>
            </div>
            
            {phoneNumber && !email && (
              <div className="mt-4 text-center">
                <p className="text-sm text-text-secondary">
                  Having trouble receiving SMS?
                </p>
                <button
                  type="button"
                  className="text-primary text-sm font-medium hover:underline mt-1"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setStep(1);
                    setPhoneNumber('');
                  }}
                >
                  Try using email instead
                </button>
              </div>
            )}
            
            {email && !phoneNumber && (
              <div className="mt-4 text-center">
                <p className="text-sm text-text-secondary">
                  Having trouble receiving email?
                </p>
                <button
                  type="button"
                  className="text-primary text-sm font-medium hover:underline mt-1"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setStep(1);
                    setEmail('');
                  }}
                >
                  Try using phone number instead
                </button>
              </div>
            )}
          </form>
        )}

        {step === 3 && !hasExistingAccount && (
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
              isLoading={isLoading}
              disabled={!username || !password || !confirmPassword || isLoading}
            >
              Complete Registration
            </Button>
            
            {devMode && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 flex items-center mb-2">
                  <Code size={14} className="mr-1.5" />
                  <span className="font-medium">Auto-fill demo data</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('testuser');
                    setPassword('Password123');
                    setConfirmPassword('Password123');
                  }}
                  className="w-full text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1.5 px-2 rounded"
                >
                  Fill test credentials
                </button>
              </div>
            )}
          </form>
        )}
      </Card>
    </div>
  );
};

export default VerifyCustomerPage;