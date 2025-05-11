const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust path as needed
const { body, validationResult } = require('express-validator');
const twilio = require('twilio');
const nodemailer = require('nodemailer'); // Add this import
require('dotenv').config();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Development mode detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Enhanced logging in development mode
const devLog = (...args) => {
  if (isDevelopment) {
    console.log('[DEV MODE]', ...args);
  }
};

// Add this helper function for better development mode experience
function getDevModeInfo() {
  return {
    mode: isDevelopment ? 'development' : 'production',
    features: isDevelopment ? {
      codeInResponse: true,
      skipActualSending: true,
      extendedLogs: true
    } : {},
    timestamp: new Date().toISOString()
  };
}

// Helper function for sending email verification
async function sendEmailVerification(email, code) {
  // If in development mode, just log and return success
  if (isDevelopment) {
    devLog(`Email verification code for ${email}: ${code}`);
    devLog('Email content would be sent with the following template:');
    devLog(`Subject: Your MN Electronics Verification Code`);
    devLog('No actual email sent in development mode');
    return true;
  }
  
  try {
    console.log(`Attempting to send email to ${email} with code: ${code}`);
    
    // Email content with professional formatting
    const mailOptions = {
      from: `"MN Electronics" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your MN Electronics Verification Code",
      text: `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">MN Electronics</h2>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Your Verification Code</h3>
            <p style="font-size: 16px;">Use the following code to complete your verification:</p>
            <div style="background-color: #ffffff; padding: 10px; border-radius: 5px; border: 1px solid #e1e1e1; text-align: center; margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</span>
            </div>
            <p style="color: #777; font-size: 14px;">This code will expire in 15 minutes.</p>
          </div>
          <div style="color: #777; font-size: 12px; text-align: center;">
            <p>If you did not request this code, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} MN Electronics. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication error - check your email credentials');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error - check your email service configuration');
    }
    
    return false;
  }
}

// Helper function for sending SMS verification
async function sendSMSVerification(phoneNumber, code) {
  // If in development mode, just log and return success
  if (isDevelopment) {
    devLog(`SMS verification code for ${phoneNumber}: ${code}`);
    devLog(`No actual SMS sent in development mode`);
    return true;
  }
  
  try {
    // Format phone number to international format if not already
    // Sri Lankan numbers should be formatted as +94XXXXXXXXX
    let formattedNumber = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      // Convert 07XXXXXXXX to +947XXXXXXXX
      formattedNumber = '+94' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('+')) {
      // If number doesn't start with +, assume it's a Sri Lankan number
      formattedNumber = '+94' + phoneNumber;
    }
    
    // Send SMS using Twilio
    const message = await twilioClient.messages.create({
      body: `Your MN Electronics verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    
    console.log(`SMS sent with SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

// Send verification code via email or SMS
router.post('/send-verification', [
  // Validate either email or phone is present
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phoneNumber) {
      throw new Error('Either email or phone number is required');
    }
    return true;
  }),
  // Validate email format if provided
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  // Validate phone format if provided
  body('phoneNumber')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number format')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, phoneNumber } = req.body;
    
    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in database with expiration (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes from now
      
      // Development mode log
      if (isDevelopment) {
        devLog('Verification request received');
        devLog('Generated code:', code);
        devLog('Contact method:', email ? `Email: ${email}` : `Phone: ${phoneNumber}`);
        devLog('Code will expire at:', expiresAt);
      }
      
      // For phone number verification
      if (phoneNumber) {
        // Check if table exists and create it if it doesn't
        try {
          await db.query(`
            CREATE TABLE IF NOT EXISTS verification_codes (
              id INT AUTO_INCREMENT PRIMARY KEY,
              code VARCHAR(10) NOT NULL,
              email VARCHAR(255) NULL,
              phone_number VARCHAR(20) NULL,
              expires_at DATETIME NOT NULL,
              used TINYINT(1) DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
        } catch (tableErr) {
          console.error('Error creating table:', tableErr);
        }

        // Store the code in the database
        try {
          const [existingCodes] = await db.query(
            'SELECT id FROM verification_codes WHERE phone_number = ? AND expires_at > NOW() AND used = 0',
            [phoneNumber]
          );
          
          if (existingCodes && existingCodes.length > 0) {
            // Update existing code
            await db.query(
              'UPDATE verification_codes SET code = ?, expires_at = ? WHERE id = ?',
              [code, expiresAt, existingCodes[0].id]
            );
            
            if (isDevelopment) {
              devLog('Updated existing verification code in database');
            }
          } else {
            // Create new verification code
            await db.query(
              'INSERT INTO verification_codes (code, email, phone_number, expires_at) VALUES (?, ?, ?, ?)',
              [code, null, phoneNumber, expiresAt]
            );
            
            if (isDevelopment) {
              devLog('Created new verification code in database');
            }
          }
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return res.status(500).json({
            success: false,
            message: 'Database error while storing verification code'
          });
        }

        // Send SMS or simulate in development mode
        const smsSent = await sendSMSVerification(phoneNumber, code);
        
        if (!smsSent && !isDevelopment) {
          return res.status(500).json({
            success: false,
            message: 'Failed to send SMS. Please try email verification instead.'
          });
        }
        
        return res.json({ 
          success: true,
          message: isDevelopment ? 
            'Verification code generated (DEV MODE - no SMS sent)' : 
            'Verification code sent to your phone',
          // Only include the code in development mode
          ...(isDevelopment && { code, devInfo: getDevModeInfo() })
        });
      }
      
      // If email is provided, send email verification
      if (email) {
        try {
          // Check if table exists and create it if it doesn't
          await db.query(`
            CREATE TABLE IF NOT EXISTS verification_codes (
              id INT AUTO_INCREMENT PRIMARY KEY,
              code VARCHAR(10) NOT NULL,
              email VARCHAR(255) NULL,
              phone_number VARCHAR(20) NULL,
              expires_at DATETIME NOT NULL,
              used TINYINT(1) DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
        } catch (tableErr) {
          console.error('Error creating table:', tableErr);
        }

        const [existingCodes] = await db.query(
          'SELECT id FROM verification_codes WHERE email = ? AND expires_at > NOW() AND used = 0',
          [email]
        );
        
        if (existingCodes.length > 0) {
          // Update existing code instead of creating a new one
          await db.query(
            'UPDATE verification_codes SET code = ?, expires_at = ? WHERE id = ?',
            [code, expiresAt, existingCodes[0].id]
          );
          
          if (isDevelopment) {
            devLog('Updated existing email verification code in database');
          }
        } else {
          // Create new code
          await db.query(
            'INSERT INTO verification_codes (code, email, phone_number, expires_at) VALUES (?, ?, ?, ?)',
            [code, email, null, expiresAt]
          );
          
          if (isDevelopment) {
            devLog('Created new email verification code in database');
          }
        }

        // Send email or simulate in development mode
        const emailSent = await sendEmailVerification(email, code);
        
        if (!emailSent && !isDevelopment) {
          return res.status(500).json({
            success: false,
            message: 'Failed to send email verification. Please check your email address or try again later.'
          });
        }
        
        return res.json({
          success: true,
          message: isDevelopment ? 
            'Verification code generated (DEV MODE - no email sent)' : 
            'Verification code sent to your email',
          // Only include the code and dev info in development mode
          ...(isDevelopment && { code, devInfo: getDevModeInfo() })
        });
      }
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send verification code',
        error: error.message
      });
    }
});

// Verify the code sent to email or phone
router.post('/verify-code', [
  // Validate that code is present
  body('code')
    .notEmpty().withMessage('Verification code is required'),
  // Validate that either email or phone is present
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phoneNumber) {
      throw new Error('Either email or phone number is required');
    }
    return true;
  })
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, phoneNumber, code } = req.body;
    
    try {
      // Build query based on provided parameters
      let query = 'SELECT * FROM verification_codes WHERE code = ? AND expires_at > NOW() AND used = 0 AND ';
      let params = [code];
      
      if (email) {
        query += 'email = ?';
        params.push(email);
      } else {
        query += 'phone_number = ?';
        params.push(phoneNumber);
      }
      
      const [codes] = await db.query(query, params);
      
      if (codes.length === 0) {
        return res.json({ 
          success: false,
          verified: false, 
          message: 'Invalid or expired verification code' 
        });
      }
      
      // Mark code as used
      await db.query('UPDATE verification_codes SET used = 1 WHERE id = ?', [codes[0].id]);
      
      return res.json({ 
        success: true,
        verified: true,
        message: 'Code verified successfully'
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to verify code',
        error: error.message
      });
    }
});

module.exports = router;