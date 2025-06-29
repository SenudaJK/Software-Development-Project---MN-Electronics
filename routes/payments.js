// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');
// const auth = require('../middleware/auth');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// // Create payment intent
// router.post('/create-payment-intent', auth, async (req, res) => {
//   const { amount, invoiceId, jobId } = req.body;
  
//   try {
//     // Create a payment intent with Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount * 100), // Convert to cents
//       currency: 'lkr',
//       metadata: {
//         invoice_id: invoiceId,
//         job_id: jobId,
//         customer_id: req.user.id
//       }
//     });
    
//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).json({ message: 'Failed to initialize payment' });
//   }
// });

// // Confirm payment successful
// router.post('/confirm-payment', auth, async (req, res) => {
//   const { paymentIntentId } = req.body;
  
//   try {
//     // Verify the payment intent with Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
//     if (paymentIntent.status === 'succeeded') {
//       const invoiceId = paymentIntent.metadata.invoice_id;
//       const jobId = paymentIntent.metadata.job_id;
      
//       // Record the payment in your database
//       const [result] = await db.query(
//         `INSERT INTO payments 
//          (invoice_id, job_id, customer_id, amount, payment_method, status, transaction_id) 
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           invoiceId, 
//           jobId, 
//           req.user.id, 
//           paymentIntent.amount / 100, // Convert back from cents
//           'card',
//           'completed',
//           paymentIntentId
//         ]
//       );
      
//       // Update the job status to fully paid
//       await db.query(
//         "UPDATE jobs SET repair_status = 'Paid' WHERE job_id = ?",
//         [jobId]
//       );
      
//       // Update the invoice to mark it as paid
//       await db.query(
//         "UPDATE invoice SET payment_status = 'paid', remaining_balance = 0 WHERE Invoice_Id = ?",
//         [invoiceId]
//       );
      
//       res.status(200).json({
//         success: true,
//         message: 'Payment confirmed and recorded'
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Payment has not been completed'
//       });
//     }
//   } catch (error) {
//     console.error('Error confirming payment:', error);
//     res.status(500).json({ message: 'Failed to confirm payment' });
//   }
// });

// module.exports = router;