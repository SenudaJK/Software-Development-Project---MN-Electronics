import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Search, ShieldCheck, AlertCircle, Calendar, Smartphone, ReceiptText, MessageSquare, ChevronRight, CheckCircle, Clock, PenTool as Tool, Truck, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';

// Define the job details interface based on your API response
interface JobDetails {
  job_id: number;
  repair_description: string;
  repair_status: string;
  handover_date: string | null;
  warranty_eligible: boolean;
  assigned_employee: number;
  assigned_employee_name: string;
  customer_id: number;
  customer_firstName: string;
  customer_lastName: string;
  customer_email: string;
  phone_numbers: string;
  product_id: number;
  product_name: string;
  model: string;
  model_number: string;
  product_image: string | null;
}

const RepairStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const repairIdFromUrl = searchParams.get('id');
  
  const [repairId, setRepairId] = useState(repairIdFromUrl || '');
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Fetch job details when component mounts if ID is in URL
  useEffect(() => {
    if (repairIdFromUrl) {
      fetchJobDetails(repairIdFromUrl);
    }
  }, [repairIdFromUrl]);

  // Function to fetch job details from the API
  const fetchJobDetails = async (id: string) => {
    setLoading(true);
    setSearchError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/job-details/${id}`);
      setJobDetails(response.data);
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setSearchError(err.response?.data?.message || 'Failed to find repair with that job ID');
      setJobDetails(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repairId) {
      setSearchError('Please enter a repair job number');
      return;
    }
    
    fetchJobDetails(repairId);
  };
  
  // Get status icon based on repair status
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={24} className="text-warning" />;
      case 'diagnosed':
        return <Search size={24} className="text-primary" />;
      case 'in progress':
        return <Tool size={24} className="text-primary" />;
      case 'awaiting parts':
        return <Truck size={24} className="text-warning" />;
      case 'completed':
        return <CheckCircle size={24} className="text-success" />;
      case 'ready for pickup':
        return <PackageCheck size={24} className="text-success" />;
      case 'delivered':
        return <CheckCircle size={24} className="text-success" />;
      default:
        return <Clock size={24} className="text-warning" />;
    }
  };

  // Format date helper function with null handling
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text font-heading">Repair Status</h1>
        <p className="text-text-secondary">Track the status of your electronics repair</p>
      </div>
      
      {/* Search Form */}
      {!jobDetails && (
        <Card className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-text font-heading mb-2">Check Your Repair Status</h2>
            <p className="text-text-secondary">
              Enter your repair job number to track your repair status
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <Input
              id="repair-id"
              label="Repair Job Number"
              value={repairId}
              onChange={(e) => setRepairId(e.target.value)}
              placeholder="Enter job number (e.g., 1001)"
              leftIcon={<Search size={20} className="text-text-light" />}
              error={searchError}
              disabled={loading}
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={loading ? null : <ChevronRight size={18} />}
              isLoading={loading}
            >
              Check Status
            </Button>
          </form>
          
          {!isAuthenticated && (
            <div className="mt-8 text-center">
              <p className="text-text-secondary mb-4">
                Have an account? Sign in to view all your repairs
              </p>
              <Link to="/login">
                <Button variant="secondary">Sign In to Account</Button>
              </Link>
            </div>
          )}
        </Card>
      )}
      
      {/* Repair Status Details */}
      {jobDetails && (
        <div>
          <div className="mb-6">
            <Link 
              to={searchParams.has('id') ? '/dashboard' : '/repair-status'} 
              className="text-primary hover:text-primary-dark flex items-center"
              onClick={() => searchParams.has('id') ? null : setJobDetails(null)}
            >
              <ChevronRight size={16} className="transform rotate-180 mr-1" />
              <span>{searchParams.has('id') ? 'Back to Dashboard' : 'Check Another Repair'}</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Repair Info */}
            <div className="lg:col-span-2">
              <Card className="mb-8">                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div className="flex items-center">
                    {/* Added product image or placeholder */}
                    <div className="mr-4 h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {jobDetails.product_image ? (
                        <img
                          src={jobDetails.product_image}
                          alt={jobDetails.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Smartphone size={64} className="text-gray-300" />
                      )}
                    </div>
                    
                    <div>
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm mb-2">
                        #{jobDetails.job_id}
                      </span>
                      <h2 className="text-xl font-bold text-text font-heading">
                        {jobDetails.product_name} {jobDetails.model}
                      </h2>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary bg-opacity-10 text-primary">
                      {getStatusIcon(jobDetails.repair_status)}
                      <span className="ml-2 font-medium">
                        {jobDetails.repair_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-text mb-2">Issue Description</h3>
                  <p className="text-text-secondary">{jobDetails.repair_description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <Calendar size={20} className="text-text-secondary mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Handover Date</p>
                      <p className="font-medium text-text">{formatDate(jobDetails.handover_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Smartphone size={20} className="text-text-secondary mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Device Type</p>
                      <p className="font-medium text-text">{jobDetails.product_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar size={20} className="text-text-secondary mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Model</p>
                      <p className="font-medium text-text">{jobDetails.model} {jobDetails.model_number}</p>
                    </div>
                  </div>
                  
                  {/* Warranty information - now showing both eligible and not eligible */}
                  <div className="flex items-start">
                    {jobDetails.warranty_eligible ? (
                      <>
                        <ShieldCheck size={20} className="text-success mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Warranty Status</p>
                          <p className="font-medium text-success">
                            Covered under warranty
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={20} className="text-warning mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Warranty Status</p>
                          <p className="font-medium text-warning">
                            Not covered by warranty
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
              
              {/* Details about the customer and assigned technician */}
              <Card>
                <h3 className="text-lg font-bold text-text font-heading mb-6">Repair Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-text mb-3">Customer Details</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-text-secondary">Name</p>
                        <p className="font-medium">{jobDetails.customer_firstName} {jobDetails.customer_lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Email</p>
                        <p className="font-medium">{jobDetails.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Phone</p>
                        <p className="font-medium">{jobDetails.phone_numbers || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Technician Information */}
                  <div>
                    <h4 className="font-medium text-text mb-3">Assigned Technician</h4>
                    {jobDetails.assigned_employee_name ? (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-text-secondary">Technician</p>
                          <p className="font-medium">{jobDetails.assigned_employee_name}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-secondary">Not assigned yet</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right Column - Actions */}
            <div>
              {/* Status Card */}
              <Card className="mb-8">
                <h3 className="text-lg font-bold text-text font-heading mb-4">Current Status</h3>
                
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center mb-4">
                    {getStatusIcon(jobDetails.repair_status)}
                    <span className="ml-2 font-bold text-lg">{jobDetails.repair_status}</span>
                  </div>
                  
                  <p className="text-text-secondary mb-4">
                    {jobDetails.repair_status === 'Completed' ? 
                      'Your repair has been completed! You can pick up your device any time during our business hours.' :
                      jobDetails.repair_status === 'In Progress' ?
                      'Your device is currently being repaired by our technician.' :
                      'Your repair is being processed. Our team will update the status as it progresses.'}
                  </p>
                  
                  {jobDetails.repair_status === 'Ready for Pickup' && (
                    <div className="mb-4 p-3 bg-success-light rounded-lg flex items-start">
                      <CheckCircle size={20} className="text-success mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-success">Ready for Pickup</p>
                        <p className="text-sm">
                          Your device is repaired and ready for pickup.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Contact Support */}
              <Card>
                <h3 className="text-lg font-bold text-text font-heading mb-4">Need Help?</h3>
                
                <div className="space-y-4 mb-6">
                  <p className="text-text-secondary">
                    Have questions about your repair? Our team is ready to help!
                  </p>
                  
                  <div className="flex items-center">
                    <MessageSquare size={20} className="text-primary mr-2" />
                    <span className="text-text-secondary">071 2 302 138</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar size={20} className="text-primary mr-2" />
                    <div className="text-text-secondary">
                      <div>Mon-Fri: 7:00 AM - 7:00 PM</div>
                      <div>Sat: 10:00 AM - 5:00 PM</div>
                      <div>Sun: 10:00 AM - 12:30 PM</div>
                      <div>Closed on Poya Days</div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  leftIcon={<MessageSquare size={18} />}
                >
                  Contact Technician
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairStatusPage;