import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary bg-opacity-10 text-primary mb-6">
          <AlertTriangle size={48} />
        </div>
        
        <h1 className="text-6xl font-bold text-text font-heading mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text font-heading mb-4">Page Not Found</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Please check the URL or go back to the home page.
        </p>
        
        <Link to="/">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Home size={20} />}
          >
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;