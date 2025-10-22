# WebGemini Affiliate System - Visual Guide

## 🎯 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

Customer sees influencer post
         ↓
Customer visits webgemini.co.za
         ↓
Fills out "Get Your Free Quote" form
         ↓
Enters coupon code: SARAH@wg
         ↓
System validates coupon ✓
         ↓
Form submitted to Formspree + API
         ↓
Referral tracked in database
         ↓
Influencer sees it in dashboard instantly!


┌─────────────────────────────────────────────────────────────────┐
│                  INFLUENCER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

Admin creates affiliate account
         ↓
Influencer gets coupon: SARAH@wg
         ↓
Shares on Instagram/TikTok/YouTube
         ↓
Customers use the code
         ↓
Dashboard shows:
  • Total referrals: 15
  • Pending commission: R1,250
  • Total earned: R3,750
  • Paid out: R2,500
         ↓
Monthly payment received
         ↓
Payment shows in dashboard


┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN WORKFLOW                                │
└─────────────────────────────────────────────────────────────────┘

Create new affiliate
         ↓
Provide coupon code
         ↓
Monitor referrals in dashboard
         ↓
Customer submits form → Status: PENDING
         ↓
Contact customer → Status: CONTACTED
         ↓
Customer pays → Status: CONVERTED
         ↓
Commission moves from "pending" to "earned"
         ↓
Process monthly payment
         ↓
Record payment in system
         ↓
Influencer sees payment in dashboard


┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE STRUCTURE                              │
└─────────────────────────────────────────────────────────────────┘

affiliates
├── id, name, email, phone
├── social_media_handle, platform
├── coupon_code (UNIQUE, ends with @wg)
├── status (active/inactive/pending)
├── total_referrals
├── total_commission_earned
├── pending_commission
└── paid_commission

referrals
├── id, affiliate_id (FK)
├── customer_name, customer_email, customer_phone
├── service_type, plan_type, budget_range
├── coupon_code
├── plan_price, commission_rate, commission_amount
├── status (pending/contacted/converted/lost)
└── referred_at

commission_payments
├── id, affiliate_id (FK)
├── amount, payment_method
├── transaction_reference
└── payment_date

coupon_usage_log
├── id, coupon_code, affiliate_id
├── customer_email, ip_address
├── validation_status
└── form_data (JSON)


┌─────────────────────────────────────────────────────────────────┐
│                  API ENDPOINTS OVERVIEW                          │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS (No Auth Required)
├── POST /api/referrals/validate-coupon
│   └── Validates coupon code format and status
├── POST /api/referrals/track-referral
│   └── Records new referral and calculates commission
├── GET  /api/referrals/dashboard/:couponCode
│   └── Returns affiliate's complete dashboard data
└── POST /api/affiliates/register
    └── Self-registration for new affiliates

ADMIN ENDPOINTS (JWT Token Required)
├── POST /api/admin/login
│   └── Admin authentication
├── GET  /api/admin/affiliates
│   └── List all affiliates
├── POST /api/admin/affiliates
│   └── Create new affiliate
├── PATCH /api/admin/affiliates/:id/status
│   └── Activate/deactivate affiliate
├── GET  /api/admin/referrals
│   └── List all referrals
├── PATCH /api/admin/referrals/:id/status
│   └── Update referral status
├── POST /api/admin/payments
│   └── Record commission payment
└── GET  /api/admin/dashboard
    └── Overall system statistics


┌─────────────────────────────────────────────────────────────────┐
│                  COMMISSION CALCULATION                          │
└─────────────────────────────────────────────────────────────────┘

Budget Selected → Plan Type → Commission Rate → Amount

Under R2,000
    ↓
Starter Plan
    ↓
10% commission
    ↓
R1,500 × 0.10 = R150

R2,000 - R5,000
    ↓
Professional Plan
    ↓
25% commission
    ↓
R2,500 × 0.25 = R625

R5,000 - R10,000 or R10,000+
    ↓
Enterprise Plan
    ↓
25% commission
    ↓
R4,000 × 0.25 = R1,000


┌─────────────────────────────────────────────────────────────────┐
│                  STATUS PROGRESSION                              │
└─────────────────────────────────────────────────────────────────┘

REFERRAL STATUS FLOW:

PENDING → CONTACTED → CONVERTED → PAID
  ↓         ↓            ↓           ↓
 New     Called     Paid &      Payment
 Lead    Customer   Started     Sent


AFFILIATE STATUS:

PENDING → ACTIVE → INACTIVE
  ↓          ↓         ↓
Awaiting  Approved   Paused
Approval  & Live     or Ended


COMMISSION STATUS:

PENDING → EARNED → PAID
  ↓         ↓        ↓
Lead      Sale      Money
Sent      Made      Sent


┌─────────────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                                 │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Rate Limiting
├── 100 requests per 15 minutes
└── Prevents brute force attacks

Layer 2: Input Validation
├── Express-validator on all endpoints
├── Coupon format: max 10 chars, ends with @wg
└── Email validation, SQL injection prevention

Layer 3: Authentication
├── JWT tokens for admin access
├── 24-hour token expiration
└── Secure password hashing (bcrypt)

Layer 4: Database Security
├── Parameterized queries
├── Connection pooling
└── Regular backups recommended

Layer 5: Spam Prevention
├── 24-hour cooldown between submissions
├── IP tracking in logs
└── Duplicate detection


┌─────────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT CHECKLIST                            │
└─────────────────────────────────────────────────────────────────┘

□ Install Node.js and MySQL
□ Clone repository
□ Run npm install
□ Create database
□ Import schema.sql
□ Copy .env.example to .env
□ Update .env with production values
□ Change default admin password
□ Test API endpoints
□ Test affiliate dashboard
□ Test admin dashboard
□ Test contact form integration
□ Setup SSL certificate
□ Configure firewall
□ Setup automated backups
□ Configure monitoring
□ Test email notifications (if added)
□ Launch! 🚀


┌─────────────────────────────────────────────────────────────────┐
│                  EXAMPLE SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: Sarah (Instagram Influencer)
├── Followers: 50K
├── Coupon: SARAH@wg
├── Posts story about WebGemini
├── 100 people click link
├── 20 people submit form with her code
├── 5 people convert to customers
│   ├── 2 × Starter (R150 each) = R300
│   ├── 2 × Professional (R625 each) = R1,250
│   └── 1 × Enterprise (R1,000) = R1,000
├── Total earned: R2,550
└── Paid monthly via bank transfer

Scenario 2: John (YouTube Creator)
├── Subscribers: 10K
├── Coupon: JOHN@wg
├── Mentions WebGemini in video description
├── 50 people visit website
├── 10 people submit form
├── 3 people convert
│   └── All Professional plan
├── Commission: 3 × R625 = R1,875
└── Sees real-time updates in dashboard

Scenario 3: You (Admin)
├── 10 active affiliates
├── 100 referrals this month
├── 25 converted to customers
├── Total revenue: R75,000
├── Total commission: R15,000 (20%)
├── Net revenue: R60,000
└── Process payments end of month


┌─────────────────────────────────────────────────────────────────┐
│                  TECH STACK                                      │
└─────────────────────────────────────────────────────────────────┘

Backend:
├── Node.js (Runtime)
├── Express.js (Web Framework)
├── MySQL (Database)
├── JWT (Authentication)
├── Bcrypt (Password Hashing)
└── Express-validator (Input Validation)

Frontend:
├── HTML5
├── Tailwind CSS (Styling)
├── Vanilla JavaScript (No frameworks!)
├── Chart.js (Graphs)
└── Font Awesome (Icons)

Security:
├── Helmet (HTTP headers)
├── CORS (Cross-origin protection)
├── Rate Limit (Anti-spam)
└── Parameterized queries (SQL injection prevention)


┌─────────────────────────────────────────────────────────────────┐
│                  SUCCESS METRICS                                 │
└─────────────────────────────────────────────────────────────────┘

Track These KPIs:

Affiliates:
├── Total active affiliates
├── New affiliates per month
├── Churn rate
└── Average performance per affiliate

Referrals:
├── Total referrals
├── Conversion rate (referral → customer)
├── Average time to conversion
└── Top performing affiliates

Financial:
├── Total commission paid
├── ROI (revenue vs commission)
├── Average commission per referral
└── Monthly commission trends

Quality:
├── Customer satisfaction from referrals
├── Project completion rate
├── Repeat customers from referrals
└── Average project value
```

---

## 📊 Dashboard Screenshots (What You'll See)

### Affiliate Dashboard:
```
┌──────────────────────────────────────────────────┐
│  WEBGEMINI AFFILIATE          Sarah | Logout     │
├──────────────────────────────────────────────────┤
│                                                   │
│  [15]              [R1,250]         [R3,750]     │
│  Total Referrals   Pending          Total Earned │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Your Coupon: SARAH@wg    [Copy Code]     │  │
│  │  Starter: 10% | Pro & Enterprise: 25%     │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  Monthly Performance Chart                       │
│  [Line graph showing referrals & commission]     │
│                                                   │
│  Recent Referrals:                               │
│  • Jane Doe | Professional | R625 | Pending      │
│  • John Smith | Starter | R150 | Converted       │
│  • Mary Johnson | Enterprise | R1,000 | Pending  │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Admin Dashboard:
```
┌──────────────────────────────────────────────────┐
│  WEBGEMINI ADMIN          admin | Logout         │
├──────────────────────────────────────────────────┤
│  Overview | Affiliates | Referrals | Payments    │
├──────────────────────────────────────────────────┤
│                                                   │
│  [25]            [100]           [25]    [R15K]  │
│  Affiliates      Referrals       Converts Total  │
│                                                   │
│  Top Performers:                                 │
│  1. Sarah (@sarahcreates) - R3,750 | 15 refs    │
│  2. John (@johnblog) - R2,500 | 10 refs         │
│  3. Mike (@miketok) - R1,875 | 8 refs           │
│                                                   │
│  Recent Referrals:                               │
│  • Customer: Jane | Affiliate: Sarah             │
│    Plan: Professional | R625                     │
│    [Contacted] [Converted] [Lost]                │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

**This visual guide should help you understand how everything connects!**
