# Admin Guide: Viewing and Managing Affiliate Credentials

## Overview
As an administrator, you can view affiliate login information and reset passwords for remote troubleshooting purposes. This guide explains how to access and manage affiliate credentials securely.

---

## 🔐 Security Note
**Passwords are securely hashed and cannot be viewed.** You can only reset passwords to new values. Always handle credentials with care and follow security best practices.

---

## How to View Affiliate Credentials

### Step 1: Access the Admin Dashboard
1. Navigate to your admin dashboard: `https://yourdomain.com/admin-dashboard.html`
2. Login with your admin credentials:
   - **Username:** `its.admin01`
   - **Password:** `#01Admin@WG2024`

### Step 2: Navigate to Affiliates Section
1. Click on **"Affiliates"** in the left sidebar
2. You'll see a table with all registered affiliates

### Step 3: View Credentials
1. Find the affiliate you want to help
2. Click the **blue key icon** (🔑) in the Actions column
3. A modal will open showing:
   - ✅ **Full Name**
   - ✅ **Username** (click to copy)
   - ✅ **Email** (click to copy)
   - ✅ **Coupon Code**
   - ✅ **Account Status**

---

## 🔄 How to Reset an Affiliate's Password

When troubleshooting remote access issues, you can generate a temporary password:

### Method 1: Generate Random Password (Recommended)
1. Open the affiliate's credentials modal (key icon)
2. Scroll to the **"Password Reset"** section
3. Click **"Generate Random Password"**
   - This creates a secure 12-character password
   - Password includes uppercase, lowercase, numbers, and special characters
4. Click **"Reset Password"**
5. Confirm the action
6. The system will:
   - ✅ Update the password in the database
   - ✅ Show success message with username and new password
   - ✅ Automatically copy credentials to your clipboard

### Method 2: Set Custom Password
1. Open the affiliate's credentials modal
2. Type your custom password in the **"New Password"** field
   - Minimum 8 characters required
   - Use strong passwords (mix of letters, numbers, symbols)
3. Click **"Reset Password"**
4. Confirm the action
5. Copy the credentials displayed

---

## 📋 What Information You Can See

| Information | Visible | Notes |
|------------|---------|-------|
| Full Name | ✅ Yes | Affiliate's full name |
| Username | ✅ Yes | Used for login - Click to copy |
| Email | ✅ Yes | Contact email - Click to copy |
| Coupon Code | ✅ Yes | Affiliate's referral code |
| Status | ✅ Yes | Active, Archived, etc. |
| **Password** | ❌ No | Securely hashed - Can only reset |
| Created Date | ✅ Yes | Account creation date |

---

## 🎯 Common Troubleshooting Scenarios

### Scenario 1: Affiliate Forgot Password
**Problem:** Affiliate cannot log in

**Solution:**
1. View their credentials to confirm username
2. Generate a new temporary password
3. Share credentials securely (see Security Best Practices)
4. Advise affiliate to change password after login

### Scenario 2: Affiliate Cannot Access Dashboard
**Problem:** Access issues despite correct credentials

**Steps to diagnose:**
1. Check account **Status** - Should be "active"
2. Verify **Username** is correct (case-sensitive)
3. Reset password to rule out password issues
4. Check if affiliate is using correct login page:
   - Affiliate Login: `/affiliate-dashboard.html`
   - Admin Login: `/admin-dashboard.html`

### Scenario 3: Multiple Failed Login Attempts
**Problem:** Affiliate locked out or confused

**Solution:**
1. View credentials to verify correct username
2. Check email is valid for password recovery
3. Reset password to known value
4. Test login yourself to confirm access works
5. Walk affiliate through login process

---

## 🔒 Security Best Practices

### When Sharing Reset Credentials:

#### ✅ DO:
- Use encrypted communication (Signal, encrypted email)
- Share username and password in separate messages
- Instruct affiliate to change password immediately
- Set a strong temporary password
- Keep a log of password resets (for security auditing)
- Verify identity before resetting passwords

#### ❌ DON'T:
- Share passwords via plain email or SMS
- Use simple/predictable passwords
- Reuse passwords across affiliates
- Share credentials in public channels
- Leave credentials in chat history

### Recommended Communication Method:
```
Message 1: "I've reset your account. Username will be sent separately."
Message 2: "Your username is: [username]"
Message 3: "Your temporary password is: [password]"
Message 4: "Please login immediately and change your password under Settings."
```

---

## 🛠️ Technical Details

### API Endpoints Used

#### Get Affiliate Credentials
```
GET /api/affiliates/admin/credentials/:affiliateId
Authorization: Bearer [admin-token]
```

**Response:**
```json
{
  "success": true,
  "credentials": {
    "id": 1,
    "username": "john_smith",
    "email": "john@example.com",
    "full_name": "John Smith",
    "coupon_code": "JOHNSMI@WG",
    "status": "active"
  }
}
```

#### Reset Password
```
POST /api/affiliates/admin/reset-password/:affiliateId
Authorization: Bearer [admin-token]
Content-Type: application/json

{
  "newPassword": "NewSecure123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "affiliate": {
    "username": "john_smith",
    "email": "john@example.com"
  }
}
```

### Password Requirements
- Minimum length: **8 characters**
- Recommended: **12+ characters**
- Include: Uppercase, lowercase, numbers, special characters
- Passwords are hashed using **bcrypt** (10 rounds)

---

## 📱 Quick Reference Card

### View Credentials (3 Steps)
1. **Click** Affiliates section
2. **Find** affiliate in table
3. **Click** blue key icon (🔑)

### Reset Password (4 Steps)
1. **Open** credentials modal
2. **Click** "Generate Random Password"
3. **Click** "Reset Password"
4. **Copy** and share securely

### Copy to Clipboard
- Click on **username** or **email** directly
- Or click the **copy icon** (📋) next to them
- Credentials auto-copy after reset

---

## 🚨 Emergency Access

If you need to reset your own admin password:

### Using Node.js Script:
```bash
cd affiliate-backend
node reset-admin-password.js
```

### Using Direct Database Access:
Only if backend is unavailable - requires database credentials.

---

## 📞 Support Resources

### For Affiliates:
- Affiliate Dashboard: `/affiliate-dashboard.html`
- Affiliate Guide: `AFFILIATE_SYSTEM_README.md`
- Registration: `/affiliate-access.html`

### For Admins:
- Admin Dashboard: `/admin-dashboard.html`
- System Architecture: `SYSTEM_ARCHITECTURE.md`
- Security Guide: `affiliate-backend/SECURITY.md`

---

## 🔄 Version History

**Version 1.0** - November 18, 2025
- Initial credential viewing system
- Password reset functionality
- Copy-to-clipboard features
- Random password generator

---

## ⚠️ Important Reminders

1. **Passwords cannot be viewed** - Only reset
2. **Always verify identity** before resetting
3. **Use strong passwords** for resets
4. **Share credentials securely** via encrypted channels
5. **Advise password changes** after remote troubleshooting
6. **Document all password resets** for security audits
7. **Keep admin credentials safe** - You have full system access

---

## 📊 Credential Management Workflow

```
Affiliate Has Login Issue
         ↓
Admin Views Credentials
         ↓
Verify Username/Email
         ↓
Generate New Password
         ↓
Reset in System
         ↓
Share Securely
         ↓
Affiliate Logs In
         ↓
Affiliate Changes Password
         ↓
Issue Resolved ✅
```

---

**Last Updated:** November 18, 2025  
**Admin Contact:** admin@webgemini.com  
**System Status:** Live on Render
