const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Middleware to verify admin JWT token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin login
router.post('/login', [
    body('username').trim().notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        
        const [users] = await db.query(
            'SELECT * FROM admin_users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await db.query(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Get all affiliates (admin only)
router.get('/affiliates', verifyAdmin, async (req, res) => {
    try {
        const [affiliates] = await db.query(
            `SELECT id, name, email, phone, social_media_handle, platform, coupon_code,
                    status, total_referrals, total_commission_earned, pending_commission, 
                    paid_commission, created_at 
             FROM affiliates 
             ORDER BY created_at DESC`
        );

        res.json({ success: true, affiliates });
    } catch (error) {
        console.error('Get affiliates error:', error);
        res.status(500).json({ message: 'Error fetching affiliates' });
    }
});

// Create new affiliate
router.post('/affiliates', [
    verifyAdmin,
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('couponCode').matches(/@wg$/).isLength({ max: 10 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, socialHandle, platform, couponCode } = req.body;

        const [result] = await db.query(
            `INSERT INTO affiliates 
            (name, email, phone, social_media_handle, platform, coupon_code, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone || null, socialHandle || null, platform || null, couponCode, 'active']
        );

        res.json({ 
            success: true, 
            message: 'Affiliate created successfully',
            affiliateId: result.insertId 
        });
    } catch (error) {
        console.error('Create affiliate error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or coupon code already exists' });
        }
        res.status(500).json({ message: 'Error creating affiliate' });
    }
});

// Update affiliate status
router.patch('/affiliates/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.query(
            'UPDATE affiliates SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Error updating status' });
    }
});

// Get all referrals (admin only)
router.get('/referrals', verifyAdmin, async (req, res) => {
    try {
        const [referrals] = await db.query(
            `SELECT r.*, a.name as affiliate_name, a.coupon_code 
             FROM referrals r 
             JOIN affiliates a ON r.affiliate_id = a.id 
             ORDER BY r.referred_at DESC 
             LIMIT 100`
        );

        res.json({ success: true, referrals });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({ message: 'Error fetching referrals' });
    }
});

// Update referral status (e.g., mark as converted)
router.patch('/referrals/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'contacted', 'converted', 'lost'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'converted') {
            updateData.conversion_date = new Date();
        }

        await db.query(
            'UPDATE referrals SET status = ?, conversion_date = ? WHERE id = ?',
            [status, updateData.conversion_date || null, id]
        );

        // If converted, move commission from pending to earned
        if (status === 'converted') {
            const [referral] = await db.query(
                'SELECT affiliate_id, commission_amount FROM referrals WHERE id = ?',
                [id]
            );
            
            if (referral.length > 0) {
                await db.query(
                    `UPDATE affiliates 
                     SET total_commission_earned = total_commission_earned + ?,
                         pending_commission = pending_commission - ?
                     WHERE id = ?`,
                    [referral[0].commission_amount, referral[0].commission_amount, referral[0].affiliate_id]
                );
            }
        }

        res.json({ success: true, message: 'Referral status updated' });
    } catch (error) {
        console.error('Update referral status error:', error);
        res.status(500).json({ message: 'Error updating referral status' });
    }
});

// Record commission payment
router.post('/payments', [
    verifyAdmin,
    body('affiliateId').isInt(),
    body('amount').isFloat({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { affiliateId, amount, paymentMethod, transactionRef, notes } = req.body;

        // Record payment
        await db.query(
            `INSERT INTO commission_payments 
            (affiliate_id, amount, payment_method, transaction_reference, notes, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [affiliateId, amount, paymentMethod, transactionRef, notes, req.admin.username]
        );

        // Update affiliate paid commission
        await db.query(
            `UPDATE affiliates 
             SET paid_commission = paid_commission + ? 
             WHERE id = ?`,
            [amount, affiliateId]
        );

        res.json({ 
            success: true, 
            message: 'Payment recorded successfully' 
        });
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({ message: 'Error recording payment' });
    }
});

// Get dashboard overview
router.get('/dashboard', verifyAdmin, async (req, res) => {
    try {
        // Total stats
        const [totalStats] = await db.query(
            `SELECT 
                COUNT(DISTINCT a.id) as total_affiliates,
                COUNT(DISTINCT r.id) as total_referrals,
                SUM(r.commission_amount) as total_commission,
                SUM(CASE WHEN r.status = 'converted' THEN 1 ELSE 0 END) as converted_count
             FROM affiliates a
             LEFT JOIN referrals r ON a.id = r.affiliate_id`
        );

        // Top performers
        const [topPerformers] = await db.query(
            `SELECT a.name, a.coupon_code, a.total_referrals, 
                    a.total_commission_earned, a.platform
             FROM affiliates a
             WHERE a.status = 'active'
             ORDER BY a.total_commission_earned DESC
             LIMIT 10`
        );

        // Recent referrals
        const [recentReferrals] = await db.query(
            `SELECT r.*, a.name as affiliate_name 
             FROM referrals r
             JOIN affiliates a ON r.affiliate_id = a.id
             ORDER BY r.referred_at DESC
             LIMIT 20`
        );

        res.json({
            success: true,
            overview: totalStats[0],
            topPerformers,
            recentReferrals
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});

module.exports = router;
