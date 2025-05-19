import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Mail, AlertCircle, CheckCircle, Lock, KeyRound } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Code, 3: Success
  
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setStep(2); // Move to verification code step
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password should be at least 8 characters long');
      return;
    }
    
    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one number, and one symbol');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        code: verificationCode,
        newPassword
      });
      setStep(3); // Move to success step
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepOne = () => (
    <form onSubmit={handleRequestReset}>
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
      
      <div className="mb-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
        >
          Send Reset Code
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-text-secondary">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark">
            Back to Login
          </Link>
        </p>
      </div>
    </form>
  );
  
  const renderStepTwo = () => (
    <form onSubmit={handleResetPassword}>
      <div className="mb-6 bg-primary-light p-4 rounded-lg text-text-secondary">
        <p>A verification code has been sent to <strong>{email}</strong>. 
        Please check your email inbox and enter the code below.</p>
        <p className="mt-2 text-sm">The code will expire in 15 minutes.</p>
      </div>
      
      <Input
        id="verification-code"
        label="Verification Code"
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Enter 6-digit code"
        leftIcon={<KeyRound size={20} className="text-text-light" />}
        required
      />
      
      <Input
        id="new-password"
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        leftIcon={<Lock size={20} className="text-text-light" />}
        helperText="Must contain at least 8 characters, one uppercase letter, one number, and one symbol"
        required
      />
      
      <Input
        id="confirm-password"
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        leftIcon={<Lock size={20} className="text-text-light" />}
        required
      />
      
      <div className="mb-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
        >
          Reset Password
        </Button>
      </div>
      
      <div className="text-center space-y-2">
        <p>
          <button 
            type="button"
            onClick={() => setStep(1)} 
            className="text-primary hover:text-primary-dark"
          >
            Try a different email
          </button>
        </p>
        <p>
          <button 
            type="button"
            onClick={handleRequestReset} 
            className="text-primary hover:text-primary-dark"
          >
            Resend verification code
          </button>
        </p>
      </div>
    </form>
  );
  
  const renderSuccess = () => (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-success-light p-3">
          <CheckCircle size={32} className="text-success" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-text font-heading mb-2">Password Reset Successful</h2>
      <p className="text-text-secondary mb-6">
        Your password has been reset successfully. You can now log in with your new password.
      </p>
      <div className="mb-6">
        <Link to="/login">
          <Button
            variant="primary"
            fullWidth
          >
            Go to Login
          </Button>
        </Link>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text font-heading">Reset Password</h1>
            <p className="text-text-secondary">
              {step === 1 ? "Enter your email to receive a verification code" : 
               step === 2 ? "Enter verification code and new password" : 
               "Password reset complete"}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-error-light text-error p-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderSuccess()}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;