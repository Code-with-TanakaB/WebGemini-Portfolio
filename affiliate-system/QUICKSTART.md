# Quick Start Guide - WebGemini Affiliate System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd affiliate-system
npm install
```

### Step 2: Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Run these commands:
CREATE DATABASE webgemini_affiliates;
USE webgemini_affiliates;
SOURCE database/schema.sql;
```

### Step 3: Configure Environment
```bash
cp .env.example .env
nano .env
```

Update these essential values:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=random_string_here_change_me
```

### Step 4: Start Server
```bash
npm run dev
```

✅ Server running at: http://localhost:3000

### Step 5: Test the System

#### A. Test Admin Dashboard
1. Open: http://localhost:3000/admin-dashboard.html
2. Login with:
   - Username: `admin`
   - Password: `admin123` (⚠️ Change this!)

#### B. Create Your First Affiliate
In admin dashboard:
1. Click "Add Affiliate"
2. Fill in details
3. Create coupon code (e.g., `JOHN@wg`)

#### C. Test Affiliate Dashboard
1. Open: http://localhost:3000/affiliate-dashboard.html
2. Enter the coupon code you just created

#### D. Test the Contact Form
1. Open your main website: `/workspaces/WebGemini-Portfolio/index.html`
2. Go to "Get Your Free Quote" section
3. Fill out the form
4. Enter the affiliate coupon code
5. Submit

Check the affiliate dashboard - you'll see the referral appear instantly!

## 🎯 Key URLs

| Resource | URL |
|----------|-----|
| API Health | http://localhost:3000/api/health |
| Admin Dashboard | http://localhost:3000/admin-dashboard.html |
| Affiliate Dashboard | http://localhost:3000/affiliate-dashboard.html |

## 🔧 Common Issues

### "Database connection failed"
- Check MySQL is running: `sudo service mysql status`
- Verify credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### "JWT token invalid"
- Clear browser localStorage
- Re-login to admin dashboard

### "Coupon validation failed"
- Ensure API server is running
- Check browser console for errors
- Verify coupon format ends with `@wg`

## 📊 Default Commission Rates

- **Starter Plan**: 10% of R1,500 = **R150**
- **Professional Plan**: 25% of R2,500 = **R625**
- **Enterprise Plan**: 25% of R4,000+ = **R1,000+**

## 🎓 Next Steps

1. ✅ Change default admin password
2. ✅ Create your first affiliates
3. ✅ Test the complete flow
4. ✅ Customize commission rates if needed
5. ✅ Deploy to production

## 🆘 Need Help?

- 📖 Read the full README.md
- 📧 Email: admin@webgemini.co.za
- 📱 Phone: +27 67-819-1766

---

**Pro Tip**: Test with a few dummy affiliates first before going live!
