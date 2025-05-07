import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import axios from 'axios';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  
  useEffect(() => {
    const confirmPaymentWithBackend = async () => {
      if (!paymentIntentId || !paymentIntentClientSecret) return;
      
      try {
        // Call your backend to confirm the payment was successful
        await axios.post('http://localhost:5000/api/payments/confirm-payment', {
          paymentIntentId,
          paymentIntentClientSecret
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Payment confirmed with backend
      } catch (err) {
        console.error('Error confirming payment with backend:', err);
      }
    };
    
    confirmPaymentWithBackend();
  }, [paymentIntentId, paymentIntentClientSecret]);
  
  return (
    <div className="page-container">
      <Card className="text-center py-12 max-w-md mx-auto">
        <div className="w-20 h-20 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-success" />
        </div>
        
        <h2 className="text-2xl font-bold text-text mb-4">Payment Successful!</h2>
        
        <p className="text-text-secondary mb-8">
          Your payment has been processed successfully. Thank you for your business!
        </p>
        
        {paymentIntentId && (
          <p className="text-text-secondary mb-8">
            Payment Reference: <span className="font-medium">{paymentIntentId}</span>
          </p>
        )}
        
        <div className="flex justify-center">
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;