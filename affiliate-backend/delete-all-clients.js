#!/usr/bin/env node

/**
 * Script to delete all clients from the database
 * This will remove all client records and their associated commissions
 * Use this to clear out old test data with outdated prices
 */

require('dotenv').config();
const { Pool } = require('pg');

// Use PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function deleteAllClients() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting to delete all clients...\n');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Get count of clients before deletion
    const countResult = await client.query('SELECT COUNT(*) FROM clients');
    const clientCount = parseInt(countResult.rows[0].count);
    
    if (clientCount === 0) {
      console.log('✅ No clients found in the database.');
      await client.query('ROLLBACK');
      return;
    }
    
    console.log(`Found ${clientCount} client(s) in the database.`);
    
    // Delete all commissions first (foreign key constraint)
    const commissionsResult = await client.query('DELETE FROM commissions RETURNING *');
    console.log(`✅ Deleted ${commissionsResult.rowCount} commission record(s)`);
    
    // Delete all clients
    const clientsResult = await client.query('DELETE FROM clients RETURNING *');
    console.log(`✅ Deleted ${clientsResult.rowCount} client record(s)`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n🎉 All clients and commissions have been successfully deleted!');
    console.log('📝 New client signups will now use the updated prices:');
    console.log('   - Starter: R1,500 (10% commission)');
    console.log('   - Professional: R2,500 (15% commission)');
    console.log('   - Enterprise: R4,999 (20% commission)');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting clients:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
deleteAllClients()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
