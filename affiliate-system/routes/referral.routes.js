const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validate coupon code
router.post('/validate-coupon', [
    body('couponCode').trim().notEmpty().isLength({ max: 10 }).matches(/@wg$/)
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                valid: false, 
                message: 'Invalid coupon format',
                errors: errors.array() 
            });
        }

        const { couponCode } = req.body;
        
        // Check if coupon exists and is active
        const [affiliates] = await db.query(
            'SELECT id, name, coupon_code, status FROM affiliates WHERE coupon_code = ? AND status = ?',
            [couponCode, 'active']
        );

        if (affiliates.length === 0) {
            // Log failed attempt
            await db.query(
                'INSERT INTO coupon_usage_log (coupon_code, validation_status, ip_address) VALUES (?, ?, ?)',
                [couponCode, 'invalid', req.ip]
            );
            
            return res.json({ 
                valid: false, 
                message: 'Invalid coupon code' 
            });
        }

        const affiliate = affiliates[0];
        
        res.json({ 
            valid: true, 
            message: 'Coupon code is valid',
            affiliate: {
                name: affiliate.name,
                code: affiliate.coupon_code
            }
        });
        
    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ 
            valid: false, 
            message: 'Error validating coupon' 
        });
    }
});

// Track referral (called when form is submitted with valid coupon)
router.post('/track-referral', [
    body('couponCode').trim().notEmpty(),
    body('customerName').trim().notEmpty(),
    body('customerEmail').isEmail(),
    body('serviceType').optional(),
    body('budget').optional(),
    body('message').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { 
            couponCode, 
            customerName, 
            customerEmail, 
            customerPhone,
            serviceType, 
            budget,
            message 
        } = req.body;

        // Get affiliate info
        const [affiliates] = await db.query(
            'SELECT id, commission_rate_starter, commission_rate_professional, commission_rate_enterprise FROM affiliates WHERE coupon_code = ? AND status = ?',
            [couponCode, 'active']
        );

        if (affiliates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or inactive coupon code' 
            });
        }

        const affiliate = affiliates[0];
        
        // Determine plan type and commission based on budget
        let planType = 'starter';
        let planPrice = 1500;
        let commissionRate = affiliate.commission_rate_starter;
        
        if (budget) {
            if (budget.includes('2k-5k') || budget.includes('2000')) {
                planType = 'professional';
                planPrice = 2500;
                commissionRate = affiliate.commission_rate_professional;
            } else if (budget.includes('5k-10k') || budget.includes('10k-plus') || budget.includes('5000')) {
                planType = 'enterprise';
                planPrice = 4000;
                commissionRate = affiliate.commission_rate_enterprise;
            }
        }

        const commissionAmount = (planPrice * commissionRate) / 100;

        // Insert referral
        const [result] = await db.query(
            `INSERT INTO referrals 
            (affiliate_id, customer_name, customer_email, customer_phone, service_type, 
             plan_type, budget_range, project_details, coupon_code, 
             plan_price, commission_rate, commission_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                affiliate.id,
                customerName,
                customerEmail,
                customerPhone || null,
                serviceType || null,
                planType,
                budget || null,
                message || null,
                couponCode,
                planPrice,
                commissionRate,
                commissionAmount
            ]
        );

        // Update affiliate stats
        await db.query(
            `UPDATE affiliates 
             SET total_referrals = total_referrals + 1,
                 pending_commission = pending_commission + ? 
             WHERE id = ?`,
            [commissionAmount, affiliate.id]
        );

        // Log successful usage
        await db.query(
            `INSERT INTO coupon_usage_log 
            (coupon_code, affiliate_id, customer_email, ip_address, validation_status, form_data) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                couponCode, 
                affiliate.id, 
                customerEmail, 
                req.ip, 
                'valid',
                JSON.stringify(req.body)
            ]
        );

        res.json({ 
            success: true, 
            message: 'Referral tracked successfully',
            referralId: result.insertId,
            commission: {
                plan: planType,
                amount: commissionAmount,
                currency: 'ZAR'
            }
        });
        
    } catch (error) {
        console.error('Track referral error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error tracking referral' 
        });
    }
});

// Get affiliate dashboard data (for influencers)
router.get('/dashboard/:couponCode', async (req, res) => {
    try {
        const { couponCode } = req.params;
        
        // Get affiliate info
        const [affiliates] = await db.query(
            `SELECT id, name, email, social_media_handle, platform, coupon_code, 
                    total_referrals, total_commission_earned, pending_commission, paid_commission, 
                    status, created_at 
             FROM affiliates WHERE coupon_code = ?`,
            [couponCode]
        );

        if (affiliates.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Affiliate not found' 
            });
        }

        const affiliate = affiliates[0];

        // Get referrals
        const [referrals] = await db.query(
            `SELECT id, customer_name, customer_email, service_type, plan_type, 
                    plan_price, commission_amount, status, referred_at 
             FROM referrals 
             WHERE affiliate_id = ? 
             ORDER BY referred_at DESC 
             LIMIT 50`,
            [affiliate.id]
        );

        // Get stats by plan type
        const [planStats] = await db.query(
            `SELECT plan_type, COUNT(*) as count, SUM(commission_amount) as total_commission 
             FROM referrals 
             WHERE affiliate_id = ? 
             GROUP BY plan_type`,
            [affiliate.id]
        );

        // Get monthly stats
        const [monthlyStats] = await db.query(
            `SELECT 
                DATE_FORMAT(referred_at, '%Y-%m') as month,
                COUNT(*) as referrals,
                SUM(commission_amount) as commission
             FROM referrals 
             WHERE affiliate_id = ? 
             GROUP BY month 
             ORDER BY month DESC 
             LIMIT 12`,
            [affiliate.id]
        );

        res.json({
            success: true,
            affiliate: {
                name: affiliate.name,
                email: affiliate.email,
                socialHandle: affiliate.social_media_handle,
                platform: affiliate.platform,
                couponCode: affiliate.coupon_code,
                status: affiliate.status,
                memberSince: affiliate.created_at
            },
            summary: {
                totalReferrals: affiliate.total_referrals,
                totalEarned: parseFloat(affiliate.total_commission_earned),
                pendingCommission: parseFloat(affiliate.pending_commission),
                paidCommission: parseFloat(affiliate.paid_commission)
            },
            referrals: referrals,
            planBreakdown: planStats,
            monthlyPerformance: monthlyStats
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dashboard data' 
        });
    }
});

module.exports = router;
