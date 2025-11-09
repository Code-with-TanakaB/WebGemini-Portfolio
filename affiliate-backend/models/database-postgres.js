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

    // Create default admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    await client.query(`
      INSERT INTO affiliates (username, email, password, full_name, coupon_code, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@webgemini.com', adminPassword, 'Administrator', 'ADMIN2024', 'admin']);

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');

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
  getAffiliateByUsername: (username) => {
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
  },

  // Get affiliate by ID
  getAffiliateById: (id) => {
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
  },

  // Get affiliate by coupon code
  getAffiliateByCoupon: (couponCode) => {
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
  },

  // Create new affiliate
  createAffiliate: (affiliateData) => {
    return new Promise((resolve, reject) => {
      const { username, email, password, full_name, coupon_code } = affiliateData;
      pool.query(
        'INSERT INTO affiliates (username, email, password, full_name, coupon_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, email, password, full_name, coupon_code],
        (err, results) => {
          if (err) reject(err);
          else resolve(results.rows[0]);
        }
      );
    });
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
          const commissionRate = 0.10; // 10%
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
  getAffiliateStats: (affiliateId) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT 
          COUNT(DISTINCT c.id) as total_referrals,
          COALESCE(SUM(cm.commission_amount), 0) as total_earnings,
          COALESCE(SUM(CASE WHEN cm.status = 'pending' THEN cm.commission_amount ELSE 0 END), 0) as pending_earnings,
          COALESCE(SUM(CASE WHEN cm.status = 'paid' THEN cm.commission_amount ELSE 0 END), 0) as paid_earnings
        FROM affiliates a
        LEFT JOIN clients c ON a.id = c.affiliate_id
        LEFT JOIN commissions cm ON a.id = cm.affiliate_id
        WHERE a.id = $1`,
        [affiliateId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results.rows[0]);
        }
      );
    });
  },

  // Get affiliate referrals
  getAffiliateReferrals: (affiliateId) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT 
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
        ORDER BY c.signup_date DESC`,
        [affiliateId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results.rows);
        }
      );
    });
  },

  // Get all affiliates (admin)
  getAllAffiliates: () => {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, username, email, full_name, coupon_code, status, created_at FROM affiliates ORDER BY created_at DESC',
        (err, results) => {
          if (err) reject(err);
          else resolve(results.rows);
        }
      );
    });
  },

  // Get admin stats
  getAdminStats: () => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM affiliates WHERE role = 'affiliate') as total_affiliates,
          (SELECT COUNT(*) FROM clients) as total_clients,
          (SELECT COALESCE(SUM(plan_price), 0) FROM clients) as total_revenue,
          (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions) as total_commissions,
          (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions WHERE status = 'pending') as pending_commissions,
          (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions WHERE status = 'paid') as paid_commissions`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results.rows[0]);
        }
      );
    });
  },

  // Get all clients (admin)
  getAllClients: () => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT 
          c.*,
          a.full_name as affiliate_name,
          cm.commission_rate,
          cm.commission_amount,
          cm.status as commission_status
        FROM clients c
        LEFT JOIN affiliates a ON c.affiliate_id = a.id
        LEFT JOIN commissions cm ON c.id = cm.client_id
        ORDER BY c.signup_date DESC`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results.rows);
        }
      );
    });
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
