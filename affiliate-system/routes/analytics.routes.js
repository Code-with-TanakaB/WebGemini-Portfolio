const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get analytics for specific affiliate
router.get('/affiliate/:couponCode', async (req, res) => {
    try {
        const { couponCode } = req.params;
        const { startDate, endDate } = req.query;

        // Get affiliate ID
        const [affiliates] = await db.query(
            'SELECT id FROM affiliates WHERE coupon_code = ?',
            [couponCode]
        );

        if (affiliates.length === 0) {
            return res.status(404).json({ message: 'Affiliate not found' });
        }

        const affiliateId = affiliates[0].id;

        // Date range for analytics
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];

        // Daily performance
        const [dailyStats] = await db.query(
            `SELECT 
                DATE(referred_at) as date,
                COUNT(*) as referrals,
                SUM(commission_amount) as commission,
                COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions
             FROM referrals
             WHERE affiliate_id = ? AND DATE(referred_at) BETWEEN ? AND ?
             GROUP BY DATE(referred_at)
             ORDER BY date DESC`,
            [affiliateId, start, end]
        );

        // Conversion rate
        const [conversionStats] = await db.query(
            `SELECT 
                COUNT(*) as total_referrals,
                COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions,
                (COUNT(CASE WHEN status = 'converted' THEN 1 END) / COUNT(*) * 100) as conversion_rate
             FROM referrals
             WHERE affiliate_id = ? AND DATE(referred_at) BETWEEN ? AND ?`,
            [affiliateId, start, end]
        );

        // Plan distribution
        const [planDistribution] = await db.query(
            `SELECT 
                plan_type,
                COUNT(*) as count,
                SUM(commission_amount) as total_commission,
                AVG(commission_amount) as avg_commission
             FROM referrals
             WHERE affiliate_id = ? AND DATE(referred_at) BETWEEN ? AND ?
             GROUP BY plan_type`,
            [affiliateId, start, end]
        );

        res.json({
            success: true,
            period: { start, end },
            dailyPerformance: dailyStats,
            conversionStats: conversionStats[0],
            planDistribution
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
