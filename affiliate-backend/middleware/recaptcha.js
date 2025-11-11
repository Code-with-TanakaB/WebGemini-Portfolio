const axios = require('axios');

/**
 * reCAPTCHA v2 Verification Middleware
 * Verifies Google reCAPTCHA v2 token from client requests
 * 
 * Usage: Add this middleware to routes that need reCAPTCHA protection
 * Example: router.post('/signup', verifyRecaptcha, (req, res) => { ... })
 */

const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body.recaptcha_token;
  
  // Skip verification in development if no secret key is set
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.warn('⚠️  RECAPTCHA_SECRET_KEY not set - skipping verification (development mode)');
    return next();
  }

  // Check if token exists - allow in development if missing
  if (!recaptchaToken) {
    console.warn('⚠️  No reCAPTCHA token provided');
    if (process.env.NODE_ENV !== 'production') {
      console.warn('   Allowing request in development mode');
      return next();
    }
    return res.status(400).json({
      success: false,
      message: 'reCAPTCHA verification required. Please complete the CAPTCHA.'
    });
  }

  try {
    // Verify token with Google reCAPTCHA API
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post(verificationUrl, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
        remoteip: req.ip || req.connection.remoteAddress
      }
    });

    const { success, score, 'error-codes': errorCodes } = response.data;

    // Check if verification was successful
    if (!success) {
      console.error('reCAPTCHA verification failed:', errorCodes);
      
      // In development, log error but allow request
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  reCAPTCHA failed but allowing in development mode');
        return next();
      }
      
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
        error_codes: errorCodes
      });
    }

    // For reCAPTCHA v3, check score (optional)
    if (score !== undefined && score < 0.5) {
      console.warn(`Low reCAPTCHA score: ${score}`);
      // Still allow in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Low score but allowing in development mode');
        return next();
      }
    }

    // Verification successful
    console.log('✅ reCAPTCHA verified successfully');
    next();

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error.message);
    
    // In production, fail closed (reject on error)
    // In development, fail open (allow on error)
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        message: 'reCAPTCHA verification error. Please try again.'
      });
    } else {
      // Development: Log warning but allow request
      console.warn('⚠️  reCAPTCHA verification error in development mode - allowing request');
      next();
    }
  }
};

module.exports = { verifyRecaptcha };
