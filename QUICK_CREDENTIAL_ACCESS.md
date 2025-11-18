# Quick Answer: How to View Affiliate Credentials as Admin

## TL;DR - 3 Simple Steps

### 1️⃣ Open Admin Dashboard
Navigate to `/admin-dashboard.html` and login

### 2️⃣ View Credentials
1. Click **"Affiliates"** in sidebar
2. Find the affiliate
3. Click the **blue key icon** (🔑)

### 3️⃣ Reset Password (If Needed)
1. In the credentials modal
2. Click **"Generate Random Password"**
3. Click **"Reset Password"**
4. Copy and share securely

---

## What You Can See

✅ **Full Name** - Affiliate's name  
✅ **Username** - For login (click to copy)  
✅ **Email** - Contact email (click to copy)  
✅ **Coupon Code** - Referral code  
✅ **Status** - Account status  
❌ **Password** - Cannot be viewed (security), only reset

---

## Why Can't I See Passwords?

**Security:** Passwords are hashed using bcrypt encryption. Even admins cannot view them. This is industry best practice and protects your affiliates.

**Solution:** Use the password reset feature to generate a new temporary password for troubleshooting.

---

## Quick Password Reset

```
1. Click key icon (🔑) on affiliate
2. Click "Generate Random Password" 
3. Click "Reset Password"
4. Credentials auto-copied to clipboard
5. Share securely with affiliate
```

Generated passwords are:
- 12 characters long
- Include uppercase, lowercase, numbers, special chars
- Automatically strong and secure

---

## Security Reminders

- ⚠️ Always verify affiliate identity before resetting
- 🔒 Share credentials via encrypted channels only
- 📝 Advise affiliate to change password after login
- 🚫 Never share passwords in plain email or SMS

---

## Example Workflow

**Affiliate calls:** "I forgot my password"

**Your response:**
1. "Let me verify your account. What's your email?"
2. *(Verify in system)*
3. "I'm resetting your password now"
4. *(Click key icon → Generate → Reset)*
5. "I'll send your username and temporary password separately via Signal"
6. "Please login and change your password immediately"

---

## Files Created/Modified

### New Files:
- `ADMIN_CREDENTIAL_VIEWING_GUIDE.md` - Complete guide

### Modified Files:
- `affiliate-backend/routes/affiliates.js` - Added API endpoints
- `admin-dashboard.html` - Added credentials modal
- `admin-dashboard.js` - Added credential viewing functions
- `dashboard-style.css` - Added styling

### New API Endpoints:
- `GET /api/affiliates/admin/credentials/:id` - View credentials
- `POST /api/affiliates/admin/reset-password/:id` - Reset password

---

## Need More Help?

📖 **Full Guide:** `ADMIN_CREDENTIAL_VIEWING_GUIDE.md`  
🔧 **Security Guide:** `affiliate-backend/SECURITY.md`  
🏗️ **System Architecture:** `SYSTEM_ARCHITECTURE.md`

---

**Quick Tip:** Click the copy icon (📋) or click directly on username/email to copy to clipboard!
