import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text font-heading">Welcome Back</h1>
            <p className="text-text-secondary">Sign in to your account</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-error-light text-error p-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
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
            
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leftIcon={<Lock size={20} className="text-text-light" />}
              required
            />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-dark font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;