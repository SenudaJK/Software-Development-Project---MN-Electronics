import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text font-heading">Reset Password</h1>
            <p className="text-text-secondary">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-error-light text-error p-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          {isSuccess ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-success-light p-3">
                  <CheckCircle size={32} className="text-success" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-text font-heading mb-2">Check Your Email</h2>
              <p className="text-text-secondary mb-6">
                We've sent a password reset link to {email}. Please check your email and follow the instructions.
              </p>
              <div className="mb-6">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsSuccess(false)}
                >
                  Send Again
                </Button>
              </div>
              <p className="text-text-secondary">
                <Link to="/login" className="text-primary hover:text-primary-dark">
                  Back to Login
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                  Reset Password
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;