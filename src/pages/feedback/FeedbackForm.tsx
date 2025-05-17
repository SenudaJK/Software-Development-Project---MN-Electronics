import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface FeedbackFormProps {
  jobId: number;
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ jobId, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [jobDetails, setJobDetails] = useState<any>(null);

  // Fetch job details when component mounts
  useEffect(() => {
    console.log("FeedbackForm received jobId:", jobId);
    
    // Verify jobId is valid
    if (!jobId || isNaN(jobId) || jobId <= 0) {
      console.error("Invalid jobId provided to FeedbackForm:", jobId);
      return;
    }
    
    // Fetch job details to verify we can access it and show relevant info
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/job-details/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log("Job details fetched:", response.data);
        setJobDetails(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
      }
    };
    
    fetchJobDetails();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting feedback for jobId:", jobId);
    
    // Validate inputs
    if (!jobId || isNaN(jobId) || jobId <= 0) {
      setError('Valid job ID is required.');
      return;
    }
    
    if (!feedback.trim()) {
      setError('Please enter your feedback before submitting');
      return;
    }
    
    // Ensure user is authenticated
    if (!user?.id) {
      setError('User authentication issue. Please log in again.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/jobs/feedback', {
        jobId,
        feedback,
        userId: user.id // Include user ID for authentication verification
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Feedback submission response:", response.data);
      
      setSuccess(true);
      setFeedback('');
      
      // Call the callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-text font-heading mb-4">Submit Feedback</h2>
      
      {/* Display job details if available */}
      {jobDetails && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">Providing feedback for:</p>
          <p>{jobDetails.product_name} {jobDetails.model} (Job #{jobId})</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-success-light text-success p-3 rounded-lg">
          Your feedback has been submitted successfully.
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-error-light text-error p-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feedback" className="block mb-1 font-medium">
            Your Feedback<span className="text-error ml-1">*</span>
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={5}
            placeholder="Please share your thoughts about our repair service..."
            disabled={isSubmitting || success}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || success}
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FeedbackForm;