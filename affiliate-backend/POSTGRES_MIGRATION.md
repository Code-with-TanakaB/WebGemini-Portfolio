# How to Switch from SQLite to PostgreSQL

## Step 1: Install PostgreSQL Driver

```bash
cd affiliate-backend
npm install pg
```

## Step 2: Update package.json

The `pg` package should now be in your dependencies.

## Step 3: Backup Current SQLite Database (Optional)

```bash
# If you have existing data you want to keep
cp affiliate-backend/affiliate.db affiliate-backend/affiliate.db.backup
```

## Step 4: Switch to PostgreSQL Database File

**Option A: Rename files (keep old code as backup)**
```bash
cd affiliate-backend/models
mv database.js database-sqlite.js.backup
mv database-postgres.js database.js
```

**Option B: Replace content (I can do this for you)**
Just tell me and I'll update the existing `database.js` file with PostgreSQL code.

## Step 5: Set DATABASE_URL on Render

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Add new environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Get from your Render PostgreSQL database (see below)

### Get DATABASE_URL from Render Postgres:
1. Render Dashboard → Your PostgreSQL database
2. Look for "External Database URL" or "Connection String"
3. Copy the entire URL (looks like: `postgres://user:pass@dpg-xxx.oregon-postgres.render.com/dbname`)

## Step 6: Verify Other Environment Variables

Make sure these are set on Render:
- `NODE_ENV=production`
- `JWT_SECRET=your-secure-secret-at-least-32-characters`
- `ALLOWED_ORIGINS=https://your-frontend-domain.com`
- `DATABASE_URL=postgres://...` (from step 5)

## Step 7: Deploy

```bash
# Commit changes
git add .
git commit -m "Migrate to PostgreSQL for production"
git push origin main
```

Render will auto-deploy and use the new PostgreSQL database.

## Step 8: Verify

1. Check Render logs for "✅ Connected to PostgreSQL database"
2. Test login at your site
3. Create a test affiliate and verify data persists

## Troubleshooting

### Error: "Connection string invalid"
- Check DATABASE_URL format: must start with `postgres://` or `postgresql://`
- No extra spaces or quotes around the URL

### Error: "No such table"
- Database initialization failed
- Check logs for specific error
- Verify DATABASE_URL points to correct database

### Error: "SSL required"
- This is handled automatically in the code (ssl: { rejectUnauthorized: false })
- Render Postgres requires SSL

### Old data missing?
- PostgreSQL is a new empty database
- SQLite data needs manual migration if you want to keep it
- For fresh start, no migration needed

## Cost Reminder

- PostgreSQL on Render: $7/month
- Backend Web Service: $7/month
- **Total: $14/month**
- Much better than AWS EC2 ($20+ and manual work)

## Want Me to Help?

I can:
1. ✅ Update the database.js file directly (just say "yes")
2. Create a data migration script (if you have existing SQLite data to preserve)
3. Help troubleshoot any deployment errors
