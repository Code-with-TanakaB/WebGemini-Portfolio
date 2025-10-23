const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbHelpers } = require('../models/database');
const { verifyToken, verifyAdmin, verifyAffiliate } = require('../middleware/auth');

const router = express.Router();

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validation rules for client signup
const clientSignupValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('phone').optional().trim().isLength({ min: 10, max: 20 }).withMessage('Phone must be 10-20 characters'),
  body('plan_type').trim().notEmpty().withMessage('Plan type is required'),
  body('plan_price').isFloat({ min: 0 }).withMessage('Plan price must be a positive number'),
  body('coupon_code').optional().trim().isLength({ max: 20 }).isAlphanumeric().withMessage('Invalid coupon code')
];

// Calculate commission based on plan type
function calculateCommission(planType, planPrice) {
  const lowerPlanType = planType.toLowerCase();
  let commissionRate = 0;

  // Starter plan gets 10% commission
  if (lowerPlanType.includes('starter') || lowerPlanType.includes('basic')) {
    commissionRate = 0.10;
  } 
  // High-tier plans (premium, enterprise, pro, advanced) get 25% commission
  else if (
    lowerPlanType.includes('premium') || 
    lowerPlanType.includes('enterprise') || 
    lowerPlanType.includes('pro') || 
    lowerPlanType.includes('advanced') ||
    lowerPlanType.includes('high-tier')
  ) {
    commissionRate = 0.25;
  }
  // Default to 10% for unknown plans
  else {
    commissionRate = 0.10;
  }

  const commissionAmount = planPrice * commissionRate;
  
  return {
    rate: commissionRate,
    amount: commissionAmount
  };
}

// Admin: Get all affiliates
router.get('/all', verifyToken, verifyAdmin, (req, res) => {
  dbHelpers.getAllAffiliates((err, affiliates) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching affiliates.' 
      });
    }

    res.json({
      success: true,
      affiliates
    });
  });
});

// Admin: Get overall statistics
router.get('/admin/stats', verifyToken, verifyAdmin, (req, res) => {
  dbHelpers.getOverallStats((err, stats) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching statistics.' 
      });
    }

    res.json({
      success: true,
      stats: {
        total_affiliates: stats.total_affiliates || 0,
        total_clients: stats.total_clients || 0,
        total_revenue: stats.total_revenue || 0,
        total_commissions: stats.total_commissions || 0,
        pending_commissions: stats.pending_commissions || 0,
        paid_commissions: stats.paid_commissions || 0
      }
    });
  });
});

// Admin: Get all clients with affiliate information
router.get('/admin/clients', verifyToken, verifyAdmin, (req, res) => {
  dbHelpers.getAllClientsWithAffiliates((err, clients) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching clients.' 
      });
    }

    res.json({
      success: true,
      clients
    });
  });
});

// Get affiliate's own statistics
router.get('/stats', verifyToken, verifyAffiliate, (req, res) => {
  const affiliateId = req.user.id;

  dbHelpers.getAffiliateStats(affiliateId, (err, stats) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching affiliate statistics.' 
      });
    }

    res.json({
      success: true,
      stats: {
        total_referrals: stats.total_referrals || 0,
        total_earnings: stats.total_earnings || 0,
        pending_earnings: stats.pending_earnings || 0,
        paid_earnings: stats.paid_earnings || 0
      }
    });
  });
});

// Get affiliate's referrals
router.get('/referrals', verifyToken, verifyAffiliate, (req, res) => {
  const affiliateId = req.user.id;

  dbHelpers.getAffiliateReferrals(affiliateId, (err, referrals) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching referrals.' 
      });
    }

    res.json({
      success: true,
      referrals
    });
  });
});

// Track new client signup (public endpoint - called from signup form)
router.post('/track-signup', clientSignupValidation, (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  let { name, email, phone, plan_type, plan_price, coupon_code } = req.body;
  
  // Sanitize inputs
  name = sanitizeInput(name);
  email = sanitizeInput(email);
  phone = phone ? sanitizeInput(phone) : null;
  plan_type = sanitizeInput(plan_type);
  coupon_code = coupon_code ? sanitizeInput(coupon_code).toUpperCase() : null;

  // If no coupon code provided, create client without affiliate
  if (!coupon_code) {
    dbHelpers.createClient({
      name,
      email,
      phone: phone || null,
      plan_type,
      plan_price,
      coupon_code: null,
      affiliate_id: null
    }, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ 
            success: false, 
            message: 'Email already exists.' 
          });
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Error creating client record.' 
        });
      }

      res.status(201).json({
        success: true,
        message: 'Client registered successfully.',
        client_id: this.lastID
      });
    });
    return;
  }

  // Verify coupon code and get affiliate
  dbHelpers.getAffiliateByCoupon(coupon_code.toUpperCase(), (err, affiliate) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error verifying coupon code.' 
      });
    }

    if (!affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid coupon code.' 
      });
    }

    // Create client record
    dbHelpers.createClient({
      name,
      email,
      phone: phone || null,
      plan_type,
      plan_price,
      coupon_code: coupon_code.toUpperCase(),
      affiliate_id: affiliate.id
    }, function(clientErr) {
      if (clientErr) {
        if (clientErr.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ 
            success: false, 
            message: 'Email already exists.' 
          });
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Error creating client record.' 
        });
      }

      const clientId = this.lastID;

      // Calculate commission
      const commission = calculateCommission(plan_type, plan_price);

      // Create commission record
      dbHelpers.createCommission({
        affiliate_id: affiliate.id,
        client_id: clientId,
        plan_type,
        plan_price,
        commission_rate: commission.rate,
        commission_amount: commission.amount
      }, (commErr) => {
        if (commErr) {
          console.error('Error creating commission:', commErr);
          // Continue anyway, client is created
        }

        res.status(201).json({
          success: true,
          message: 'Client registered successfully with affiliate tracking.',
          client_id: clientId,
          affiliate: affiliate.full_name,
          commission_amount: commission.amount
        });
      });
    });
  });
});

// Verify coupon code (public endpoint - for frontend validation)
router.post('/verify-coupon', (req, res) => {
  const { coupon_code } = req.body;

  if (!coupon_code) {
    return res.status(400).json({ 
      success: false, 
      message: 'Coupon code is required.' 
    });
  }

  dbHelpers.getAffiliateByCoupon(coupon_code.toUpperCase(), (err, affiliate) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error verifying coupon code.' 
      });
    }

    if (!affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid coupon code.' 
      });
    }

    res.json({
      success: true,
      message: 'Valid coupon code.',
      affiliate_name: affiliate.full_name
    });
  });
});

module.exports = router;
