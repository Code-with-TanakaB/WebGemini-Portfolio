// Smart database loader - uses PostgreSQL if DATABASE_URL is set, otherwise SQLite
// This ensures consistent database usage across the application

let db, dbHelpers, pool;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL (for production/Render)
  console.log('📊 Loading PostgreSQL database module...');
  const postgres = require('./database-postgres');
  db = postgres.db;
  dbHelpers = postgres.db;
  pool = postgres.pool;
} else {
  // Use SQLite (for local development)
  console.log('📊 Loading SQLite database module...');
  const sqlite = require('./database');
  db = sqlite.db;
  dbHelpers = sqlite.dbHelpers;
  pool = null; // SQLite doesn't use connection pool
}

module.exports = { db, dbHelpers, pool };
