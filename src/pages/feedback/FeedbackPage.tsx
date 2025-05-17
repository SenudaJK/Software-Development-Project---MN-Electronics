import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FeedbackForm from './FeedbackForm';

const FeedbackPage: React.FC = () => {
  const { jobId: jobIdParam } = useParams<{ jobId: string }>(); // Get jobId from URL params
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackExists, setFeedbackExists] = useState(false);
  
  // Parse jobId as number
  const jobId = jobIdParam ? parseInt(jobIdParam, 10) : 0;

  useEffect(() => {
    console.log("FeedbackPage - jobId from URL params:", jobIdParam);
    console.log("FeedbackPage - jobId parsed as number:", jobId);
    
    // Check if feedback already exists for this job
    const checkExistingFeedback = async () => {
      if (!jobId || !user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // First check if user has access to this job
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!jobResponse.data) {
          setError('Job not found or you do not have access to it.');
          setIsLoading(false);
          return;
        }
        
        // Check if feedback already exists
        const feedbackResponse = await axios.get(`http://localhost:5000/api/jobs/feedback/customer/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (Array.isArray(feedbackResponse.data)) {
          const hasExistingFeedback = feedbackResponse.data.some(
            (item: any) => item.Job_ID === jobId
          );
          
          setFeedbackExists(hasExistingFeedback);
        }
        
      } catch (err) {
        console.error('Error checking feedback existence:', err);
        setError('Could not verify feedback status.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingFeedback();
  }, [jobId, user]);
  
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };
  
  const handleFeedbackSuccess = () => {
    setFeedbackExists(true);
    // Optionally navigate back to dashboard after a delay
    setTimeout(() => navigate('/dashboard'), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="page-container max-w-3xl mx-auto my-8">
      <button 
        onClick={handleBackClick}
        className="mb-6 flex items-center text-text-secondary hover:text-text"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-bold text-text font-heading mb-6">
        Repair Feedback
      </h1>
      
      {error && (
        <div className="mb-6 bg-error-light text-error p-4 rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {feedbackExists ? (
        <div className="bg-success-light text-success p-6 rounded-lg flex flex-col items-center text-center">
          <CheckCircle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Feedback Already Submitted</h2>
          <p className="mb-4">You have already provided feedback for this repair.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary font-medium hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <FeedbackForm 
          jobId={jobId} 
          onSubmitSuccess={handleFeedbackSuccess} 
        />
      )}
    </div>
  );
};

export default FeedbackPage;