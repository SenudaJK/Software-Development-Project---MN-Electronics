import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import Button from '../common/Button';

interface StripePaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (errorMessage: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  amount, 
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);

    // Confirm payment with Stripe.js
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`, // Redirect on success
      },
      redirect: 'if_required'
    });

    if (error) {
      // Show error message
      onPaymentError(error.message || "An unknown error occurred");
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful
      onPaymentSuccess();
    } else {
      // Some other unexpected state
      onPaymentError("Something went wrong with your payment. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      <Button
        variant="accent"
        type="submit"
        className="w-full"
        isLoading={isProcessing}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay Rs. ${amount.toFixed(2)}`}
      </Button>
      
      <p className="text-xs text-text-secondary text-center mt-4">
        Secured by Stripe. Your payment information is encrypted.
      </p>
    </form>
  );
};

export default StripePaymentForm;