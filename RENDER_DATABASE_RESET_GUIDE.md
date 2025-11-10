# 🔧 Render Database Reset Guide - Step by Step

## Problem: Need to reset database to apply new admin password

The new password `#01Admin@WG2024` is only in the code. To use it, you must reset the database.

---

## ✅ EASIEST METHOD: Delete and Recreate Database (Recommended)

### Step 1: Delete Old Database
1. Go to: https://dashboard.render.com
2. Click on your **PostgreSQL database** (not the web service)
3. Scroll to bottom of page
4. Click **"Delete Database"** (red button)
5. Type the database name to confirm
6. Click "Delete"

### Step 2: Create New Database
1. In Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `webgemini-affiliate-db` (or your preferred name)
   - **Database**: `webgemini`
   - **User**: `webgemini_user`
   - **Region**: Same as your web service
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait 2-3 minutes for creation

### Step 3: Connect Database to Web Service
1. After database is created, copy the **"Internal Database URL"**
2. Go to your **Web Service** (not database)
3. Click **"Environment"** tab
4. Find `DATABASE_URL` variable
5. Click "Edit"
6. Paste the new Internal Database URL
7. Click "Save"

### Step 4: Restart Web Service
1. Still in your web service
2. Click **"Manual Deploy"** dropdown
3. Select **"Clear build cache & deploy"**
4. Wait 3-5 minutes for deployment

### Step 5: Verify
1. Check deployment logs for:
   ```
   ✅ Connected to PostgreSQL database
   ✅ Database initialized successfully
   ⚠️ IMPORTANT: Default admin credentials:
      Username: its.admin01
      Password: #01Admin@WG2024
   ```
2. Go to login page
3. Login with new credentials
4. ✅ Success!

**Time Required**: 10 minutes  
**Difficulty**: Easy  
**Data Loss**: Yes (OK for test data)

---

## Alternative Method 1: Using External Database Client

If you have PostgreSQL installed locally:

### Step 1: Get Connection Details
1. Go to Render Dashboard
2. Click your PostgreSQL database
3. Copy these values:
   - **Host** (External URL)
   - **Database**
   - **User**
   - **Password**
   - **Port**

### Step 2: Connect via psql (Command Line)
```bash
# Install psql if needed (Ubuntu/Debian)
sudo apt-get install postgresql-client

# Connect to Render database
psql "postgresql://username:password@host:port/database?sslmode=require"

# Or use the full External Database URL
psql "your-external-database-url"
```

### Step 3: Drop Tables
```sql
-- Drop all tables
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;

-- Verify tables are gone
\dt

-- Exit
\q
```

### Step 4: Restart Web Service
1. Go to Render Dashboard → Your Web Service
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Tables will recreate with new password

---

## Alternative Method 2: Using pgAdmin (GUI Tool)

### Step 1: Download pgAdmin
- Windows/Mac: https://www.pgadmin.org/download/
- Or use online: https://www.elephantsql.com/

### Step 2: Add Connection
1. Open pgAdmin
2. Right-click "Servers" → "Register" → "Server"
3. **General Tab**:
   - Name: Render WebGemini DB
4. **Connection Tab**:
   - Host: (from Render dashboard)
   - Port: (from Render dashboard)
   - Database: (from Render dashboard)
   - Username: (from Render dashboard)
   - Password: (from Render dashboard)
   - SSL Mode: Require
5. Click "Save"

### Step 3: Drop Tables
1. Expand server → Databases → Your database → Schemas → public → Tables
2. Right-click each table:
   - `referrals`
   - `commissions`
   - `clients`
   - `affiliates`
3. Select "Delete/Drop" → Cascade
4. Confirm deletion

### Step 4: Restart Web Service (same as above)

---

## Alternative Method 3: Using Code Migration (No Manual Steps)

Add this temporary endpoint to your backend:

### Step 1: Add Reset Endpoint
Create file: `affiliate-backend/routes/reset-db.js`

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../models/database-postgres');
const bcrypt = require('bcryptjs');

// TEMPORARY - Delete after use!
router.post('/reset-database-admin-only', async (req, res) => {
  const { secret_key } = req.body;
  
  // Secret key to prevent accidental resets
  if (secret_key !== 'RESET_DB_2024_CONFIRM') {
    return res.status(403).json({ message: 'Invalid secret key' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop all tables
    await client.query('DROP TABLE IF EXISTS referrals CASCADE');
    await client.query('DROP TABLE IF EXISTS commissions CASCADE');
    await client.query('DROP TABLE IF EXISTS clients CASCADE');
    await client.query('DROP TABLE IF EXISTS affiliates CASCADE');
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Database reset! Restart your service to recreate tables.' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

module.exports = router;
```

### Step 2: Register Route in server.js
Add to `affiliate-backend/server.js`:

```javascript
// TEMPORARY - Remove after database reset
const resetRoutes = require('./routes/reset-db');
app.use('/api/admin', resetRoutes);
```

### Step 3: Call Endpoint
```bash
# After deploying the code
curl -X POST https://your-render-url.onrender.com/api/admin/reset-database-admin-only \
  -H "Content-Type: application/json" \
  -d '{"secret_key":"RESET_DB_2024_CONFIRM"}'
```

### Step 4: Restart Service
1. Render Dashboard → Your Web Service
2. Manual Deploy → Clear build cache & deploy

### Step 5: Remove Temporary Code
**IMPORTANT**: Delete the reset endpoint after use for security!

---

## Alternative Method 4: Environment Variable Trick

This forces table recreation without dropping:

### Step 1: Add Environment Variable
1. Render Dashboard → Web Service → Environment
2. Add new variable:
   - **Key**: `FORCE_DB_RESET`
   - **Value**: `true`
3. Save

### Step 2: Update database.js/database-postgres.js
Add this to initializeDatabase function:

```javascript
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Force reset if environment variable set
    if (process.env.FORCE_DB_RESET === 'true') {
      console.log('🔄 FORCE_DB_RESET=true, dropping tables...');
      await client.query('DROP TABLE IF EXISTS referrals CASCADE');
      await client.query('DROP TABLE IF EXISTS commissions CASCADE');
      await client.query('DROP TABLE IF EXISTS clients CASCADE');
      await client.query('DROP TABLE IF EXISTS affiliates CASCADE');
    }

    // Create tables (rest of existing code)...
```

### Step 3: Deploy
Service will auto-restart and drop tables

### Step 4: Remove Environment Variable
After successful reset, delete `FORCE_DB_RESET` variable

---

## 🎯 Which Method Should You Use?

| Method | Difficulty | Time | Data Loss | Best For |
|--------|-----------|------|-----------|----------|
| **Delete & Recreate** | ⭐ Easy | 10 min | Yes | First time users |
| **External Client** | ⭐⭐ Medium | 15 min | Yes | Developers |
| **pgAdmin** | ⭐⭐ Medium | 20 min | Yes | GUI lovers |
| **Code Migration** | ⭐⭐⭐ Hard | 30 min | Yes | Advanced users |
| **Env Variable** | ⭐⭐⭐ Hard | 25 min | Yes | One-time use |

### 🏆 RECOMMENDED: Delete & Recreate (Method 1)
- Fastest and simplest
- No tools needed
- Clean slate
- Perfect for test environments

---

## 🔍 Can't Find Database Shell on Render?

**Note**: Render Free tier PostgreSQL does NOT have a built-in shell in the dashboard!

You must use one of these options:
1. ✅ **Delete & Recreate** (easiest)
2. ✅ **External client** (psql or pgAdmin)
3. ✅ **Code-based reset** (temporary endpoint)

The "Shell" tab you might see is only available on paid plans.

---

## 📸 Visual Guide: Delete & Recreate

### Finding Your Database:
```
Render Dashboard
    ↓
[Left Sidebar]
    ↓
"PostgreSQL" section
    ↓
Click your database name
    ↓
Scroll to bottom
    ↓
Red "Delete Database" button
```

### After Creating New Database:
```
Copy "Internal Database URL"
    ↓
Go to Web Service
    ↓
Environment tab
    ↓
Edit DATABASE_URL
    ↓
Paste new URL
    ↓
Save
    ↓
Manual Deploy → Clear cache
```

---

## ✅ Verification Steps

After resetting database, check these:

### 1. Check Deployment Logs
```
Look for these lines in Render logs:

✅ Connected to PostgreSQL database
✅ Database initialized successfully
⚠️ IMPORTANT: Default admin credentials:
   Username: its.admin01
   Password: #01Admin@WG2024
```

### 2. Test Login
```
1. Go to: https://your-url.onrender.com/login.html
2. Clear browser cache (Ctrl+Shift+Delete)
3. Enter:
   Username: its.admin01
   Password: #01Admin@WG2024
4. Click Login
5. ✅ Should work!
```

### 3. Check Database Tables
If you have psql access:
```sql
\dt  -- Should show 4 tables

SELECT username, email, role FROM affiliates;
-- Should show: its.admin01, admin@webgemini.com, admin
```

---

## 🚨 Troubleshooting

### "Connection refused" or "Can't connect to database"
- Wait 2-3 minutes after creating new database
- Check Internal Database URL is correct
- Verify web service restarted
- Check DATABASE_URL environment variable

### "Login still fails with new password"
- Database wasn't actually reset
- Old password hash still in database
- Try delete & recreate method
- Check deployment logs for "Database initialized"

### "Tables not recreating"
- Check server.js has database initialization
- Verify DATABASE_URL is set correctly
- Check for errors in deployment logs
- Try "Clear build cache & deploy"

---

## 💡 Pro Tips

1. **Always use Internal Database URL** (not External) in your web service
   - Internal is faster and free
   - External uses public internet

2. **Take note of old data** if needed before deleting

3. **Test in browser incognito mode** after reset to avoid cache issues

4. **Check deployment logs** after every change - they tell you what's happening

5. **Keep DATABASE_URL secret** - never commit to GitHub

---

## 📞 Still Need Help?

If none of these methods work:

1. **Check Render Status**: https://status.render.com
2. **Check Deployment Logs**: Render Dashboard → Logs tab
3. **Try Incognito Mode**: Rule out browser cache
4. **Contact Render Support**: They can reset database for you

---

**Most Common Solution**: Delete database, create new one, update DATABASE_URL, deploy. Takes 10 minutes! ✅

**Last Updated**: November 10, 2025
