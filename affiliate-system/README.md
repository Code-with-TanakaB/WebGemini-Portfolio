# WebGemini Affiliate Tracking System

A comprehensive affiliate marketing system that enables transparent tracking for both influencers and administrators. Track referrals, calculate commissions, and manage payouts seamlessly.

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Commission Structure](#commission-structure)
- [Admin Panel](#admin-panel)
- [Affiliate Dashboard](#affiliate-dashboard)

## ✨ Features

### For Affiliates/Influencers:
- ✅ Unique coupon code generation (format: `CODE@wg`)
- ✅ Real-time referral tracking
- ✅ Transparent commission calculation
- ✅ Personal dashboard with analytics
- ✅ Monthly performance charts
- ✅ Plan-based commission breakdown
- ✅ Payment history tracking

### For Admins:
- ✅ Centralized affiliate management
- ✅ Referral status tracking (pending, contacted, converted, lost)
- ✅ Commission payment processing
- ✅ Performance analytics
- ✅ Fraud prevention with cooldown periods
- ✅ Detailed usage logs

## 🏗️ System Architecture

```
affiliate-system/
├── config/
│   └── database.js          # Database connection
├── routes/
│   ├── affiliate.routes.js  # Affiliate registration & profile
│   ├── referral.routes.js   # Referral tracking & validation
│   ├── admin.routes.js      # Admin management
│   └── analytics.routes.js  # Performance metrics
├── public/
│   └── affiliate-dashboard.html  # Influencer dashboard
├── database/
│   └── schema.sql           # Database schema
├── server.js                # Express server
├── package.json             # Dependencies
└── .env.example             # Environment variables template
```

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone and Setup

```bash
cd affiliate-system
npm install
```

### Step 2: Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE webgemini_affiliates;

# Import schema
mysql -u root -p webgemini_affiliates < database/schema.sql
```

### Step 3: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Update the following variables:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=webgemini_affiliates

JWT_SECRET=your_random_secret_key_here

ADMIN_EMAIL=admin@webgemini.co.za
ADMIN_PASSWORD=change_this_secure_password
```

### Step 4: Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000/api`

## ⚙️ Configuration

### Commission Structure

Edit commission rates in `.env`:

```env
COMMISSION_STARTER=10      # 10% for Starter plan (R1,500)
COMMISSION_PROFESSIONAL=25  # 25% for Professional plan (R2,500)
COMMISSION_ENTERPRISE=25    # 25% for Enterprise plan (R4,000+)
```

### Plan Prices

```env
PRICE_STARTER=1500
PRICE_PROFESSIONAL=2500
PRICE_ENTERPRISE=4000
```

## 🚀 Usage

### For Influencers

#### 1. Register as an Affiliate

**Option A: Admin Creates Your Account**
Contact admin@webgemini.co.za to get your unique coupon code.

**Option B: Self-Registration (if enabled)**
```bash
POST /api/affiliates/register
{
  "name": "Your Name",
  "email": "your@email.com",
  "socialHandle": "@yourhandle",
  "platform": "Instagram",
  "preferredCoupon": "YOURCODE@wg"
}
```

#### 2. Access Your Dashboard

Visit: `http://localhost:3000/affiliate-dashboard.html`

Enter your coupon code to login and view:
- Total referrals
- Pending commission
- Total earned
- Payment history
- Recent referrals
- Monthly performance charts

#### 3. Promote Your Coupon

Share your unique code (e.g., `PROMO@wg`) with your audience on:
- Instagram posts/stories
- TikTok videos
- YouTube descriptions
- Blog posts
- Social media bios

#### 4. Track Your Earnings

Real-time tracking when customers:
1. Visit webgemini.co.za
2. Fill out the quote form
3. Enter your coupon code
4. Submit the form

Commission is calculated automatically based on their selected plan!

### For Customers

1. Visit webgemini.co.za
2. Navigate to "Get Your Free Quote" section
3. Fill out the form
4. Enter influencer's coupon code (e.g., `JOHN@wg`)
5. Submit

The system will:
- Validate the coupon in real-time
- Show green border if valid
- Track the referral automatically
- Apply appropriate commission rate

## 📊 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Referral Endpoints

#### Validate Coupon Code
```http
POST /referrals/validate-coupon
Content-Type: application/json

{
  "couponCode": "JOHN@wg"
}

Response:
{
  "valid": true,
  "message": "Coupon code is valid",
  "affiliate": {
    "name": "John Influencer",
    "code": "JOHN@wg"
  }
}
```

#### Track Referral
```http
POST /referrals/track-referral
Content-Type: application/json

{
  "couponCode": "JOHN@wg",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+27123456789",
  "serviceType": "website-design",
  "budget": "2k-5k",
  "message": "I need a professional website"
}

Response:
{
  "success": true,
  "referralId": 123,
  "commission": {
    "plan": "professional",
    "amount": 625,
    "currency": "ZAR"
  }
}
```

#### Get Affiliate Dashboard
```http
GET /referrals/dashboard/JOHN@wg

Response:
{
  "success": true,
  "affiliate": { ... },
  "summary": {
    "totalReferrals": 15,
    "totalEarned": 3750.00,
    "pendingCommission": 1250.00,
    "paidCommission": 2500.00
  },
  "referrals": [ ... ],
  "planBreakdown": [ ... ],
  "monthlyPerformance": [ ... ]
}
```

### Admin Endpoints (Requires JWT Token)

#### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": { ... }
}
```

#### Get All Affiliates
```http
GET /admin/affiliates
Authorization: Bearer {token}
```

#### Create New Affiliate
```http
POST /admin/affiliates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sarah Creator",
  "email": "sarah@example.com",
  "phone": "+27123456789",
  "socialHandle": "@sarahcreates",
  "platform": "TikTok",
  "couponCode": "SARAH@wg"
}
```

#### Update Referral Status
```http
PATCH /admin/referrals/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "converted"  // pending, contacted, converted, lost
}
```

#### Record Commission Payment
```http
POST /admin/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "affiliateId": 1,
  "amount": 2500.00,
  "paymentMethod": "bank_transfer",
  "transactionRef": "TXN123456",
  "notes": "Payment for Q1 2025"
}
```

## 💰 Commission Structure

| Plan | Price | Commission Rate | Commission Amount |
|------|-------|----------------|------------------|
| Starter | R1,500 | 10% | **R150** |
| Professional | R2,500 | 25% | **R625** |
| Enterprise | R4,000+ | 25% | **R1,000+** |

### Commission Lifecycle

1. **Pending**: Customer submits form with coupon
2. **Contacted**: Admin contacts the lead
3. **Converted**: Customer pays and project starts
4. **Paid**: Commission paid to affiliate

## 🔐 Admin Panel

### Access
Create admin dashboard at `/admin-dashboard.html` or use API directly.

### Key Features

1. **Dashboard Overview**
   - Total affiliates count
   - Total referrals
   - Total commission paid
   - Conversion rates

2. **Affiliate Management**
   - View all affiliates
   - Activate/deactivate accounts
   - Edit commission rates
   - View performance metrics

3. **Referral Management**
   - Track all referrals
   - Update referral status
   - Mark as converted
   - Contact information

4. **Payment Processing**
   - Record payments
   - Payment history
   - Bulk payment processing
   - Export reports

### Admin Best Practices

1. **Regular Status Updates**
   - Move referrals from "pending" to "contacted" within 24 hours
   - Update to "converted" when payment is received
   - Mark as "lost" if customer doesn't proceed

2. **Commission Payments**
   - Process payments monthly
   - Require minimum payout (e.g., R500)
   - Keep detailed transaction records

3. **Fraud Prevention**
   - Monitor for unusual patterns
   - Verify customer emails
   - Check for duplicate submissions

## 📱 Affiliate Dashboard

### Features

- **Stats Cards**: Total referrals, pending commission, earned, paid
- **Coupon Code Display**: One-click copy functionality
- **Performance Chart**: Monthly trends visualization
- **Plan Breakdown**: Earnings by plan type
- **Referrals Table**: Recent referrals with status

### Mobile Responsive
Fully responsive design works on all devices.

## 🛡️ Security Features

1. **Rate Limiting**: 100 requests per 15 minutes
2. **JWT Authentication**: Secure admin access
3. **Input Validation**: Express-validator on all endpoints
4. **SQL Injection Protection**: Parameterized queries
5. **CORS Protection**: Configurable allowed origins
6. **Spam Prevention**: 24-hour cooldown between submissions

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
mysql -u your_user -p webgemini_affiliates

# Check if tables exist
SHOW TABLES;
```

### API Not Responding
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check logs
npm run dev  # Shows detailed logs
```

### Coupon Not Validating
1. Check if affiliate status is "active"
2. Verify coupon format ends with `@wg`
3. Check database connection
4. Review browser console for errors

## 📈 Future Enhancements

- [ ] Email notifications for new referrals
- [ ] SMS alerts for converted leads
- [ ] Automated monthly reports
- [ ] Affiliate tiers (Bronze, Silver, Gold)
- [ ] Bonus commissions for top performers
- [ ] Referral link tracking (UTM parameters)
- [ ] Multi-currency support
- [ ] WhatsApp integration

## 📞 Support

For technical support:
- **Email**: admin@webgemini.co.za
- **Phone**: +27 67-819-1766

## 📄 License

Copyright © 2025 WebGemini. All rights reserved.

---

**Built with ❤️ for transparent affiliate marketing**
