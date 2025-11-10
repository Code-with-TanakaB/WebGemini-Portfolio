#!/usr/bin/env node

/**
 * Reset Admin Password Script
 * 
 * This script will:
 * 1. Connect to your database (SQLite or PostgreSQL)
 * 2. Update the admin user password
 * 3. Verify the update was successful
 * 
 * Usage:
 *   node reset-admin-password.js
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();

// New admin credentials
const NEW_ADMIN_USERNAME = 'its.admin01';
const NEW_ADMIN_PASSWORD = '#01Admin@WG2024';
const NEW_ADMIN_EMAIL = 'admin@webgemini.com';

console.log('🔧 Admin Password Reset Script');
console.log('================================\n');

// Check if using PostgreSQL or SQLite
if (process.env.DATABASE_URL) {
  console.log('📦 Using PostgreSQL database\n');
  resetPostgreSQL();
} else {
  console.log('📦 Using SQLite database\n');
  resetSQLite();
}

async function resetPostgreSQL() {
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    
    console.log('✅ Connected to PostgreSQL');
    
    // Hash the new password
    const hashedPassword = bcrypt.hashSync(NEW_ADMIN_PASSWORD, 10);
    console.log('🔐 Password hashed successfully');
    
    // Check if admin exists
    const checkResult = await client.query(
      'SELECT * FROM affiliates WHERE username = $1 OR email = $2',
      [NEW_ADMIN_USERNAME, NEW_ADMIN_EMAIL]
    );
    
    if (checkResult.rows.length > 0) {
      // Update existing admin
      console.log('👤 Admin user found, updating password...');
      
      await client.query(
        `UPDATE affiliates 
         SET password = $1, username = $2, email = $3, updated_at = NOW()
         WHERE role = 'admin'`,
        [hashedPassword, NEW_ADMIN_USERNAME, NEW_ADMIN_EMAIL]
      );
      
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin
      console.log('👤 Admin user not found, creating new admin...');
      
      await client.query(
        `INSERT INTO affiliates (username, email, password, full_name, coupon_code, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [NEW_ADMIN_USERNAME, NEW_ADMIN_EMAIL, hashedPassword, 'Administrator', 'ADMIN2024', 'admin', 'active']
      );
      
      console.log('✅ Admin user created successfully!');
    }
    
    // Verify the update
    const verifyResult = await client.query(
      'SELECT username, email, role, status FROM affiliates WHERE role = $1',
      ['admin']
    );
    
    console.log('\n📋 Admin User Details:');
    console.log('   Username:', verifyResult.rows[0].username);
    console.log('   Email:', verifyResult.rows[0].email);
    console.log('   Role:', verifyResult.rows[0].role);
    console.log('   Status:', verifyResult.rows[0].status);
    
    console.log('\n🎉 Success! You can now login with:');
    console.log('   Username: ' + NEW_ADMIN_USERNAME);
    console.log('   Password: ' + NEW_ADMIN_PASSWORD);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function resetSQLite() {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, 'affiliate.db');
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
  });

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(NEW_ADMIN_PASSWORD, 10);
  console.log('🔐 Password hashed successfully');

  // Check if admin exists
  db.get(
    'SELECT * FROM affiliates WHERE username = ? OR email = ?',
    [NEW_ADMIN_USERNAME, NEW_ADMIN_EMAIL],
    (err, row) => {
      if (err) {
        console.error('❌ Error checking admin:', err.message);
        db.close();
        process.exit(1);
      }

      if (row) {
        // Update existing admin
        console.log('👤 Admin user found, updating password...');
        
        db.run(
          `UPDATE affiliates 
           SET password = ?, username = ?, email = ?, updated_at = CURRENT_TIMESTAMP
           WHERE role = 'admin'`,
          [hashedPassword, NEW_ADMIN_USERNAME, NEW_ADMIN_EMAIL],
          function(err) {
            if (err) {
              console.error('❌ Error updating admin:', err.message);
              db.close();
              process.exit(1);
            }
            
            console.log('✅ Admin password updated successfully!');
            verifyAndClose();
          }
        );
      } else {
        // Create new admin
        console.log('👤 Admin user not found, creating new admin...');
        
        db.run(
          `INSERT INTO affiliates (username, email, password, full_name, coupon_code, role, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [NEW_ADMIN_USERNAME, NEW_ADMIN_EMAIL, hashedPassword, 'Administrator', 'ADMIN2024', 'admin', 'active'],
          function(err) {
            if (err) {
              console.error('❌ Error creating admin:', err.message);
              db.close();
              process.exit(1);
            }
            
            console.log('✅ Admin user created successfully!');
            verifyAndClose();
          }
        );
      }
    }
  );

  function verifyAndClose() {
    // Verify the update
    db.get(
      'SELECT username, email, role, status FROM affiliates WHERE role = ?',
      ['admin'],
      (err, row) => {
        if (err) {
          console.error('❌ Error verifying admin:', err.message);
        } else {
          console.log('\n📋 Admin User Details:');
          console.log('   Username:', row.username);
          console.log('   Email:', row.email);
          console.log('   Role:', row.role);
          console.log('   Status:', row.status);
        }
        
        console.log('\n🎉 Success! You can now login with:');
        console.log('   Username: ' + NEW_ADMIN_USERNAME);
        console.log('   Password: ' + NEW_ADMIN_PASSWORD);
        
        db.close();
      }
    );
  }
}
