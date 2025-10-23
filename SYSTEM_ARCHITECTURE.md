# WebGemini Affiliate System - Visual Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WEBGEMINI AFFILIATE SYSTEM                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐     │
│  │   Login Page    │  │  Admin Dashboard │  │ Affiliate Dashboard│     │
│  │  (Public)       │  │  (Admin Only)    │  │  (Affiliate Only)  │     │
│  │                 │  │                  │  │                    │     │
│  │ • Username      │  │ • View Stats     │  │ • View Referrals  │     │
│  │ • Password      │  │ • All Affiliates │  │ • View Earnings   │     │
│  │ • Role-based    │  │ • All Clients    │  │ • Share Coupon    │     │
│  │   Redirect      │  │ • Commissions    │  │ • Social Share    │     │
│  └────────┬────────┘  └────────┬─────────┘  └─────────┬──────────┘     │
│           │                    │                       │                 │
│           │                    │                       │                 │
│  ┌────────┴────────────────────┴───────────────────────┴──────────┐     │
│  │                    Client Signup Form                           │     │
│  │                        (Public)                                 │     │
│  │                                                                 │     │
│  │  • Name, Email, Phone                                          │     │
│  │  • Plan Selection (Starter/Premium/Enterprise)                 │     │
│  │  • Coupon Code Input with Verification                         │     │
│  │  • Real-time Validation                                        │     │
│  └────────────────────────────┬────────────────────────────────────┘     │
│                               │                                          │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    HTTPS/JSON API     │
                    │    (Port 3001)        │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────────┐
│                          BACKEND LAYER                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   Express.js Server (Node.js)                     │   │
│  │                                                                   │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │   │
│  │  │ Auth Middleware│  │  CORS Middleware│  │  JSON Parser     │  │   │
│  │  │                │  │                 │  │                  │  │   │
│  │  │ • JWT Verify   │  │ • Allow Origins │  │ • Body Parser    │  │   │
│  │  │ • Role Check   │  │ • Headers       │  │ • URL Encoded    │  │   │
│  │  └────────┬───────┘  └────────┬────────┘  └────────┬─────────┘  │   │
│  │           │                   │                     │             │   │
│  │           └───────────────────┴─────────────────────┘             │   │
│  │                              │                                    │   │
│  │  ┌───────────────────────────▼────────────────────────────────┐  │   │
│  │  │                     API ROUTES                              │  │   │
│  │  │                                                             │  │   │
│  │  │  ┌──────────────────┐         ┌──────────────────────┐    │  │   │
│  │  │  │  /api/auth       │         │  /api/affiliates     │    │  │   │
│  │  │  │                  │         │                      │    │  │   │
│  │  │  │ • POST /login    │         │ • POST /track-signup │    │  │   │
│  │  │  │ • POST /register │         │ • POST /verify-coupon│    │  │   │
│  │  │  │ • GET /verify    │         │ • GET /stats        │    │  │   │
│  │  │  │ • GET /profile   │         │ • GET /referrals    │    │  │   │
│  │  │  │                  │         │ • GET /admin/stats  │    │  │   │
│  │  │  │                  │         │ • GET /admin/clients│    │  │   │
│  │  │  │                  │         │ • GET /all          │    │  │   │
│  │  │  └──────────┬───────┘         └──────────┬───────────┘    │  │   │
│  │  │             │                            │                │  │   │
│  │  └─────────────┴────────────────────────────┴────────────────┘  │   │
│  │                              │                                   │   │
│  │  ┌───────────────────────────▼────────────────────────────────┐ │   │
│  │  │              Business Logic Layer                          │ │   │
│  │  │                                                            │ │   │
│  │  │  • Commission Calculator (10% starter, 25% high-tier)    │ │   │
│  │  │  • Coupon Code Validator                                 │ │   │
│  │  │  • JWT Token Generator                                   │ │   │
│  │  │  • Password Hash/Compare (bcrypt)                        │ │   │
│  │  │  • Role-based Access Control                             │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
└──────────────────────────────────┼───────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────┐
│                          DATABASE LAYER                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    SQLite Database (affiliate.db)                  │  │
│  │                                                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ affiliates   │  │   clients    │  │ commissions  │           │  │
│  │  │              │  │              │  │              │           │  │
│  │  │ • id         │  │ • id         │  │ • id         │           │  │
│  │  │ • username   │  │ • name       │  │ • affiliate_id│          │  │
│  │  │ • email      │  │ • email      │  │ • client_id  │           │  │
│  │  │ • password   │  │ • phone      │  │ • plan_type  │           │  │
│  │  │ • full_name  │  │ • plan_type  │  │ • plan_price │           │  │
│  │  │ • coupon_code│  │ • plan_price │  │ • commission%│           │  │
│  │  │ • role       │  │ • coupon_code│  │ • amount     │           │  │
│  │  │ • status     │  │ • affiliate_id│ │ • status     │           │  │
│  │  │ • created_at │  │ • signup_date│  │ • created_at │           │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │  │
│  │         │                 │                 │                    │  │
│  │         └─────────────────┴─────────────────┘                    │  │
│  │                           │                                      │  │
│  │  ┌────────────────────────▼────────────────────────┐            │  │
│  │  │            referrals (tracking table)           │            │  │
│  │  │                                                 │            │  │
│  │  │  • id                                           │            │  │
│  │  │  • affiliate_id                                 │            │  │
│  │  │  • client_id                                    │            │  │
│  │  │  • referral_date                                │            │  │
│  │  │  • conversion_date                              │            │  │
│  │  │  • status                                       │            │  │
│  │  └─────────────────────────────────────────────────┘            │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            DATA FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════

1. AFFILIATE REGISTRATION FLOW
   ────────────────────────────

   Influencer → Register Form → POST /api/auth/register
                                        │
                                        ▼
                                Hash Password (bcrypt)
                                        │
                                        ▼
                                Create Affiliate Record
                                        │
                                        ▼
                                Assign Coupon Code
                                        │
                                        ▼
                                Return Success
                                        │
                                        ▼
                                Influencer Can Login


2. CLIENT SIGNUP FLOW (WITH REFERRAL)
   ───────────────────────────────────

   Client → Signup Form → Enter Coupon Code
                                │
                                ▼
                         POST /api/affiliates/verify-coupon
                                │
                                ▼
                         Validate Coupon in DB
                                │
                    ┌───────────┴───────────┐
                    │                       │
                  Valid                 Invalid
                    │                       │
                    ▼                       ▼
            Show Affiliate Name     Show Error Message
                    │
                    ▼
           Complete Form → POST /api/affiliates/track-signup
                                │
                                ▼
                         Create Client Record
                                │
                                ▼
                    Calculate Commission (10% or 25%)
                                │
                                ▼
                      Create Commission Record
                                │
                                ▼
                       Update All Dashboards
                                │
                    ┌───────────┴───────────┐
                    │                       │
            Admin Dashboard          Affiliate Dashboard
              Shows New Client        Shows New Referral
              Shows Commission        Shows New Earnings


3. DASHBOARD DATA FLOW
   ───────────────────

   Admin Login → JWT Token → GET /api/affiliates/admin/stats
                                        │
                                        ▼
                              Query All Tables (JOIN)
                                        │
                                        ▼
                              Calculate Aggregates:
                              • Total Affiliates
                              • Total Clients
                              • Total Revenue
                              • Pending Commissions
                              • Paid Commissions
                                        │
                                        ▼
                              Return JSON Data
                                        │
                                        ▼
                              Render Dashboard UI


   Affiliate Login → JWT Token → GET /api/affiliates/stats
                                        │
                                        ▼
                              Query User's Data Only
                                        │
                                        ▼
                              Calculate Personal Stats:
                              • Total Referrals
                              • Pending Earnings
                              • Paid Earnings
                              • Total Earnings
                                        │
                                        ▼
                              Return JSON Data
                                        │
                                        ▼
                              Render Personal Dashboard


4. COMMISSION CALCULATION LOGIC
   ────────────────────────────

   Client Signup → Extract Plan Type → Check Plan Category
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        │                                           │
                  "starter", "basic"                    "premium", "pro", 
                        │                              "enterprise", "advanced"
                        ▼                                           ▼
                Commission Rate = 10%                  Commission Rate = 25%
                        │                                           │
                        └─────────────────────┬─────────────────────┘
                                              │
                                              ▼
                              Amount = Plan Price × Rate
                                              │
                                              ▼
                              Store in Commissions Table
                                              │
                                              ▼
                              Status = "pending"
                                              │
                                              ▼
                              Admin Can Mark as "paid"


═══════════════════════════════════════════════════════════════════════════
                         SECURITY ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

User Login → POST /api/auth/login → Validate Credentials
                                            │
                                            ▼
                                  Compare Hashed Password
                                            │
                                ┌───────────┴───────────┐
                                │                       │
                              Match                  No Match
                                │                       │
                                ▼                       ▼
                        Generate JWT Token       Return 401 Error
                        (expires in 24h)
                                │
                                ▼
                        Return Token to Client
                                │
                                ▼
                    Client Stores in localStorage
                                │
                                ▼
            All Future Requests Include:
            Header: Authorization: Bearer <token>
                                │
                                ▼
                        Middleware Validates Token
                                │
                    ┌───────────┴───────────┐
                    │                       │
                  Valid                  Invalid
                    │                       │
                    ▼                       ▼
            Decode User Info         Return 401 Error
            Attach to Request
                    │
                    ▼
            Check User Role
                    │
        ┌───────────┴───────────┐
        │                       │
      Admin                 Affiliate
        │                       │
        ▼                       ▼
    Full Access           Limited Access


═══════════════════════════════════════════════════════════════════════════
                         KEY FEATURES SUMMARY
═══════════════════════════════════════════════════════════════════════════

✅ Transparent Tracking - Unique coupon codes link clients to affiliates
✅ Automatic Commissions - 10% starter, 25% high-tier (auto-calculated)
✅ Real-time Dashboards - Live updates for admin and affiliates
✅ Secure Authentication - JWT tokens, bcrypt passwords, role-based access
✅ Complete API - RESTful endpoints for all operations
✅ Modern UI - Responsive, dark theme, professional design
✅ Easy Integration - Simple to add to existing websites
✅ Scalable Database - SQLite (can upgrade to PostgreSQL/MySQL)
✅ Comprehensive Tracking - See which influencer referred which client
✅ Social Sharing - Built-in tools for affiliates to share codes

