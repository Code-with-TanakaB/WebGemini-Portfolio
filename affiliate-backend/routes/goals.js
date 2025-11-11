const express = require('express');
const router = express.Router();
const { verifyToken, verifyAffiliate } = require('../middleware/auth');
const { db } = require('../models/index');

// Get current goal for logged-in affiliate
router.get('/current', verifyToken, verifyAffiliate, (req, res) => {
  // Update progress first
  db.updateGoalProgress(req.user.id, (err) => {
    if (err) {
      console.error('Error updating goal progress:', err);
      return res.status(500).json({ error: 'Failed to update goal progress' });
    }

    // Get current goal
    db.getCurrentGoal(req.user.id, (err, goal) => {
      if (err) {
        console.error('Error fetching current goal:', err);
        return res.status(500).json({ error: 'Failed to fetch goal' });
      }

      // Calculate progress percentage
      const progress = Math.min(100, Math.round((goal.achieved_referrals / goal.target_referrals) * 100));
      
      // Calculate days remaining
      const now = new Date();
      const endDate = new Date(goal.goal_end_date);
      const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      res.json({
        ...goal,
        progress,
        daysRemaining
      });
    });
  });
});

// Get goal history
router.get('/history', verifyToken, verifyAffiliate, (req, res) => {
  db.getGoalHistory(req.user.id, (err, history) => {
    if (err) {
      console.error('Error fetching goal history:', err);
      return res.status(500).json({ error: 'Failed to fetch goal history' });
    }

    res.json(history);
  });
});

// Get bonus information
router.get('/bonus', verifyToken, verifyAffiliate, (req, res) => {
  db.getAffiliateBonus(req.user.id, (err, bonusInfo) => {
    if (err) {
      console.error('Error fetching bonus info:', err);
      return res.status(500).json({ error: 'Failed to fetch bonus info' });
    }

    res.json(bonusInfo);
  });
});

module.exports = router;
