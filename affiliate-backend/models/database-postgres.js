const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create PostgreSQL connection pool
// Use DATABASE_URL from environment (Render provides this automatically)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    initializeDatabase();
  }
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Affiliates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        coupon_code TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'affiliate',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        plan_type TEXT NOT NULL,
        plan_price DECIMAL(10,2) NOT NULL,
        coupon_code TEXT,
        affiliate_id INTEGER REFERENCES affiliates(id),
        signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active'
      )
    `);

    // Commissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        plan_type TEXT NOT NULL,
        plan_price DECIMAL(10,2) NOT NULL,
        commission_rate DECIMAL(5,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      )
    `);

    // Referrals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
        client_id INTEGER NOT NULL REFERENCES clients(id),
        referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        conversion_date TIMESTAMP,
        status TEXT DEFAULT 'pending'
      )
    `);

    // Goal tracking table - tracks 30-day referral goals
    await client.query(`
      CREATE TABLE IF NOT EXISTS affiliate_goals (
        id SERIAL PRIMARY KEY,
        affiliate_id INTEGER NOT NULL REFERENCES affiliates(id),
        goal_start_date TIMESTAMP NOT NULL,
        goal_end_date TIMESTAMP NOT NULL,
        target_referrals INTEGER DEFAULT 10,
        achieved_referrals INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        completed_at TIMESTAMP,
        consecutive_wins INTEGER DEFAULT 0,
        bonus_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default admin user
    const adminPassword = bcrypt.hashSync('#01Admin@WG2024', 10);
    
    await client.query(`
      INSERT INTO affiliates (username, email, password, full_name, coupon_code, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
    `, ['its.admin01', 'admin@webgemini.com', adminPassword, 'Administrator', 'ADMIN2024', 'admin']);

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');
    console.log('⚠️  IMPORTANT: Default admin credentials:');
    console.log('   Username: its.admin01');
    console.log('   Password: #01Admin@WG2024');
    console.log('   Please change these credentials after first login!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', err.message);
  } finally {
    client.release();
  }
}

// Helper functions - converted from SQLite to PostgreSQL
const dbHelpers = {
  // Get affiliate by username or email
  getAffiliateByUsername: (username, callback) => {
    if (callback) {
      pool.query(
        'SELECT * FROM affiliates WHERE username = $1 OR email = $1',
        [username],
        (err, results) => {
          if (err) callback(err);
          else callback(null, results.rows[0]);
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM affiliates WHERE username = $1 OR email = $1',
          [username],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Get affiliate by ID
  getAffiliateById: (id, callback) => {
    if (callback) {
      pool.query(
        'SELECT * FROM affiliates WHERE id = $1',
        [id],
        (err, results) => {
          if (err) callback(err);
          else callback(null, results.rows[0]);
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM affiliates WHERE id = $1',
          [id],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Get affiliate by coupon code
  getAffiliateByCoupon: (couponCode, callback) => {
    if (callback) {
      pool.query(
        'SELECT * FROM affiliates WHERE coupon_code = $1',
        [couponCode],
        (err, results) => {
          if (err) callback(err);
          else callback(null, results.rows[0]);
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM affiliates WHERE coupon_code = $1',
          [couponCode],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Create new affiliate
  createAffiliate: (affiliateData, callback) => {
    const { username, email, password, full_name, coupon_code } = affiliateData;
    
    if (callback) {
      pool.query(
        'INSERT INTO affiliates (username, email, password, full_name, coupon_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, email, password, full_name, coupon_code],
        (err, results) => {
          if (err) callback(err);
          else callback(null, results.rows[0]);
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'INSERT INTO affiliates (username, email, password, full_name, coupon_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [username, email, password, full_name, coupon_code],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Create new client
  createClient: (data, callback) => {
    const { name, email, phone, plan_type, plan_price, coupon_code, affiliate_id } = data;
    
    if (callback) {
      pool.query(
        'INSERT INTO clients (name, email, phone, plan_type, plan_price, coupon_code, affiliate_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, email, phone, plan_type, plan_price, coupon_code, affiliate_id],
        function(err, results) {
          if (err) {
            callback(err);
          } else {
            // Mimic SQLite's this.lastID for compatibility
            callback.call({ lastID: results.rows[0].id }, null);
          }
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'INSERT INTO clients (name, email, phone, plan_type, plan_price, coupon_code, affiliate_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [name, email, phone, plan_type, plan_price, coupon_code, affiliate_id],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Create commission
  createCommission: (data, callback) => {
    const { affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount } = data;
    
    if (callback) {
      pool.query(
        'INSERT INTO commissions (affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount],
        (err, results) => {
          if (err) callback(err);
          else callback(null);
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'INSERT INTO commissions (affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Track client signup
  trackClientSignup: (clientData) => {
    return new Promise(async (resolve, reject) => {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        const { name, email, phone, plan_type, plan_price, coupon_code } = clientData;

        // Get affiliate by coupon code
        const affiliateResult = await client.query(
          'SELECT id FROM affiliates WHERE coupon_code = $1',
          [coupon_code]
        );

        const affiliate = affiliateResult.rows[0];
        const affiliateId = affiliate ? affiliate.id : null;

        // Insert client
        const clientResult = await client.query(
          'INSERT INTO clients (name, email, phone, plan_type, plan_price, coupon_code, affiliate_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [name, email, phone, plan_type, plan_price, coupon_code, affiliateId]
        );

        const newClient = clientResult.rows[0];

        // If affiliate found, create commission and referral
        if (affiliateId) {
          // Calculate commission rate based on plan type
          let commissionRate;
          if (plan_type === 'Starter') {
            commissionRate = 0.10; // 10% for Starter
          } else if (plan_type === 'Professional') {
            commissionRate = 0.15; // 15% for Professional
          } else if (plan_type === 'Enterprise') {
            commissionRate = 0.20; // 20% for Enterprise
          } else {
            commissionRate = 0.10; // Default to 10% for any other plans
          }
          
          const commissionAmount = plan_price * commissionRate;

          await client.query(
            'INSERT INTO commissions (affiliate_id, client_id, plan_type, plan_price, commission_rate, commission_amount) VALUES ($1, $2, $3, $4, $5, $6)',
            [affiliateId, newClient.id, plan_type, plan_price, commissionRate, commissionAmount]
          );

          await client.query(
            'INSERT INTO referrals (affiliate_id, client_id) VALUES ($1, $2)',
            [affiliateId, newClient.id]
          );
        }

        await client.query('COMMIT');
        resolve(newClient);

      } catch (err) {
        await client.query('ROLLBACK');
        reject(err);
      } finally {
        client.release();
      }
    });
  },

  // Get affiliate stats
  getAffiliateStats: (affiliateId, callback) => {
    const query = `SELECT 
      COUNT(DISTINCT c.id) as total_referrals,
      COALESCE(SUM(cm.commission_amount), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN cm.status = 'pending' THEN cm.commission_amount ELSE 0 END), 0) as pending_earnings,
      COALESCE(SUM(CASE WHEN cm.status = 'paid' THEN cm.commission_amount ELSE 0 END), 0) as paid_earnings
    FROM affiliates a
    LEFT JOIN clients c ON a.id = c.affiliate_id
    LEFT JOIN commissions cm ON a.id = cm.affiliate_id
    WHERE a.id = $1`;
    
    if (callback) {
      pool.query(query, [affiliateId], (err, results) => {
        if (err) callback(err);
        else callback(null, results.rows[0]);
      });
    } else {
      return new Promise((resolve, reject) => {
        pool.query(query, [affiliateId], (err, results) => {
          if (err) reject(err);
          else resolve(results.rows[0]);
        });
      });
    }
  },

  // Get affiliate referrals
  getAffiliateReferrals: (affiliateId, callback) => {
    const query = `SELECT 
      c.id,
      c.name,
      c.email,
      c.plan_type,
      c.plan_price,
      c.signup_date,
      cm.commission_rate,
      cm.commission_amount,
      cm.status as commission_status
    FROM clients c
    LEFT JOIN commissions cm ON c.id = cm.client_id
    WHERE c.affiliate_id = $1
    ORDER BY c.signup_date DESC`;
    
    if (callback) {
      pool.query(query, [affiliateId], (err, results) => {
        if (err) callback(err);
        else callback(null, results.rows);
      });
    } else {
      return new Promise((resolve, reject) => {
        pool.query(query, [affiliateId], (err, results) => {
          if (err) reject(err);
          else resolve(results.rows);
        });
      });
    }
  },

  // Get all affiliates (admin)
  getAllAffiliates: (callback) => {
    if (callback) {
      // Callback style for compatibility with routes
      pool.query(
        'SELECT id, username, email, full_name, coupon_code, status, created_at FROM affiliates ORDER BY created_at DESC',
        (err, results) => {
          if (err) callback(err);
          else callback(null, results.rows);
        }
      );
    } else {
      // Promise style
      return new Promise((resolve, reject) => {
        pool.query(
          'SELECT id, username, email, full_name, coupon_code, status, created_at FROM affiliates ORDER BY created_at DESC',
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows);
          }
        );
      });
    }
  },

  // Get admin stats
  getAdminStats: (callback) => {
    const query = `SELECT 
      (SELECT COUNT(*) FROM affiliates WHERE role = 'affiliate') as total_affiliates,
      (SELECT COUNT(*) FROM clients) as total_clients,
      (SELECT COALESCE(SUM(plan_price), 0) FROM clients) as total_revenue,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions) as total_commissions,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions WHERE status = 'pending') as pending_commissions,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions WHERE status = 'paid') as paid_commissions`;
    
    if (callback) {
      pool.query(query, (err, results) => {
        if (err) callback(err);
        else callback(null, results.rows[0]);
      });
    } else {
      return new Promise((resolve, reject) => {
        pool.query(query, (err, results) => {
          if (err) reject(err);
          else resolve(results.rows[0]);
        });
      });
    }
  },

  // Alias for compatibility
  getOverallStats: function(callback) {
    return this.getAdminStats(callback);
  },

  // Get all clients (admin)
  getAllClients: (callback) => {
    const query = `SELECT 
      c.*,
      a.full_name as affiliate_name,
      cm.commission_rate,
      cm.commission_amount,
      cm.status as commission_status
    FROM clients c
    LEFT JOIN affiliates a ON c.affiliate_id = a.id
    LEFT JOIN commissions cm ON c.id = cm.client_id
    ORDER BY c.signup_date DESC`;
    
    if (callback) {
      pool.query(query, (err, results) => {
        if (err) callback(err);
        else callback(null, results.rows);
      });
    } else {
      return new Promise((resolve, reject) => {
        pool.query(query, (err, results) => {
          if (err) reject(err);
          else resolve(results.rows);
        });
      });
    }
  },

  // Alias for compatibility with auth routes
  getAllClientsWithAffiliates: function(callback) {
    return this.getAllClients(callback);
  },

  // Get affiliate login info (for auth)
  getAffiliateByLogin: (username, callback) => {
    if (callback) {
      pool.query(
        'SELECT * FROM affiliates WHERE username = $1 OR email = $1',
        [username],
        (err, results) => {
          if (err) callback(err);
          else callback(null, results.rows[0]);
        }
      );
    } else {
      return new Promise((resolve, reject) => {
        pool.query(
          'SELECT * FROM affiliates WHERE username = $1 OR email = $1',
          [username],
          (err, results) => {
            if (err) reject(err);
            else resolve(results.rows[0]);
          }
        );
      });
    }
  },

  // Goal tracking functions
  
  // Get or create current active goal for affiliate
  getCurrentGoal: (affiliateId, callback) => {
    const promise = (async () => {
      const result = await pool.query(
        `SELECT * FROM affiliate_goals 
         WHERE affiliate_id = $1 AND status = 'active'
         ORDER BY created_at DESC LIMIT 1`,
        [affiliateId]
      );
      
      let goal = result.rows[0];
      
      // If no active goal or goal expired, create new one
      if (!goal || new Date(goal.goal_end_date) < new Date()) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        
        const insertResult = await pool.query(
          `INSERT INTO affiliate_goals (affiliate_id, goal_start_date, goal_end_date, target_referrals, achieved_referrals, status)
           VALUES ($1, $2, $3, 10, 0, 'active')
           RETURNING *`,
          [affiliateId, startDate.toISOString(), endDate.toISOString()]
        );
        
        goal = insertResult.rows[0];
      }
      
      return goal;
    })();
    
    if (callback) {
      promise.then(result => callback(null, result)).catch(err => callback(err));
    } else {
      return promise;
    }
  },

  // Update goal progress
  updateGoalProgress: (affiliateId, callback) => {
    const promise = (async () => {
      const goalResult = await pool.query(
        `SELECT * FROM affiliate_goals 
         WHERE affiliate_id = $1 AND status = 'active'
         ORDER BY created_at DESC LIMIT 1`,
        [affiliateId]
      );
      
      const goal = goalResult.rows[0];
      if (!goal) return null;
      
      // Count referrals within goal period
      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM clients 
         WHERE affiliate_id = $1 
         AND signup_date >= $2 
         AND signup_date <= $3
         AND status = 'active'`,
        [affiliateId, goal.goal_start_date, goal.goal_end_date]
      );
      
      const achieved = parseInt(countResult.rows[0].count);
      const now = new Date();
      const endDate = new Date(goal.goal_end_date);
      
      // Check if goal is completed
      if (achieved >= goal.target_referrals) {
        // Goal achieved!
        const newConsecutiveWins = goal.consecutive_wins + 1;
        const newBonusRate = newConsecutiveWins >= 3 ? 5.0 : 0;
        
        await pool.query(
          `UPDATE affiliate_goals 
           SET achieved_referrals = $1, 
               status = 'completed', 
               completed_at = $2,
               consecutive_wins = $3,
               bonus_rate = $4
           WHERE id = $5`,
          [achieved, now.toISOString(), newConsecutiveWins, newBonusRate, goal.id]
        );
      } else if (now > endDate) {
        // Goal expired without reaching target
        await pool.query(
          `UPDATE affiliate_goals 
           SET achieved_referrals = $1, 
               status = 'failed', 
               consecutive_wins = 0
           WHERE id = $2`,
          [achieved, goal.id]
        );
      } else {
        // Goal still in progress
        await pool.query(
          `UPDATE affiliate_goals 
           SET achieved_referrals = $1
           WHERE id = $2`,
          [achieved, goal.id]
        );
      }
      
      return { success: true };
    })();
    
    if (callback) {
      promise.then(result => callback(null, result)).catch(err => callback(err));
    } else {
      return promise;
    }
  },

  // Get affiliate's goal history
  getGoalHistory: (affiliateId, callback) => {
    const promise = pool.query(
      `SELECT * FROM affiliate_goals 
       WHERE affiliate_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [affiliateId]
    ).then(result => result.rows);
    
    if (callback) {
      promise.then(result => callback(null, result)).catch(err => callback(err));
    } else {
      return promise;
    }
  },

  // Get current bonus rate for affiliate
  getAffiliateBonus: (affiliateId, callback) => {
    const promise = (async () => {
      const result = await pool.query(
        `SELECT consecutive_wins, bonus_rate FROM affiliate_goals 
         WHERE affiliate_id = $1 AND status = 'completed'
         ORDER BY completed_at DESC LIMIT 1`,
        [affiliateId]
      );
      
      const row = result.rows[0];
      
      if (row && row.consecutive_wins >= 3) {
        return { hasBonus: true, bonusRate: 5.0, consecutiveWins: row.consecutive_wins };
      } else {
        return { hasBonus: false, bonusRate: 0, consecutiveWins: row ? row.consecutive_wins : 0 };
      }
    })();
    
    if (callback) {
      promise.then(result => callback(null, result)).catch(err => callback(err));
    } else {
      return promise;
    }
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
    process.exit(0);
  });
});

module.exports = { pool, db: dbHelpers };
