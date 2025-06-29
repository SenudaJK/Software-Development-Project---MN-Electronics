const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const { body, validationResult } = require('express-validator');
const twilio = require('twilio');
const { sendEmail, sendVerificationCodeEmail } = require('../services/emailService'); // Import email service
require('dotenv').config();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
    
    // Use the centralized email service instead of direct transporter
    const result = await sendVerificationCodeEmail(email, code, {
      name: 'Customer' // You can customize this if you have the customer name
    });
    
    if (result.error) {
      console.error('Error sending email:', result.error);
      return false;
    }
    
    console.log(`Email sent successfully`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', error.message);
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
    
    const { email, phoneNumber, purpose } = req.body;
    
    try {
      // Check if this email already has a password set in the customers table
      // Skip this check if purpose is 'recovery' or 'reset'
      if (email && purpose !== 'recovery' && purpose !== 'reset') {
        const [existingCustomers] = await db.query(
          'SELECT id FROM customers WHERE email = ? AND password IS NOT NULL',
          [email]
        );
        
        if (existingCustomers.length > 0) {
          return res.status(403).json({
            success: false,
            message: 'An account with this email already exists. Please log in or use password recovery.',
            accountExists: true
          });
        }
      }
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in database with expiration (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes from now
      
      // Development mode log
      if (isDevelopment) {
        devLog('Verification request received');
        devLog('Purpose:', purpose || 'not specified');
        devLog('Generated code:', code);
        devLog('Contact method:', email ? `Email: ${email}` : `Phone: ${phoneNumber}`);
        devLog('Code will expire at:', expiresAt);
      }
      
      // For phone number verification
      if (phoneNumber) {
        // Check if this phone is associated with an existing account
        // We'd need a telephones table JOIN or separate check here if phone numbers
        // are stored in a separate table
        
        // Proceed with existing phone verification code...
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

// Add these new routes after your existing routes

/**
 * Verify reset code and reset password
 * @route POST /api/auth/reset-password
 */
router.post('/reset-password', [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid verification code'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one uppercase letter, one number, and one symbol')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, code, newPassword } = req.body;
  
  try {
    // Get user ID
    const [users] = await db.query(
      'SELECT id FROM customers WHERE email = ?', // Changed from customer_id to id
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    const userId = users[0].id; // Changed from customer_id to id
    
    // Check if code exists and is valid
    const [codes] = await db.query(
      'SELECT * FROM reset_codes WHERE customer_id = ? AND code = ? AND expires_at > NOW()',
      [userId, code]
    );
    
    if (codes.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    // Hash the new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await db.query(
      'UPDATE customers SET password = ? WHERE id = ?', // Changed from customer_id to id
      [hashedPassword, userId]
    );
    
    // Delete used reset code
    await db.query(
      'DELETE FROM reset_codes WHERE customer_id = ?',
      [userId]
    );
    
    // Development mode log
    if (isDevelopment) {
      devLog('Password reset successful');
      devLog('Email:', email);
      devLog('User ID:', userId);
    }
    
    res.status(200).json({ message: 'Password has been reset successfully' });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// /**
//  * Verify reset code and reset password
//  * @route POST /api/auth/reset-password
//  */
// router.post('/reset-password', [
//   body('email').isEmail().withMessage('Please provide a valid email address'),
//   body('code').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid verification code'),
//   body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
//     .matches(/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one uppercase letter, one number, and one symbol')
// ], async (req, res) => {
//   // Validate request
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { email, code, newPassword } = req.body;
  
//   try {
//     // Get user ID
//     const [users] = await db.query(
//       'SELECT customer_id FROM customers WHERE email = ?', 
//       [email]
//     );
    
//     if (users.length === 0) {
//       return res.status(400).json({ message: 'Invalid or expired reset code' });
//     }
    
//     const userId = users[0].customer_id;
    
//     // Check if code exists and is valid
//     const [codes] = await db.query(
//       'SELECT * FROM reset_codes WHERE customer_id = ? AND code = ? AND expires_at > NOW()',
//       [userId, code]
//     );
    
//     if (codes.length === 0) {
//       return res.status(400).json({ message: 'Invalid or expired reset code' });
//     }
    
//     // Hash the new password
//     const bcrypt = require('bcrypt');
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
    
//     // Update user password
//     await db.query(
//       'UPDATE customers SET password = ? WHERE customer_id = ?',
//       [hashedPassword, userId]
//     );
    
//     // Delete used reset code
//     await db.query(
//       'DELETE FROM reset_codes WHERE customer_id = ?',
//       [userId]
//     );
    
//     // Development mode log
//     if (isDevelopment) {
//       devLog('Password reset successful');
//       devLog('Email:', email);
//       devLog('User ID:', userId);
//     }
    
//     res.status(200).json({ message: 'Password has been reset successfully' });
    
//   } catch (error) {
//     console.error('Password reset error:', error);
//     res.status(500).json({ message: 'Server error, please try again later' });
//   }
// });

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  
  try {
    // Check if user exists
    const [users] = await db.query(
      'SELECT id, firstName, lastName FROM customers WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset code' 
      });
    }
    
    const user = users[0];
    
    // Generate a random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in database with expiration (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Create reset_codes table if it doesn't exist
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS reset_codes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          customer_id INT NOT NULL,
          code VARCHAR(6) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
      `);
    } catch (tableErr) {
      console.error('Error creating reset_codes table:', tableErr);
    }
    
    // Delete any existing reset codes for this user
    await db.query(
      'DELETE FROM reset_codes WHERE customer_id = ?',
      [user.id] // Changed from user.customer_id to user.id
    );
    
    // Insert new reset code
    await db.query(
      'INSERT INTO reset_codes (customer_id, code, expires_at) VALUES (?, ?, ?)',
      [user.id, code, expiresAt] // Changed from user.customer_id to user.id
    );
    
    // Development mode log
    if (isDevelopment) {
      devLog('Password reset request received');
      devLog('Email:', email);
      devLog('Generated code:', code);
      devLog('Code will expire at:', expiresAt);
    }
    
    // Send verification email
    if (isDevelopment) {
      devLog(`Password reset code for ${email}: ${code}`);
      devLog('Email content would be sent with the following template:');
      devLog(`Subject: Reset Your Password - MN Electronics`);
      devLog('No actual email sent in development mode');
      
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset code',
        ...(isDevelopment && { code, devInfo: getDevModeInfo() })
      });
    } else {
      // Send actual email in production
      await sendVerificationCodeEmail(email, code, {
        name: `${user.firstName} ${user.lastName}`
      });
      
      res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset code' 
      });
    }
    
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

module.exports = router;