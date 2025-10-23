# WebGemini Affiliate System - Quick Start Guide

## ✅ System is Ready!

Your affiliate tracking system is now fully operational. Follow these steps to get started:

## 🚀 Getting Started (First Time Setup)

### 1. Server is Already Running
The backend server is running on: **http://localhost:3001**

If you need to restart it:
```bash
cd affiliate-backend
npm start
```

### 2. Access the Login Page
Open your browser and go to: **http://localhost:3001/login.html**

### 3. Login as Administrator
Use the default admin credentials:
- **Username:** admin
- **Password:** admin123

## 📊 What You'll See in Admin Dashboard

### Overview Section
- Total number of affiliates
- Total clients signed up
- Total revenue generated
- Total commissions (pending and paid)

### Affiliates Section
- View all registered affiliates
- See their coupon codes
- Add new affiliates
- Track affiliate status

### Clients Section
- View all client signups
- See which affiliate referred them
- Check plan types and prices
- View commission amounts

### Commissions Section
- Filter by status (pending/paid)
- Track commission rates (10% or 25%)
- Monitor payment status

## 👤 Create Your First Affiliate

### Option 1: Through Admin Dashboard
1. Login as admin
2. Go to "Affiliates" section
3. Click "Add Affiliate" button
4. Fill in the form:
   - Full Name: Jane Influencer
   - Username: jane_influencer
   - Email: jane@example.com
   - Password: (create a secure password)
   - Coupon Code: JANE2024
5. Click "Add Affiliate"

### Option 2: Direct Registration
Go to: **http://localhost:3001/login.html** and use the register endpoint via API

## 📝 Test Client Signup

1. Open: **http://localhost:3001/client-signup.html**
2. Fill in client information:
   - Name: John Smith
   - Email: john@example.com
   - Phone: +1 555-123-4567
   - Plan Type: Premium Plan ($1,499)
   - Coupon Code: JANE2024
3. Click "Verify" to validate the coupon
4. Click "Complete Signup"

## 💰 Commission Calculation

### Automatic Commission Rates:
- **Starter Plans:** 10% commission
  - Starter ($299) → $29.90
  - Basic ($499) → $49.90

- **High-Tier Plans:** 25% commission
  - Pro ($999) → $249.75
  - Premium ($1,499) → $374.75
  - Enterprise ($2,999) → $749.75

## 🔄 Workflow Example

### Scenario: Influencer Referral Process

1. **Affiliate Registers**
   - Jane creates account with coupon code "JANE2024"
   - Receives login credentials

2. **Affiliate Shares Code**
   - Jane shares JANE2024 on social media
   - Posts on Twitter, Instagram, YouTube

3. **Client Signs Up**
   - Client sees Jane's content
   - Goes to signup page
   - Enters coupon code JANE2024
   - Selects Premium Plan ($1,499)

4. **System Tracks**
   - Validates coupon code
   - Creates client record
   - Links to Jane's affiliate ID
   - Calculates 25% commission = $374.75
   - Creates commission record (status: pending)

5. **Dashboard Updates**
   - Admin sees new client with Jane's referral
   - Jane sees new referral in her dashboard
   - Both see $374.75 pending commission

## 🎯 Key Features to Test

### As Admin:
1. ✅ View all affiliates and their performance
2. ✅ See total revenue and commissions
3. ✅ Track which influencer referred which client
4. ✅ Add new affiliate accounts
5. ✅ Filter commissions by status

### As Affiliate:
1. ✅ View personal referral count
2. ✅ See total earnings (pending + paid)
3. ✅ Track individual referrals
4. ✅ Copy and share unique coupon code
5. ✅ Share on social media platforms

### As Client:
1. ✅ Verify coupon codes before signup
2. ✅ See affiliate name when code is valid
3. ✅ Complete signup with or without coupon
4. ✅ Get instant confirmation

## 🌐 URLs Reference

| Page | URL | Access Level |
|------|-----|--------------|
| Login | http://localhost:3001/login.html | Public |
| Admin Dashboard | http://localhost:3001/admin-dashboard.html | Admin Only |
| Affiliate Dashboard | http://localhost:3001/affiliate-dashboard.html | Affiliate Only |
| Client Signup | http://localhost:3001/client-signup.html | Public |
| API Docs | http://localhost:3001/api | Public |

## 🔐 Security Notes

### Important: Change Before Production!
1. **Admin Password**: Change from "admin123"
2. **JWT Secret**: Update in `.env` file
3. **CORS Settings**: Configure allowed origins
4. **HTTPS**: Enable SSL/TLS in production

## 🎨 Customization Options

### Branding
- Edit `dashboard-style.css` for colors and styling
- Update logos in HTML files
- Customize email templates (future feature)

### Commission Rates
- Edit `affiliate-backend/routes/affiliates.js`
- Modify `calculateCommission` function
- Update rates in `.env` file

### Plan Types
- Edit `client-signup.html`
- Update `planPrices` object
- Add/remove plan options

## 📱 Integration with Your Website

### Add to Existing Website:
```html
<!-- Add this to your website's signup page -->
<script src="http://localhost:3001/client-signup.js"></script>
```

Or embed the signup form iframe:
```html
<iframe src="http://localhost:3001/client-signup.html" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>
```

## 🐛 Troubleshooting

### Server Not Starting?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process if needed
kill -9 <PID>

# Restart server
cd affiliate-backend
npm start
```

### Database Issues?
```bash
# Delete and recreate database
cd affiliate-backend
rm affiliate.db
npm start  # Will create fresh database
```

### Login Not Working?
1. Check browser console for errors (F12)
2. Verify API_BASE_URL in HTML files
3. Ensure server is running
4. Try clearing browser cache

## 📊 Sample Data for Testing

### Test Affiliates:
- Username: jane_influencer, Coupon: JANE2024
- Username: mike_marketing, Coupon: MIKE2024
- Username: sarah_social, Coupon: SARAH2024

### Test Plans:
- Starter Plan: $299 (10% = $29.90)
- Premium Plan: $1,499 (25% = $374.75)
- Enterprise Plan: $2,999 (25% = $749.75)

## 🎉 Next Steps

1. ✅ Login and explore the admin dashboard
2. ✅ Create a test affiliate account
3. ✅ Test the client signup flow
4. ✅ Verify commission calculations
5. ✅ Check the affiliate dashboard
6. ✅ Test social sharing features
7. ✅ Customize branding and colors
8. ✅ Integrate with your main website

## 💡 Tips for Success

1. **Regular Monitoring**: Check admin dashboard daily
2. **Clear Communication**: Set payment schedules with affiliates
3. **Track Performance**: Monitor which affiliates bring most value
4. **Optimize Codes**: Use memorable, brand-relevant coupon codes
5. **Provide Materials**: Give affiliates marketing materials to share

## 📞 Support

If you encounter any issues or need customization:
- Check the main README: `AFFILIATE_SYSTEM_README.md`
- Review API documentation at: http://localhost:3001/api
- Check server logs for detailed error messages

---

**Your affiliate system is ready to track referrals and grow your business! 🚀**
