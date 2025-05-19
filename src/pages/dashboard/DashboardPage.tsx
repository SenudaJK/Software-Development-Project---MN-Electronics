import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import axios from 'axios';
import { 
  Smartphone, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Plus,
  FileText,
  AlertCircle,
  ShieldCheck,
  MessageSquare // Add this for feedback icon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define the job interface from backend
interface Job {
  job_id: number;
  repair_description: string;
  repair_status: string;
  handover_date: string | null;
  warranty_eligible: number; // MySQL returns 0/1 for boolean values
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

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobFeedback, setJobFeedback] = useState<{[key: number]: boolean}>({});

  // Fetch jobs for the logged in user
  useEffect(() => {
    const fetchJobsAndFeedback = async () => {
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
          
          // Fetch feedback status for completed jobs
          const completedJobIds = response.data
            .filter(job => ['Delivered', 'Completed', 'Paid', 'Warranty-Claimed'].includes(job.repair_status))
            .map(job => job.job_id);
          
          if (completedJobIds.length > 0) {
            try {
              // Get all feedback for this customer's jobs
              const feedbackResponse = await axios.get(`http://localhost:5000/api/jobs/feedback/customer/${user.id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              const feedbackMap: {[key: number]: boolean} = {};
              
              if (Array.isArray(feedbackResponse.data)) {
                feedbackResponse.data.forEach((feedback: any) => {
                  feedbackMap[feedback.Job_ID] = true;
                });
              }
              
              setJobFeedback(feedbackMap);
            } catch (feedbackErr) {
              console.error('Error fetching feedback data:', feedbackErr);
            }
          }
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
    
    fetchJobsAndFeedback();
  }, [user]);
  
  // Get active and completed jobs
  const activeJobs = jobs.filter(job => 
    !['Delivered', 'Completed', 'Paid', 'Warranty-Claimed'].includes(job.repair_status)
  );
  
  const completedJobs = jobs.filter(job => 
    ['Delivered', 'Completed', 'Paid', 'Warranty-Claimed'].includes(job.repair_status)
  );
  
  // Convert backend status to UI status format
  const convertStatus = (backendStatus: string): string => {
    switch (backendStatus?.toLowerCase()) {
      case 'booking pending':
        return 'booking_pending';
      case 'booking approved':
        return 'booking_approved';
      case 'booking cancelled':
        return 'booking_cancelled';
      case 'pending':
        return 'pending';
      case 'cannot repair':
        return 'cannot_repair';
      case 'in progress':
        return 'in_progress';
      case 'completed':
        return 'completed';
      case 'paid':
        return 'paid';
      case 'warranty-claimed':
        return 'warranty_claimed';
      default:
        return 'pending';
    }
  };

  // Get status text and color for each repair status
  const getStatusInfo = (status: string) => {
    const formattedStatus = convertStatus(status);
    
    switch (formattedStatus) {
      case 'booking_pending':
        return { text: 'Booking Pending', color: 'text-warning' };
      case 'booking_approved':
        return { text: 'Booking Approved', color: 'text-success' };
      case 'booking_cancelled':
        return { text: 'Booking Cancelled', color: 'text-error' };
      case 'pending':
        return { text: 'Pending', color: 'text-warning' };
      case 'cannot_repair':
        return { text: 'Cannot Repair', color: 'text-error' };
      case 'in_progress':
        return { text: 'In Progress', color: 'text-primary' };
      case 'completed':
        return { text: 'Completed', color: 'text-success' };
      case 'paid':
        return { text: 'Paid', color: 'text-success' };
      case 'warranty_claimed':
        return { text: 'Warranty Claimed', color: 'text-accent' };
      default:
        return { text: status, color: 'text-text-secondary' };
    }
  };

  // Format handover date to display est. completion time
  const formatHandoverDate = (date: string | null) => {
    if (!date) return null;
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get full device name with model
  const getFullDeviceName = (job: Job) => {
    let deviceName = job.product_name;
    
    if (job.model && job.model.trim() !== '') {
      deviceName += ` ${job.model}`;
    }
    
    if (job.model_number && job.model_number.trim() !== '') {
      deviceName += ` (${job.model_number})`;
    }
    
    return deviceName;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text font-heading">Dashboard</h1>
        <p className="text-text-secondary">Welcome back, {user?.firstName || user?.username || 'Customer'}!</p>
      </div>
      
      {error && (
        <div className="bg-error-light text-error p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Dashboard Summary - Alternative Light Version */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Repairs Box */}
        <Card className="border-l-4 border-primary">
          <div className="flex flex-col">
            <div className="flex items-center mb-3">
              <div className="p-3 bg-primary bg-opacity-10 rounded-full mr-4">
                <Smartphone size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Repairs</p>
                <h3 className="text-2xl font-bold text-primary">{activeJobs.length}</h3>
              </div>
            </div>
            
            <div className="mt-2 text-sm space-y-1">
              {activeJobs.length > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Booking Pending:</span>
                    <span className="text-text font-medium">
                      {activeJobs.filter(job => job.repair_status === 'Booking Pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">In Progress:</span>
                    <span className="text-text font-medium">
                      {activeJobs.filter(job => job.repair_status === 'In Progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Ready for Pickup:</span>
                    <span className="text-text font-medium">
                      {activeJobs.filter(job => job.repair_status?.toLowerCase() === 'completed').length}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-text-secondary">No active repairs</p>
              )}
            </div>
          </div>
        </Card>
        
        {/* Completed Repairs Box */}
        <Card className="border-l-4 border-success">
          <div className="flex flex-col">
            <div className="flex items-center mb-3">
              <div className="p-3 bg-success bg-opacity-10 rounded-full mr-4">
                <CheckCircle size={24} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Completed Repairs</p>
                <h3 className="text-2xl font-bold text-success">{completedJobs.length}</h3>
              </div>
            </div>
            
            {completedJobs.length > 0 && (
              <div className="mt-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Last completed:</span>
                  <span className="text-text font-medium">
                    {completedJobs.length > 0 && completedJobs[0].handover_date ? 
                      new Date(completedJobs[0].handover_date).toLocaleDateString() : 
                      'N/A'}
                  </span>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center">
                    <ShieldCheck size={16} className="mr-2 text-success" />
                    <span className="text-text">
                      {jobs.filter(job => job.warranty_eligible === 1).length} device(s) under warranty
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Next Appointment Box */}
        <Card className="border-l-4 border-accent">
          <div className="flex flex-col">
            <div className="flex items-center mb-3">
              <div className="p-3 bg-accent bg-opacity-10 rounded-full mr-4">
                <Calendar size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Next Appointment</p>
                <h3 className="text-lg font-bold truncate text-accent">
                  {activeJobs.length > 0 && activeJobs[0].handover_date
                    ? formatHandoverDate(activeJobs[0].handover_date)
                    : 'No upcoming appointments'}
                </h3>
              </div>
            </div>
            
            {activeJobs.length > 0 && activeJobs[0].handover_date && (
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-text-secondary" />
                  <span className="text-text">
                    {new Date(activeJobs[0].handover_date).toLocaleDateString()} at{' '}
                    {new Date(activeJobs[0].handover_date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Smartphone size={16} className="mr-2 text-text-secondary" />
                  <span className="truncate text-text">
                    {activeJobs[0].product_name} {activeJobs[0].model}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusInfo(activeJobs[0].repair_status).color.replace('text-', 'bg-')}`}></div>
                  <span className="text-text">
                    {getStatusInfo(activeJobs[0].repair_status).text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Active Repairs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text font-heading">Active Repairs</h2>
          <Link to="/new-booking">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
            >
              New Repair
            </Button>
          </Link>
        </div>
        
        {activeJobs.length === 0 && !error ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-bold text-text mb-2">No Active Repairs</h3>
            <p className="text-text-secondary mb-6">You don't have any active repair orders at the moment.</p>
            <Link to="/new-booking">
              <Button variant="primary" leftIcon={<Plus size={18} />}>
                Book a Repair
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <Card key={job.job_id} hoverable className="p-0 overflow-hidden">                <div className="flex flex-col md:flex-row">                  {/* Product Image */}
                  <div className="md:w-48 md:h-auto bg-gray-100 flex items-center justify-center">
                    {job.product_image ? (
                      <img 
                        src={job.product_image} 
                        alt={job.product_name}
                        className="w-full h-56 md:h-full object-cover" 
                      />
                    ) : (
                      <div className="p-10">
                        <Smartphone size={96} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Job Details */}
                  <div className="flex-grow p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm mb-2">
                          #{job.job_id}
                        </span>
                        <h3 className="text-lg font-bold text-text">
                          {getFullDeviceName(job)}
                        </h3>
                      </div>
                      <div className={`${getStatusInfo(job.repair_status).color} font-medium mt-2 md:mt-0`}>
                        {getStatusInfo(job.repair_status).text}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-text-secondary">{job.repair_description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="flex items-center text-sm text-text-secondary">
                        <Calendar size={16} className="mr-1" />
                        <span>
                          Created {job.job_id ? 'recently' : 'unknown'}
                        </span>
                      </div>
                      
                      {job.handover_date && (
                        <div className="flex items-center text-sm text-text-secondary">
                          <Clock size={16} className="mr-1" />
                          <span>
                            Est. completion {formatHandoverDate(job.handover_date)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Display warranty status */}
                    {job.warranty_eligible === 1 && (
                      <div className="flex items-center text-sm text-success mb-2">
                        <ShieldCheck size={16} className="mr-1" />
                        <span>Covered under warranty</span>
                      </div>
                    )}
                  </div>
                    {/* Actions */}
                  <div className="bg-gray-50 p-6 flex flex-row md:flex-col justify-between items-center md:border-l border-gray-100">
                    {job.repair_status?.toLowerCase() === 'ready for pickup' && (
                      <div className="flex items-center">
                        <AlertTriangle size={16} className="text-warning mr-2" />
                        <span className="text-sm font-medium text-warning">Ready for pickup</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Repair History */}
      <div>
        <h2 className="text-xl font-bold text-text font-heading mb-4">Repair History</h2>
        
        {completedJobs.length === 0 ? (
          <Card>
            <p className="text-text-secondary text-center py-6">No repair history found.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Repair ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Model Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedJobs.map((job) => (
                    <tr key={job.job_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        #{job.job_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-text flex items-center">
                        {job.product_image && (
                          <div className="w-10 h-10 mr-3 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={job.product_image} 
                              alt={job.product_name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <span>{job.product_name} {job.model}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        {job.model_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">
                        {job.repair_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {job.handover_date ? new Date(job.handover_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getStatusInfo(job.repair_status).color}>
                          {getStatusInfo(job.repair_status).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {/* Show invoice button for paid jobs */}
                          {job.repair_status === 'Paid' && (
                            <Link
                              to={`/invoice/${job.job_id}`}
                              className="text-accent hover:text-accent-dark flex items-center"
                            >
                              <FileText size={16} className="mr-1" />
                              Invoice
                            </Link>
                          )}
                          {/* Show feedback button if no feedback submitted yet */}
                          {!jobFeedback[job.job_id] && (
                            <Link
                              to={`/feedback/${job.job_id}`}
                              className="text-success hover:text-success-dark flex items-center"
                              onClick={() => {
                                // Add debug logging
                                console.log("Navigating to feedback form for job ID:", job.job_id);
                              }}
                            >
                              <MessageSquare size={16} className="mr-1" />
                              Feedback
                            </Link>
                          )}
                          {/* Show feedback submitted indicator if feedback exists */}
                          {jobFeedback[job.job_id] && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <CheckCircle size={16} className="mr-1 text-success" />
                              Feedback Submitted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;