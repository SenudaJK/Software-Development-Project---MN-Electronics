import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Tablet, Tv, Gamepad2, Search, Clock, PenTool as Tool, CheckCircle, Star, ChevronRight, AlertCircle, Calendar, ShieldCheck, MessageSquare } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import axios from 'axios';
import { format } from 'date-fns';

// Define job details interface
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

const HomePage: React.FC = () => {
  const [jobId, setJobId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const navigate = useNavigate();

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId.trim()) {
      setError('Please enter a job number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch job details
      const response = await axios.get(`http://localhost:5000/api/jobs/job-details/${jobId}`);
      setJobDetails(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to find repair with that job ID');
      setJobDetails(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get status icon based on repair status
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock size={24} className="text-warning" />;
      case 'diagnosed':
        return <Search size={24} className="text-primary" />;
      case 'in progress':
        return <Tool size={24} className="text-primary" />;
      case 'awaiting parts':
        return <Clock size={24} className="text-warning" />;
      case 'completed':
        return <CheckCircle size={24} className="text-success" />;
      case 'ready for pickup':
        return <CheckCircle size={24} className="text-success" />;
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
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6">
                Expert Electronics Repair <br />
                You Can Trust
              </h1>
              <p className="text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                Fast, reliable repairs for all your devices. Get your electronics back up and running with our professional service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/new-booking" className="bg-accent text-white font-medium py-3 px-8 rounded-lg hover:bg-accent-dark transition-colors duration-300">
                  Book a Repair
                </Link>
                <Link to="/repair-status" className="bg-transparent text-white font-medium py-3 px-8 rounded-lg border border-white hover:bg-white hover:text-primary transition-colors duration-300">
                  Check Status
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <img 
                src="https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Electronics repair technician" 
                className="rounded-lg shadow-lg max-h-96 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Repair Status Check */}
      <section className="py-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="transform -mt-20 relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-text font-heading">Check Your Repair Status</h2>
              <p className="text-text-secondary">Enter your job number to see the current status of your repair</p>
            </div>
            
            {!jobDetails ? (
              <>
                <form onSubmit={handleCheckStatus} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                      placeholder="Enter your job number (e.g., 1001)"
                      className={`form-input ${error ? 'border-error focus:ring-error' : ''}`}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    rightIcon={isLoading ? null : <Search size={18} />}
                    isLoading={isLoading}
                  >
                    Check Status
                  </Button>
                </form>
                
                {error && (
                  <div className="mt-4 p-3 bg-error-light text-error rounded-lg flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            ) : (
              <div>
                {/* Show job details similar to RepairStatusPage */}
                <div className="mb-6">
                  <button 
                    onClick={() => setJobDetails(null)}
                    className="text-primary hover:text-primary-dark flex items-center"
                  >
                    <ChevronRight size={16} className="transform rotate-180 mr-1" />
                    <span>Check Another Repair</span>
                  </button>
                </div>
                
                <div className="border-b pb-4 mb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm mb-2">
                        Job #{jobDetails.job_id}
                      </span>
                      <h3 className="text-xl font-bold text-text font-heading">
                        {jobDetails.product_name} {jobDetails.model}
                      </h3>
                    </div>
                    
                    <div className="mt-2 md:mt-0">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full ${
                        jobDetails.repair_status?.toLowerCase() === 'completed' || 
                        jobDetails.repair_status?.toLowerCase() === 'ready for pickup'
                          ? 'bg-success-light text-success'
                          : jobDetails.repair_status?.toLowerCase() === 'in progress'
                          ? 'bg-primary-light text-primary'
                          : 'bg-warning-light text-warning'
                      }`}>
                        {getStatusIcon(jobDetails.repair_status)}
                        <span className="ml-2 font-medium">{jobDetails.repair_status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Repair Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-text-secondary">Repair Issue</p>
                        <p className="text-text">{jobDetails.repair_description}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-text-secondary">Handover Date</p>
                        <p>{formatDate(jobDetails.handover_date)}</p>
                      </div>
                      
                      {jobDetails.warranty_eligible && (
                        <div className="flex items-center text-success">
                          <ShieldCheck size={16} className="mr-1" />
                          <span>Covered under warranty</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Assignment</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-text-secondary">Technician</p>
                        <p>{jobDetails.assigned_employee_name || 'Not yet assigned'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-text-secondary">Status</p>
                        <p className="text-text-secondary mb-3">
                          {jobDetails.repair_status?.toLowerCase() === 'completed' ? 
                            'Your repair has been completed! You can pick up your device any time during our business hours.' :
                            jobDetails.repair_status?.toLowerCase() === 'in progress' ?
                            'Your device is currently being repaired by our technician.' :
                            'Your repair is being processed. Our team will update the status as it progresses.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <Link 
                    to="/repair-status"
                    className="text-primary hover:text-primary-dark"
                  >
                    View Full Details
                  </Link>
                  
                  <Link 
                    // to={`/repair-details/${jobDetails.job_id}`}
                    // className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 inline-flex items-center"
                  >
                    {/* Detailed Status */}
                    {/* <ChevronRight size={16} className="ml-1" /> */}
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
      
      {/* Our Services */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text font-heading mb-4">Our Repair Services</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              We provide expert repair services for all types of electronics, from smartphones to gaming consoles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Smartphone size={36} />, title: 'Smartphone Repair', description: 'Screen replacement, battery issues, water damage, and more.' },
              { icon: <Laptop size={36} />, title: 'Laptop Repair', description: 'Screen replacement, keyboard issues, battery replacement, upgrades.' },
              { icon: <Monitor size={36} />, title: 'Desktop PC Repair', description: 'Hardware upgrades, virus removal, performance issues, custom builds.' },
              { icon: <Tablet size={36} />, title: 'Tablet Repair', description: 'Screen fixes, battery replacement, charging issues, button repair.' },
              { icon: <Tv size={36} />, title: 'TV Repair', description: 'Screen issues, power problems, HDMI port repair, smart TV updates.' },
              { icon: <Gamepad2 size={36} />, title: 'Game Console Repair', description: 'Disc reader issues, controller repair, overheating, HDMI port fixes.' }
            ].map((service, index) => (
              <Card key={index} hoverable className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary-light rounded-full text-primary mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 text-text">{service.title}</h3>
                <p className="text-text-secondary mb-4">{service.description}</p>
                <Link to="/new-booking" className="text-primary font-medium inline-flex items-center hover:text-primary-dark">
                  Book Now
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text font-heading mb-4">How It Works</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Our simple process makes it easy to get your device repaired quickly and hassle-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Search size={40} />, title: 'Book a Repair', description: 'Schedule a repair through our online booking system or by phone.' },
              { icon: <Tool size={40} />, title: 'We Fix It', description: 'Our expert technicians diagnose and repair your device with quality parts.' },
              { icon: <CheckCircle size={40} />, title: 'Get it Back', description: 'Pick up your device or have it delivered back to you, good as new.' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full text-white mb-6">
                    {step.icon}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gray-200 -translate-y-1/2 -translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 text-text">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Technician repairing laptop" 
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-text font-heading mb-6">Why Choose Us?</h2>
              
              <div className="space-y-6">
                {[
                  { icon: <CheckCircle size={24} className="text-success" />, title: 'Expert Technicians', description: 'Our certified technicians have years of experience repairing all types of electronics.' },
                  { icon: <Clock size={24} className="text-primary" />, title: 'Quick Turnaround', description: 'Most repairs are completed within 24-48 hours, getting your device back to you faster.' },
                  { icon: <Star size={24} className="text-warning" />, title: 'Quality Guaranteed', description: 'We use only high-quality replacement parts and offer warranty on all our repairs.' },
                  { icon: <Smartphone size={24} className="text-accent" />, title: 'Free Diagnostics', description: 'We\'ll diagnose your device issue for free - you only pay for the repairs you approve.' }
                ].map((feature, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-4">{feature.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold font-heading mb-1 text-text">{feature.title}</h3>
                      <p className="text-text-secondary">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link to="/new-booking" className="btn-primary">
                  Book Your Repair
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
            Ready to get your device fixed?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Book your repair today and get your electronics back up and running in no time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/new-booking" className="bg-white text-primary font-medium py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              Book a Repair
            </Link>
            <Link to="/repair-status" className="bg-transparent text-white font-medium py-3 px-8 rounded-lg border border-white hover:bg-white hover:text-primary transition-colors duration-300">
              Check Status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;