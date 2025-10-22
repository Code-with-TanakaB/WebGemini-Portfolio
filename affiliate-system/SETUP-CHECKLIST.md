# 🚀 Complete Setup Checklist

Use this checklist to ensure your WebGemini Affiliate System is properly installed and configured.

## ✅ Pre-Installation

- [ ] Node.js v16+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] MySQL v8+ installed (`mysql --version`)
- [ ] MySQL root password known
- [ ] Terminal/command prompt access
- [ ] Text editor ready (VS Code, nano, vim, etc.)

## ✅ Installation Steps

### 1. Navigate to Project
```bash
cd /workspaces/WebGemini-Portfolio/affiliate-system
```
- [ ] In correct directory

### 2. Install Dependencies
```bash
npm install
```
- [ ] All packages installed successfully
- [ ] No critical errors in output
- [ ] `node_modules/` folder created

### 3. Database Setup
```bash
mysql -u root -p
```
Then run:
```sql
CREATE DATABASE webgemini_affiliates;
USE webgemini_affiliates;
SOURCE database/schema.sql;
SHOW TABLES;
```
- [ ] Database created
- [ ] Schema imported
- [ ] 7 tables visible:
  - [ ] affiliates
  - [ ] referrals
  - [ ] commission_payments
  - [ ] affiliate_analytics
  - [ ] admin_users
  - [ ] coupon_usage_log
- [ ] Sample data inserted

### 4. Environment Configuration
```bash
cp .env.example .env
nano .env
```
Edit these values:
- [ ] `DB_HOST=localhost`
- [ ] `DB_USER=root` (or your MySQL user)
- [ ] `DB_PASSWORD=your_actual_password`
- [ ] `DB_NAME=webgemini_affiliates`
- [ ] `JWT_SECRET=random_long_string_here`
- [ ] `PORT=3000`

### 5. Test Server Start
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] See: "Database connected successfully"
- [ ] See: "Server running on port 3000"
- [ ] No error messages

### 6. Test API Health
Open browser to: `http://localhost:3000/api/health`

Expected response:
```json
{
  "status": "OK",
  "message": "WebGemini Affiliate System is running",
  "timestamp": "2025-..."
}
```
- [ ] API responds
- [ ] Status is "OK"

## ✅ Dashboard Testing

### 7. Test Admin Dashboard
Open: `http://localhost:3000/admin-dashboard.html`

Login credentials:
- Username: `admin`
- Password: `admin123`

- [ ] Login page loads
- [ ] Can login successfully
- [ ] Dashboard shows stats
- [ ] Can see overview tab
- [ ] Can see affiliates tab
- [ ] Can see referrals tab

### 8. Create Test Affiliate
In admin dashboard:
1. Click "Add Affiliate"
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Coupon: TEST@wg

- [ ] Affiliate created
- [ ] Appears in affiliates table
- [ ] Status is "active"

### 9. Test Affiliate Dashboard
Open: `http://localhost:3000/affiliate-dashboard.html`

Login with: `TEST@wg`

- [ ] Login works
- [ ] Dashboard loads
- [ ] Shows 0 referrals
- [ ] Shows coupon code
- [ ] Can copy coupon code

### 10. Test Contact Form Integration
Open: `/workspaces/WebGemini-Portfolio/index.html` in browser

1. Scroll to "Get Your Free Quote"
2. Fill out the form
3. Enter coupon: `TEST@wg`
4. Submit

- [ ] Coupon validates (green border)
- [ ] Form submits successfully
- [ ] See success message
- [ ] Referral appears in affiliate dashboard
- [ ] Referral appears in admin dashboard

## ✅ Security Configuration

### 11. Change Admin Password
In MySQL:
```sql
USE webgemini_affiliates;
-- Generate new hash for your password using bcrypt online tool
UPDATE admin_users 
SET password_hash = 'your_new_bcrypt_hash' 
WHERE username = 'admin';
```
- [ ] Password changed
- [ ] Can login with new password
- [ ] Old password no longer works

### 12. Update JWT Secret
In `.env`:
```env
JWT_SECRET=your_very_long_random_string_at_least_32_characters
```
- [ ] New secret generated
- [ ] `.env` file saved
- [ ] Server restarted

### 13. Configure CORS
In `.env`:
```env
FRONTEND_URL=https://your-actual-domain.com
```
- [ ] URL updated for production
- [ ] Or set to `*` for development

## ✅ Production Deployment (Optional)

### 14. Server Setup
- [ ] Production server ready (VPS, cloud, etc.)
- [ ] Node.js installed on server
- [ ] MySQL installed on server
- [ ] Firewall configured (ports 3000, 3306)
- [ ] SSL certificate obtained
- [ ] Domain DNS configured

### 15. Deploy Files
```bash
# On your local machine
git clone <your-repo>
# or
scp -r affiliate-system/ user@server:/path/to/deploy/
```
- [ ] Files transferred
- [ ] Correct permissions set

### 16. Production Environment
On server:
```bash
cd affiliate-system
npm install --production
cp .env.example .env
nano .env
```
Update:
- [ ] NODE_ENV=production
- [ ] Database credentials
- [ ] Strong JWT secret
- [ ] Production URLs

### 17. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name "webgemini-affiliate"
pm2 save
pm2 startup
```
- [ ] PM2 installed
- [ ] App running
- [ ] Auto-restart configured
- [ ] Logs accessible (`pm2 logs`)

### 18. Nginx/Apache Configuration
Example Nginx:
```nginx
server {
    listen 80;
    server_name api.webgemini.co.za;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
- [ ] Reverse proxy configured
- [ ] SSL certificate installed
- [ ] HTTPS enabled

### 19. Database Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
mysqldump -u root -p webgemini_affiliates > /backups/affiliate_$(date +%Y%m%d).sql
EOF

chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```
- [ ] Backup script created
- [ ] Cron job scheduled
- [ ] Test backup works

## ✅ First Affiliates Setup

### 20. Create Real Affiliates
For each influencer:
1. Get their details:
   - Name
   - Email
   - Social media handle
   - Platform (Instagram, TikTok, etc.)
   - Preferred coupon code (XXX@wg)

2. Create in admin dashboard
3. Send them:
   - Dashboard link
   - Their coupon code
   - Commission structure
   - Promotional guidelines

- [ ] First affiliate created
- [ ] Welcome email sent
- [ ] Dashboard access confirmed

### 21. Promotional Materials
Prepare for affiliates:
- [ ] Commission rate sheet
- [ ] Brand guidelines
- [ ] Sample social media posts
- [ ] Graphics/images
- [ ] FAQ document
- [ ] Contact information

## ✅ Testing Checklist

### 22. End-to-End Test
Complete flow test:
1. [ ] Affiliate gets coupon code
2. [ ] Customer visits website
3. [ ] Customer fills form with coupon
4. [ ] Referral tracked in system
5. [ ] Appears in affiliate dashboard
6. [ ] Appears in admin dashboard
7. [ ] Admin marks as "contacted"
8. [ ] Admin marks as "converted"
9. [ ] Commission moves to "earned"
10. [ ] Payment recorded
11. [ ] Shows in affiliate's "paid out"

### 23. Error Handling
Test these scenarios:
- [ ] Invalid coupon code
- [ ] Inactive affiliate coupon
- [ ] Form spam protection (24-hour cooldown)
- [ ] Invalid email format
- [ ] Missing required fields
- [ ] Database connection loss
- [ ] API rate limiting

## ✅ Monitoring Setup

### 24. Logging
- [ ] Server logs accessible
- [ ] Error logs configured
- [ ] Database query logs enabled
- [ ] API access logs working

### 25. Monitoring Tools (Optional)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Database monitoring

## ✅ Documentation

### 26. Team Training
- [ ] Admin trained on dashboard
- [ ] Process for managing referrals documented
- [ ] Payment process documented
- [ ] Troubleshooting guide created

### 27. Affiliate Onboarding
Create documents:
- [ ] Welcome email template
- [ ] Dashboard usage guide
- [ ] Best practices for promotion
- [ ] Payment schedule information

## ✅ Legal & Compliance

### 28. Terms & Agreements
- [ ] Affiliate agreement created
- [ ] Payment terms defined
- [ ] Termination conditions stated
- [ ] Data privacy policy updated

### 29. Tax Compliance
- [ ] Understand tax implications
- [ ] W9/tax forms prepared (if applicable)
- [ ] Payment reporting system ready

## ✅ Launch Preparation

### 30. Pre-Launch Checklist
- [ ] All systems tested
- [ ] Real affiliates recruited
- [ ] Promotional materials ready
- [ ] Support channels established
- [ ] Backup systems verified
- [ ] Monitoring in place

### 31. Soft Launch
- [ ] Start with 2-3 affiliates
- [ ] Monitor closely for 1 week
- [ ] Gather feedback
- [ ] Fix any issues
- [ ] Optimize based on data

### 32. Full Launch
- [ ] Recruit more affiliates
- [ ] Scale gradually
- [ ] Monitor performance
- [ ] Process first payments
- [ ] Collect testimonials

## ✅ Ongoing Maintenance

### 33. Daily Tasks
- [ ] Check for new referrals
- [ ] Update referral statuses
- [ ] Respond to affiliate questions
- [ ] Monitor system health

### 34. Weekly Tasks
- [ ] Review top performers
- [ ] Analyze conversion rates
- [ ] Check for fraud/abuse
- [ ] Backup database

### 35. Monthly Tasks
- [ ] Process commission payments
- [ ] Send performance reports
- [ ] Update promotional materials
- [ ] Review and optimize rates

## 🎉 Completion

### Final Verification
Run the verification script:
```bash
bash verify-install.sh
```

All checks should show ✓ (green checkmarks)

### You're Ready When:
- [✓] All installations complete
- [✓] Database configured
- [✓] Admin dashboard accessible
- [✓] Affiliate dashboard accessible
- [✓] Contact form integrated
- [✓] Test referral tracked successfully
- [✓] Security measures in place
- [✓] Documentation reviewed

---

## 🆘 Troubleshooting

If you encounter issues, check:
1. **Server logs**: Look for error messages
2. **Browser console**: Check for JavaScript errors
3. **MySQL logs**: Verify database queries
4. **Network tab**: Check API responses
5. **README.md**: Full documentation
6. **QUICKSTART.md**: Setup guide

## 📞 Support

Need help? Contact:
- Email: admin@webgemini.co.za
- Phone: +27 67-819-1766

---

**Congratulations! 🎊**

Your affiliate system is now ready to help you scale your business through influencer partnerships!

Start recruiting affiliates and watch your leads grow! 📈
