const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbHelpers, pool } = require('../models');
const { verifyToken, verifyAdmin, verifyAffiliate } = require('../middleware/auth');
const { spamProtection } = require('../middleware/spam-protection');

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
  body('coupon_code').optional().trim().isLength({ max: 20 }).matches(/^[A-Z0-9@]+$/i).withMessage('Invalid coupon code format')
];

// Calculate commission based on plan type
function calculateCommission(planType, planPrice) {
  const lowerPlanType = planType.toLowerCase();
  let commissionRate = 0;

  // Starter plan gets 10% commission
  if (lowerPlanType.includes('starter')) {
    commissionRate = 0.10;
  } 
  // Professional plan gets 15% commission
  else if (lowerPlanType.includes('professional')) {
    commissionRate = 0.15;
  }
  // Enterprise plan gets 20% commission
  else if (lowerPlanType.includes('enterprise')) {
    commissionRate = 0.20;
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
router.post('/track-signup', clientSignupValidation, spamProtection, (req, res) => {
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

// Update affiliate status (archive/activate) - Admin only
router.patch('/admin/affiliates/:id/status', verifyToken, verifyAdmin, (req, res) => {
  const affiliateId = parseInt(req.params.id);
  const { status } = req.body;

  // Validate status
  if (!['active', 'archived', 'inactive'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: active, archived, or inactive'
    });
  }

  const { db } = require('../models/database');
  
  db.run(
    'UPDATE affiliates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = "affiliate"',
    [status, affiliateId],
    function(err) {
      if (err) {
        console.error('Error updating affiliate status:', err);
        return res.status(500).json({
          success: false,
          message: 'Error updating affiliate status'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Affiliate not found'
        });
      }

      res.json({
        success: true,
        message: `Affiliate ${status === 'archived' ? 'archived' : 'status updated'} successfully`
      });
    }
  );
});

// Delete affiliate permanently - Admin only
router.delete('/admin/affiliates/:id', verifyToken, verifyAdmin, (req, res) => {
  const affiliateId = parseInt(req.params.id);

  const { db } = require('../models/database');

  // Start transaction to delete related data
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Delete commissions
    db.run('DELETE FROM commissions WHERE affiliate_id = ?', [affiliateId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({
          success: false,
          message: 'Error deleting affiliate commissions'
        });
      }

      // Delete referrals
      db.run('DELETE FROM referrals WHERE affiliate_id = ?', [affiliateId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({
            success: false,
            message: 'Error deleting affiliate referrals'
          });
        }

        // Update clients to remove affiliate reference
        db.run('UPDATE clients SET affiliate_id = NULL WHERE affiliate_id = ?', [affiliateId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({
              success: false,
              message: 'Error updating client records'
            });
          }

          // Delete affiliate
          db.run('DELETE FROM affiliates WHERE id = ? AND role = "affiliate"', [affiliateId], function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({
                success: false,
                message: 'Error deleting affiliate'
              });
            }

            if (this.changes === 0) {
              db.run('ROLLBACK');
              return res.status(404).json({
                success: false,
                message: 'Affiliate not found or cannot delete admin'
              });
            }

            db.run('COMMIT');
            res.json({
              success: true,
              message: 'Affiliate deleted successfully'
            });
          });
        });
      });
    });
  });
});

// Update client status (archive/activate) - Admin only
router.patch('/admin/clients/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  const clientId = req.params.id;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['active', 'archived', 'inactive'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: active, archived, or inactive'
    });
  }

  // Use PostgreSQL if available, otherwise SQLite
  if (process.env.DATABASE_URL) {
    try {
      const result = await pool.query(
        'UPDATE clients SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, clientId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      res.json({
        success: true,
        message: `Client ${status === 'archived' ? 'archived' : 'activated'} successfully`,
        client: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating client status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating client status'
      });
    }
  } else {
    // SQLite fallback
    const { db } = require('../models/database');
    db.run(
      'UPDATE clients SET status = ? WHERE id = ?',
      [status, clientId],
      function(err) {
        if (err) {
          console.error('Error updating client status:', err);
          return res.status(500).json({
            success: false,
            message: 'Error updating client status'
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: 'Client not found'
          });
        }

        res.json({
          success: true,
          message: `Client ${status === 'archived' ? 'archived' : 'activated'} successfully`
        });
      }
    );
  }
});

// Mark client as paid - Admin only (NEW ENDPOINT)
router.patch('/admin/clients/:id/mark-paid', verifyToken, verifyAdmin, async (req, res) => {
  const clientId = req.params.id;

  // Use PostgreSQL if available, otherwise SQLite
  if (process.env.DATABASE_URL) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update client status to 'paid'
      const clientResult = await client.query(
        'UPDATE clients SET status = $1 WHERE id = $2 RETURNING *',
        ['paid', clientId]
      );

      if (clientResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Update associated commission to 'paid'
      const commissionResult = await client.query(
        'UPDATE commissions SET status = $1, paid_at = NOW() WHERE client_id = $2 RETURNING *',
        ['paid', clientId]
      );

      await client.query('COMMIT');
      client.release();

      res.json({
        success: true,
        message: 'Client marked as paid and affiliate commission updated',
        client: clientResult.rows[0],
        commission: commissionResult.rows[0] || null
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Error marking client as paid:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking client as paid'
      });
    }
  } else {
    // SQLite fallback with transaction
    const { db } = require('../models/database');
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Update client status
      db.run('UPDATE clients SET status = ? WHERE id = ?', ['paid', clientId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({
            success: false,
            message: 'Error updating client status'
          });
        }

        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'Client not found'
          });
        }

        // Update commission status and paid_at
        db.run(
          'UPDATE commissions SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE client_id = ?',
          ['paid', clientId],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({
                success: false,
                message: 'Error updating commission'
              });
            }

            db.run('COMMIT');
            res.json({
              success: true,
              message: 'Client marked as paid and affiliate commission updated'
            });
          }
        );
      });
    });
  }
});

// Delete client permanently - Admin only
router.delete('/admin/clients/:id', verifyAdmin, async (req, res) => {
  const clientId = req.params.id;

  // Use PostgreSQL if available, otherwise SQLite
  if (process.env.DATABASE_URL) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete associated commissions first
      await client.query('DELETE FROM commissions WHERE client_id = $1', [clientId]);

      // Delete associated referrals
      await client.query('DELETE FROM referrals WHERE client_id = $1', [clientId]);

      // Delete the client
      const result = await client.query('DELETE FROM clients WHERE id = $1 RETURNING *', [clientId]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      await client.query('COMMIT');
      client.release();

      res.json({
        success: true,
        message: 'Client and all associated data deleted successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Error deleting client:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting client'
      });
    }
  } else {
    // SQLite fallback with transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error starting transaction'
        });
      }

      // Delete commissions
      db.run('DELETE FROM commissions WHERE client_id = ?', [clientId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({
            success: false,
            message: 'Error deleting client commissions'
          });
        }

        // Delete referrals
        db.run('DELETE FROM referrals WHERE client_id = ?', [clientId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({
              success: false,
              message: 'Error deleting client referrals'
            });
          }

          // Delete client
          db.run('DELETE FROM clients WHERE id = ?', [clientId], function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({
                success: false,
                message: 'Error deleting client'
              });
            }

            if (this.changes === 0) {
              db.run('ROLLBACK');
              return res.status(404).json({
                success: false,
                message: 'Client not found'
              });
            }

            db.run('COMMIT');
            res.json({
              success: true,
              message: 'Client deleted successfully'
            });
          });
        });
      });
    });
  }
});

module.exports = router;

