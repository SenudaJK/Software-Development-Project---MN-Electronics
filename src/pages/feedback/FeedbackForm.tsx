import React, { useState } from 'react';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
// import Input from './common/Input';

interface FeedbackFormProps {
  jobId: number;
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ jobId, onSubmitSuccess }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!feedback.trim()) {
      setError('Please enter your feedback before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/feedback', {
        jobId,
        feedback
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess(true);
      setFeedback('');
      
      // Call the callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
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
      
      {success && (
        <div className="mb-4 bg-success-light text-success p-3 rounded-lg">
          Your feedback has been submitted successfully.
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-error-light text-error p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="feedback" className="block mb-1 font-medium">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={5}
            placeholder="Please share your thoughts about our service..."
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FeedbackForm;