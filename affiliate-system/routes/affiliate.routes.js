const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Register new affiliate (self-registration)
router.post('/register', [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('phone').optional(),
    body('socialHandle').optional(),
    body('platform').optional(),
    body('preferredCoupon').matches(/@wg$/).isLength({ max: 10 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, socialHandle, platform, preferredCoupon } = req.body;

        // Check if coupon already exists
        const [existing] = await db.query(
            'SELECT id FROM affiliates WHERE coupon_code = ? OR email = ?',
            [preferredCoupon, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Email or coupon code already registered' 
            });
        }

        const [result] = await db.query(
            `INSERT INTO affiliates 
            (name, email, phone, social_media_handle, platform, coupon_code, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, socialHandle, platform, preferredCoupon, 'pending']
        );

        res.json({ 
            success: true, 
            message: 'Registration successful! Your application is pending approval.',
            affiliateId: result.insertId,
            couponCode: preferredCoupon
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Registration failed' 
        });
    }
});

// Get affiliate profile
router.get('/profile/:couponCode', async (req, res) => {
    try {
        const { couponCode } = req.params;
        
        const [affiliates] = await db.query(
            `SELECT id, name, email, phone, social_media_handle, platform, 
                    coupon_code, status, created_at, bank_account_name, 
                    bank_account_number, bank_name, payment_method
             FROM affiliates 
             WHERE coupon_code = ?`,
            [couponCode]
        );

        if (affiliates.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Affiliate not found' 
            });
        }

        res.json({ 
            success: true, 
            profile: affiliates[0] 
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching profile' 
        });
    }
});

// Update affiliate profile
router.put('/profile/:couponCode', [
    body('name').optional().trim().notEmpty(),
    body('phone').optional(),
    body('socialHandle').optional(),
    body('bankAccountName').optional(),
    body('bankAccountNumber').optional(),
    body('bankName').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { couponCode } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        if (updates.name) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.phone) {
            fields.push('phone = ?');
            values.push(updates.phone);
        }
        if (updates.socialHandle) {
            fields.push('social_media_handle = ?');
            values.push(updates.socialHandle);
        }
        if (updates.bankAccountName) {
            fields.push('bank_account_name = ?');
            values.push(updates.bankAccountName);
        }
        if (updates.bankAccountNumber) {
            fields.push('bank_account_number = ?');
            values.push(updates.bankAccountNumber);
        }
        if (updates.bankName) {
            fields.push('bank_name = ?');
            values.push(updates.bankName);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(couponCode);
        await db.query(
            `UPDATE affiliates SET ${fields.join(', ')} WHERE coupon_code = ?`,
            values
        );

        res.json({ 
            success: true, 
            message: 'Profile updated successfully' 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating profile' 
        });
    }
});

module.exports = router;
