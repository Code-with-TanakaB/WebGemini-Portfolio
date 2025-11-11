const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../affiliate.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Affiliates table - stores influencer information
    db.run(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        coupon_code TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'affiliate',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clients table - stores client signup information
    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        plan_type TEXT NOT NULL,
        plan_price REAL NOT NULL,
        coupon_code TEXT,
        affiliate_id INTEGER,
        signup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
      )
    `);

    // Commissions table - tracks commission calculations
    db.run(`
      CREATE TABLE IF NOT EXISTS commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        affiliate_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        plan_type TEXT NOT NULL,
        plan_price REAL NOT NULL,
        commission_rate REAL NOT NULL,
        commission_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Referrals tracking table - detailed referral tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        affiliate_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        referral_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        conversion_date DATETIME,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Goal tracking table - tracks 30-day referral goals
    db.run(`
      CREATE TABLE IF NOT EXISTS affiliate_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        affiliate_id INTEGER NOT NULL,
        goal_start_date DATETIME NOT NULL,
        goal_end_date DATETIME NOT NULL,
        target_referrals INTEGER DEFAULT 10,
        achieved_referrals INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        completed_at DATETIME,
        consecutive_wins INTEGER DEFAULT 0,
        bonus_rate REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
      )
    `);

    // Create default admin user (password: #01Admin@WG2024 - MUST be changed after first login)
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('#01Admin@WG2024', 10);
    
    db.run(`
      INSERT OR IGNORE INTO affiliates (username, email, password, full_name, coupon_code, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['its.admin01', 'admin@webgemini.com', adminPassword, 'Administrator', 'ADMIN2024', 'admin'], (err) => {
      if (err) {
        console.error('Error creating admin user:', err.message);
      } else {
        console.log('Database initialized successfully');
        console.log('⚠️  IMPORTANT: Default admin credentials:');
        console.log('   Username: its.admin01');
        console.log('   Password: #01Admin@WG2024');
        console.log('   Please change these credentials after first login!');
      }
    });
  });
}

// Helper functions for database operations
const dbHelpers = {
  // Get affiliate by username or email
  getAffiliateByLogin: (login, callback) => {
    db.get(
      'SELECT * FROM affiliates WHERE username = ? OR email = ?',
      [login, login],
      callback
    );
  },

  // Get affiliate by ID
  getAffiliateById: (id, callback) => {
    db.get('SELECT * FROM affiliates WHERE id = ?', [id], callback);
  },

  // Get affiliate by coupon code
  getAffiliateByCoupon: (couponCode, callback) => {
    db.get('SELECT * FROM affiliates WHERE coupon_code = ?', [couponCode], callback);
  },

  // Create new affiliate
  createAffiliate: (data, callback) => {
    db.run(
      `INSERT INTO affiliates (username, email, password, full_name, coupon_code)
       VALUES (?, ?, ?, ?, ?)`,
      [data.username, data.email, data.password, data.full_name, data.coupon_code],
      callback
    );
  },

  // Create new client
  createClient: (data, callback) => {
    db.run(
      `INSERT INTO clients (name, email, phone, plan_type, plan_price, coupon_code, affiliate_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.email, data.phone, data.plan_type, data.plan_price, data.coupon_code, data.affiliate_id],
      callback
    );
  },

  // Create commission
  createCommission: (data, callback) => {
    db.run(
      `INSERT INTO commissions (affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.affiliate_id, data.client_id, data.plan_type, data.plan_price, data.commission_rate, data.commission_amount],
      callback
    );
  },

  // Get all affiliates
  getAllAffiliates: (callback) => {
    db.all('SELECT id, username, email, full_name, coupon_code, status, created_at FROM affiliates WHERE role = "affiliate"', callback);
  },

  // Get affiliate stats
  getAffiliateStats: (affiliateId, callback) => {
    db.get(
      `SELECT 
        COUNT(DISTINCT c.id) as total_referrals,
        SUM(CASE WHEN com.status = 'pending' THEN com.commission_amount ELSE 0 END) as pending_earnings,
        SUM(CASE WHEN com.status = 'paid' THEN com.commission_amount ELSE 0 END) as paid_earnings,
        SUM(com.commission_amount) as total_earnings
       FROM clients c
       LEFT JOIN commissions com ON c.id = com.client_id
       WHERE c.affiliate_id = ?`,
      [affiliateId],
      callback
    );
  },

  // Get affiliate referrals
  getAffiliateReferrals: (affiliateId, callback) => {
    db.all(
      `SELECT 
        c.*,
        com.commission_amount,
        com.commission_rate,
        com.status as commission_status
       FROM clients c
       LEFT JOIN commissions com ON c.id = com.client_id
       WHERE c.affiliate_id = ?
       ORDER BY c.signup_date DESC`,
      [affiliateId],
      callback
    );
  },

  // Get all clients with affiliate info
  getAllClientsWithAffiliates: (callback) => {
    db.all(
      `SELECT 
        c.*,
        a.username as affiliate_username,
        a.full_name as affiliate_name,
        com.commission_amount,
        com.commission_rate,
        com.status as commission_status
       FROM clients c
       LEFT JOIN affiliates a ON c.affiliate_id = a.id
       LEFT JOIN commissions com ON c.id = com.client_id
       ORDER BY c.signup_date DESC`,
      callback
    );
  },

  // Get overall stats for admin
  getOverallStats: (callback) => {
    db.get(
      `SELECT 
        COUNT(DISTINCT a.id) as total_affiliates,
        COUNT(DISTINCT c.id) as total_clients,
        SUM(CASE WHEN com.status = 'pending' THEN com.commission_amount ELSE 0 END) as pending_commissions,
        SUM(CASE WHEN com.status = 'paid' THEN com.commission_amount ELSE 0 END) as paid_commissions,
        SUM(com.commission_amount) as total_commissions,
        SUM(c.plan_price) as total_revenue
       FROM affiliates a
       LEFT JOIN clients c ON a.id = c.affiliate_id
       LEFT JOIN commissions com ON c.id = com.client_id
       WHERE a.role = 'affiliate'`,
      callback
    );
  },

  // Goal tracking functions
  
  // Get or create current active goal for affiliate
  getCurrentGoal: (affiliateId, callback) => {
    db.get(
      `SELECT * FROM affiliate_goals 
       WHERE affiliate_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [affiliateId],
      (err, goal) => {
        if (err) return callback(err);
        
        // If no active goal or goal expired, create new one
        if (!goal || new Date(goal.goal_end_date) < new Date()) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          
          db.run(
            `INSERT INTO affiliate_goals (affiliate_id, goal_start_date, goal_end_date, target_referrals, achieved_referrals, status)
             VALUES (?, ?, ?, 10, 0, 'active')`,
            [affiliateId, startDate.toISOString(), endDate.toISOString()],
            function(err) {
              if (err) return callback(err);
              
              db.get(
                `SELECT * FROM affiliate_goals WHERE id = ?`,
                [this.lastID],
                callback
              );
            }
          );
        } else {
          callback(null, goal);
        }
      }
    );
  },

  // Update goal progress
  updateGoalProgress: (affiliateId, callback) => {
    db.get(
      `SELECT * FROM affiliate_goals 
       WHERE affiliate_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [affiliateId],
      (err, goal) => {
        if (err || !goal) return callback(err);
        
        // Count referrals within goal period
        db.get(
          `SELECT COUNT(*) as count FROM clients 
           WHERE affiliate_id = ? 
           AND signup_date >= ? 
           AND signup_date <= ?
           AND status = 'active'`,
          [affiliateId, goal.goal_start_date, goal.goal_end_date],
          (err, result) => {
            if (err) return callback(err);
            
            const achieved = result.count;
            const now = new Date();
            const endDate = new Date(goal.goal_end_date);
            
            // Check if goal is completed
            if (achieved >= goal.target_referrals) {
              // Goal achieved!
              const newConsecutiveWins = goal.consecutive_wins + 1;
              const newBonusRate = newConsecutiveWins >= 3 ? 5.0 : 0;
              
              db.run(
                `UPDATE affiliate_goals 
                 SET achieved_referrals = ?, 
                     status = 'completed', 
                     completed_at = ?,
                     consecutive_wins = ?,
                     bonus_rate = ?
                 WHERE id = ?`,
                [achieved, now.toISOString(), newConsecutiveWins, newBonusRate, goal.id],
                callback
              );
            } else if (now > endDate) {
              // Goal expired without reaching target
              db.run(
                `UPDATE affiliate_goals 
                 SET achieved_referrals = ?, 
                     status = 'failed', 
                     consecutive_wins = 0
                 WHERE id = ?`,
                [achieved, goal.id],
                callback
              );
            } else {
              // Goal still in progress
              db.run(
                `UPDATE affiliate_goals 
                 SET achieved_referrals = ?
                 WHERE id = ?`,
                [achieved, goal.id],
                callback
              );
            }
          }
        );
      }
    );
  },

  // Get affiliate's goal history
  getGoalHistory: (affiliateId, callback) => {
    db.all(
      `SELECT * FROM affiliate_goals 
       WHERE affiliate_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [affiliateId],
      callback
    );
  },

  // Get current bonus rate for affiliate
  getAffiliateBonus: (affiliateId, callback) => {
    db.get(
      `SELECT consecutive_wins, bonus_rate FROM affiliate_goals 
       WHERE affiliate_id = ? AND status = 'completed'
       ORDER BY completed_at DESC LIMIT 1`,
      [affiliateId],
      (err, result) => {
        if (err) return callback(err);
        
        if (result && result.consecutive_wins >= 3) {
          callback(null, { hasBonus: true, bonusRate: 5.0, consecutiveWins: result.consecutive_wins });
        } else {
          callback(null, { hasBonus: false, bonusRate: 0, consecutiveWins: result ? result.consecutive_wins : 0 });
        }
      }
    );
  }
};

module.exports = { db, dbHelpers };
