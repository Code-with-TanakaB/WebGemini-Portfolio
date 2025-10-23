const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { dbHelpers } = require('../models/database');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validation rules
const loginValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('coupon_code').trim().isLength({ min: 3, max: 20 }).isAlphanumeric().withMessage('Coupon code must be 3-20 alphanumeric characters')
];

// Login endpoint
router.post('/login', loginValidation, (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required.' 
    });
  }

  dbHelpers.getAffiliateByLogin(username, (err, user) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error occurred.' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials.' 
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is inactive. Please contact admin.' 
      });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials.' 
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        coupon_code: user.coupon_code
      }
    });
  });
});

// Register new affiliate
router.post('/register', registerValidation, (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let { username, email, password, full_name, coupon_code } = req.body;
  
  // Sanitize inputs
  username = sanitizeInput(username);
  email = sanitizeInput(email);
  full_name = sanitizeInput(full_name);
  coupon_code = sanitizeInput(coupon_code);

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create affiliate
  dbHelpers.createAffiliate({
    username,
    email,
    password: hashedPassword,
    full_name,
    coupon_code: coupon_code.toUpperCase()
  }, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username, email, or coupon code already exists.' 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating affiliate account.' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Affiliate account created successfully.',
      affiliate_id: this.lastID
    });
  });
});

// Verify token endpoint (check if user is still authenticated)
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Get current user profile
router.get('/profile', verifyToken, (req, res) => {
  dbHelpers.getAffiliateById(req.user.id, (err, user) => {
    if (err || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        coupon_code: user.coupon_code,
        role: user.role,
        status: user.status,
        created_at: user.created_at
      }
    });
  });
});

module.exports = router;
