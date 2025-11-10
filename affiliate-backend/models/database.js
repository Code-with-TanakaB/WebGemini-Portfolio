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

    // Create default admin user (password: #01Admin123 - should be changed in production)
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('#01Admin123', 10);
    
    db.run(`
      INSERT OR IGNORE INTO affiliates (username, email, password, full_name, coupon_code, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['its.admin01', 'admin@webgemini.com', adminPassword, 'Administrator', 'ADMIN2024', 'admin'], (err) => {
      if (err) {
        console.error('Error creating admin user:', err.message);
      } else {
        console.log('Database initialized successfully');
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
  }
};

module.exports = { db, dbHelpers };
