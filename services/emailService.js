const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize transporter based on environment
let transporter;

// Development mode: Use Ethereal for testing
if (process.env.NODE_ENV === 'development') {
  nodemailer.createTestAccount().then(testAccount => {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log(`Test email account created: ${testAccount.user}`);
  }).catch(err => {
    console.error('Failed to create test email account:', err);
  });
} 
// Production: Use Gmail with explicit SSL configuration
else {
  // Use nodemailer-smtp-transport with explicit SSL config
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
  
  // Verify the connection immediately to catch issues
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to send emails');
    }
  });
}

// Add a delay before sending emails to ensure transporter is ready
const sendEmail = async (to, subject, text, html) => {
  try {
    // Wait for transporter to be initialized if needed
    if (!transporter) {
      await new Promise(r => setTimeout(r, 2000));
      if (!transporter) {
        throw new Error('Email transporter not initialized');
      }
    }

    const mailOptions = {
      from: `"MN Electronics" <${process.env.EMAIL_USER || 'test@example.com'}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Show test URL if using Ethereal
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', error.message);
    // Instead of throwing, return failure info
    return { error: error.message, success: false };
  }
};

/**
 * Send repair completion notification to customer
 * @param {Object} customer - Customer information object
 * @param {Object} product - Product information object
 * @param {Object} job - Job information object
 */
const sendRepairCompletedEmail = async (customer, product, job) => {
  const subject = 'Your Repair is Completed - MN Electronics';
  
  const text = `
    Dear ${customer.firstName} ${customer.lastName},
    
    Great news! Your ${product.product_name} (${product.model}) has been repaired and is ready for pickup.
    
    Job Details:
    - Job ID: ${job.job_id}
    - Product: ${product.product_name} ${product.model}
    - Status: Completed
    
    You can collect your device at our shop during business hours.
    
    If you have any questions, please don't hesitate to contact us.
    
    Thank you for choosing MN Electronics!
    
    Best regards,
    MN Electronics Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #4a90e2;">Your Repair is Completed!</h2>
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      
      <p>Great news! Your <strong>${product.product_name} (${product.model})</strong> has been repaired and is ready for pickup.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Job Details:</h3>
        <p><strong>Job ID:</strong> ${job.job_id}</p>
        <p><strong>Product:</strong> ${product.product_name} ${product.model}</p>
        <p><strong>Status:</strong> <span style="color: #2ecc71; font-weight: bold;">Completed</span></p>
      </div>
      
      <p>You can collect your device at our shop during business hours.</p>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Thank you for choosing MN Electronics!</p>
      
      <p style="margin-top: 30px;">Best regards,<br>
      <strong>MN Electronics Team</strong></p>
    </div>
  `;
  
  return await sendEmail(customer.email, subject, text, html);
};

/**
 * Send verification code email to user
 * @param {string} email - User's email address
 * @param {string} code - The verification code
 * @param {Object} options - Additional options (name, etc.)
 * @returns {Promise} - Email sending result
 */
const sendVerificationCodeEmail = async (email, code, options = {}) => {
  const subject = 'Your Verification Code - MN Electronics';
  
  const text = `
    Dear ${options.name || 'Customer'},
    
    Your verification code is: ${code}
    
    This code will expire in 15 minutes.
    
    If you did not request this code, please ignore this email.
    
    Thank you,
    MN Electronics Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #4a90e2;">Your Verification Code</h2>
      <p>Dear ${options.name || 'Customer'},</p>
      
      <p>Please use the following code to verify your account:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <h1 style="font-family: monospace; letter-spacing: 5px; font-size: 32px; margin: 10px 0;">${code}</h1>
      </div>
      
      <p><strong>This code will expire in 15 minutes.</strong></p>
      
      <p>If you didn't request this code, please ignore this email.</p>
      
      <p style="margin-top: 30px;">Thank you,<br>
      <strong>MN Electronics Team</strong></p>
    </div>
  `;
  
  return await sendEmail(email, subject, text, html);
};

module.exports = {
  sendEmail,
  sendRepairCompletedEmail,
  sendVerificationCodeEmail  // Export the new function
};