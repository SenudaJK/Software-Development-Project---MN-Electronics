import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Wrench, CheckCircle, AlertCircle, Eye, ShieldCheck } from 'lucide-react';
import axios from 'axios';

// Update the Job interface to match the exact response from backend
interface Job {
  job_id: number;
  repair_description: string;
  repair_status: string;
  handover_date: string | null;
  warranty_eligible: number; // Note: Changed from boolean to number (MySQL returns 0/1)
  assigned_employee: number;
  assigned_employee_name: string;
  customer_id: number;
  customer_first_name: string;
  customer_last_name: string;
  product_id: number;
  product_name: string;
  model: string;
  model_number: string;
  product_image: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch jobs for the logged in user
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user || !user.id) {
        console.log('No user ID found');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching jobs for user ID:', user.id);
      
      try {
        setIsLoading(true);
        
        // Make API request to get jobs for the logged-in customer
        const apiUrl = `http://localhost:5000/api/jobs/customer/${user.id}`;
        console.log('API URL:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('API response:', response.data);
        
        // Check if the response data is an array
        if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else {
          console.error('Expected array response but got:', typeof response.data);
          setJobs([]);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch jobs:', err);
        setError(err?.response?.data?.message || 'Failed to load job data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
  }, [user]);

  // Format date helper function with null handling
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Function to get user's full name or username
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.username) {
      return user.username;
    } else {
      return 'Customer';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group jobs by status - make case-insensitive comparison
  const pendingJobs = jobs.filter(job => 
    job.repair_status && job.repair_status.toLowerCase() === 'pending'
  );
  
  const inProgressJobs = jobs.filter(job => 
    job.repair_status && job.repair_status.toLowerCase() === 'in progress'
  );
  
  const completedJobs = jobs.filter(job => 
    job.repair_status && 
    (job.repair_status.toLowerCase() === 'completed' || 
     job.repair_status.toLowerCase() === 'ready for pickup')
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {getUserDisplayName()}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your repair jobs and status updates.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Summary Cards */}
        <Card>
          <div className="flex items-center mb-4">
            <div className="bg-warning-light p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pending</h3>
              <p className="text-3xl font-bold">{pendingJobs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center mb-4">
            <div className="bg-primary-light p-3 rounded-full mr-4">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">In Progress</h3>
              <p className="text-3xl font-bold">{inProgressJobs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center mb-4">
            <div className="bg-success-light p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-3xl font-bold">{completedJobs.length}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Your Repair Jobs */}
      <h2 className="text-xl font-bold mb-4">Your Repair Jobs</h2>
      
      {error && (
        <div className="bg-error-light text-error p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {jobs.length === 0 && !error ? (
        <Card>
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Repair Jobs Found</h3>
            <p className="text-gray-500 mb-6">You don't have any repair jobs yet.</p>
            <Link 
              to="/new-booking" 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Book a Repair
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6 mb-8">
          {jobs.map(job => (
            <Card key={job.job_id}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="hidden md:block">
                    {job.product_image ? (
                      <img 
                        src={job.product_image} 
                        alt={job.product_name} 
                        className="w-16 h-16 mr-4 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 mr-4 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs mb-1">
                      Job #{job.job_id}
                    </span>
                    <h3 className="text-lg font-medium">{job.product_name} {job.model}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {job.repair_description}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end space-y-2 w-full md:w-auto">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    job.repair_status?.toLowerCase() === 'completed' ? 'bg-success-light text-success' :
                    job.repair_status?.toLowerCase() === 'in progress' ? 'bg-primary-light text-primary' :
                    job.repair_status?.toLowerCase() === 'ready for pickup' ? 'bg-success-light text-success' :
                    'bg-warning-light text-warning'
                  }`}>
                    {job.repair_status}
                  </span>
                  
                  <div className="text-sm text-gray-500">
                    Due: {formatDate(job.handover_date)}
                  </div>
                  
                  <Link 
                    to={`/repair-details/${job.job_id}`}
                    className="flex items-center text-primary hover:text-primary-dark font-medium text-sm"
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
              
              {/* Changed from boolean to number check since MySQL returns 0/1 */}
              {job.warranty_eligible === 1 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-success">
                  <ShieldCheck size={16} className="mr-1" />
                  <span className="text-sm">Covered under warranty</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* User Information Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Your Information</h2>
      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{user?.username || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone Numbers</p>
            <p className="font-medium">
              {user?.phoneNumbers && user.phoneNumbers.length > 0
                ? user.phoneNumbers.join(', ')
                : 'No phone numbers on file'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;