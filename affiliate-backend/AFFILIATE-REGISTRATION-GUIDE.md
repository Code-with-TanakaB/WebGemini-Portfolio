# Affiliate Registration Guide

## Overview
Affiliates can now self-register through the login page without admin intervention. Coupon codes are automatically generated based on the affiliate's username.

## Features Implemented

### 1. Self-Registration for Affiliates ✅
- **New Registration Form**: Accessible from login page
- **No Admin Required**: Affiliates can register independently
- **Validation**: All inputs validated for security
- **Automatic Approval**: Accounts are active immediately after registration

### 2. Auto-Generated Coupon Codes ✅
- **Format**: `USERNAME@WG` (maximum 10 characters)
- **Character Limit**: Up to 7 characters from username + `@WG` (3 chars)
- **Collision Handling**: Automatic numbering if code exists
- **Case**: Always uppercase

#### Coupon Code Generation Examples:

| Username | Full Name | Generated Coupon Code | Notes |
|----------|-----------|----------------------|-------|
| `johnsmith` | John Smith | `JOHNSMI@WG` | 7 chars from username + @WG |
| `jane` | Jane Doe | `JANE@WG` | Short username, 4 chars + @WG |
| `michaeljordan` | Michael Jordan | `MICHAEL@WG` | Truncated to 7 chars + @WG |
| `johnsmith2` | John Smith Jr | `JOHNSM1@WG` | Collision detected, added "1" |
| `bob` | Bob Wilson | `BOB@WG` | Very short, only 3 chars + @WG |

### 3. Security Features Hidden ✅
- **No Default Credentials Shown**: Admin login details no longer displayed
- **Security Indicators**: Shows active security features instead
- **Production Ready**: Safe for public deployment

## How to Register as an Affiliate

### For New Affiliates:

1. **Visit Login Page**
   - Navigate to: `https://your-domain/login.html`

2. **Click "Register here"**
   - Link appears below the login form
   - Switches to registration form

3. **Fill in Details**
   - Full Name (required)
   - Username (required) - will be used in your coupon code
   - Email (required)
   - Password (minimum 8 characters)
   - Confirm Password

4. **Submit Registration**
   - Coupon code is auto-generated
   - Account created immediately
   - Redirected to login page

5. **Login**
   - Use your username and password
   - Access your affiliate dashboard

### For Admins Adding Affiliates:

1. **Login to Admin Dashboard**
   - Use admin credentials

2. **Click "Add New Affiliate"**
   - Opens affiliate creation modal

3. **Enter Details**
   - Full Name
   - Username (coupon code auto-generates as you type)
   - Email
   - Password (min 8 characters)

4. **Review Auto-Generated Coupon Code**
   - Format: `USERNAME@WG`
   - Read-only field
   - Updates automatically

5. **Submit**
   - Affiliate created
   - Can login immediately

## Registration Validation Rules

### Username:
- **Minimum**: 3 characters
- **Maximum**: 50 characters
- **Used For**: Generating coupon code
- **Sanitization**: Special characters removed for coupon code

### Email:
- **Format**: Must be valid email (RFC compliant)
- **Unique**: Cannot use existing email
- **Normalized**: Lowercase, trimmed

### Password:
- **Minimum**: 8 characters (increased from 6)
- **Hashing**: Bcrypt with 10 rounds
- **Confirm**: Must match confirmation field

### Full Name:
- **Minimum**: 2 characters
- **Maximum**: 100 characters
- **Display**: Used in dashboard welcome message

## Coupon Code Generation Logic

```javascript
// Pseudocode
username = "johnsmith"
nameBase = username.toUpperCase().replace(/[^A-Z0-9]/g, "")
// nameBase = "JOHNSMITH"

couponPrefix = nameBase.substring(0, 7)
// couponPrefix = "JOHNSMI"

couponCode = couponPrefix + "@WG"
// couponCode = "JOHNSMI@WG"

// If collision detected:
// JOHNSMI@WG exists → try JOHNSM1@WG
// JOHNSM1@WG exists → try JOHNSM2@WG
// etc.
```

## Testing Results

### ✅ Test 1: Standard Username
```bash
Input: username="johnsmith"
Output: "JOHNSMI@WG"
Status: ✅ Success
```

### ✅ Test 2: Short Username
```bash
Input: username="jane"
Output: "JANE@WG"
Status: ✅ Success
```

### ✅ Test 3: Collision Handling
```bash
Input: username="johnsmith2"
Existing: "JOHNSMI@WG"
Output: "JOHNSM1@WG"
Status: ✅ Success (collision avoided)
```

### ✅ Test 4: Login with New Affiliate
```bash
Input: username="johnsmith", password="password123"
Output: Token generated, coupon_code="JOHNSMI@WG"
Status: ✅ Success
```

## API Endpoints

### Self-Registration (Public)
```
POST /api/auth/register-affiliate
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "username": "johnsmith",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Affiliate account created successfully! You can now login.",
  "coupon_code": "JOHNSMI@WG",
  "affiliate_id": 4
}
```

**Response (Error - Duplicate):**
```json
{
  "success": false,
  "message": "Username or email already exists."
}
```

### Admin Registration (Admin Only)
```
POST /api/auth/register
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "username": "johnsmith",
  "email": "john@example.com",
  "password": "password123",
  "coupon_code": "JOHNSMI@WG"
}
```

## Database Schema

Affiliates table stores all data:

```sql
CREATE TABLE affiliates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  full_name TEXT NOT NULL,
  coupon_code TEXT UNIQUE NOT NULL,  -- Auto-generated: USERNAME@WG
  role TEXT DEFAULT 'affiliate',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## UI Changes

### Login Page:
- ✅ Registration link added below login form
- ✅ Toggle between login and registration views
- ✅ Default admin credentials removed
- ✅ Success/error messaging

### Registration Form:
- ✅ Full name field
- ✅ Username field (with hint about coupon code)
- ✅ Email field
- ✅ Password field (8+ characters required)
- ✅ Confirm password field
- ✅ Back to login link

### Admin Dashboard:
- ✅ Coupon code field now read-only
- ✅ Auto-generates as admin types username
- ✅ Format hint displayed
- ✅ Validation for 8+ character password

## Security Notes

### Rate Limiting:
- **Registration**: 10 attempts per 15 minutes per IP
- **Login**: 10 attempts per 15 minutes per IP
- **Protection**: Prevents brute force attacks

### Input Validation:
- ✅ All fields validated server-side
- ✅ XSS protection (HTML tags stripped)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Email format validation
- ✅ Password strength enforcement

### Password Security:
- ✅ Bcrypt hashing (10 rounds)
- ✅ Minimum 8 characters
- ✅ Never stored in plain text
- ✅ Secure comparison

## Troubleshooting

### Issue: "Username or email already exists"
**Solution**: Choose a different username or email

### Issue: "Password must be at least 8 characters"
**Solution**: Use a longer password

### Issue: "Passwords do not match"
**Solution**: Ensure both password fields have the same value

### Issue: Coupon code looks wrong
**Note**: Coupon codes are auto-generated from username
- Only alphanumeric characters used
- Special characters removed automatically
- Maximum 10 characters total (7 from name + @WG)

## Best Practices

### For Affiliates:
1. Choose a memorable username (appears in your coupon code)
2. Use a strong password (8+ characters, mix of letters/numbers)
3. Keep your credentials secure
4. Verify your coupon code after registration

### For Admins:
1. Review new affiliate registrations regularly
2. Monitor for duplicate or suspicious accounts
3. Deactivate unused accounts
4. Keep admin credentials extremely secure

## Examples in Production

### Successful Registration Flow:
```
1. User visits login.html
2. Clicks "Register here"
3. Fills form:
   - Full Name: "Sarah Johnson"
   - Username: "sarahj"
   - Email: "sarah@example.com"
   - Password: "SecurePass123"
   - Confirm: "SecurePass123"
4. Submits form
5. Server generates: "SARAHJ@WG"
6. Account created (ID: 7)
7. Success message shows coupon code
8. Redirects to login after 3 seconds
9. User logs in with sarahj/SecurePass123
10. Accesses affiliate dashboard
```

## Migration from Old System

If you had affiliates with old coupon code format:
- **Old format**: `INFLUENCER2024`, `PROMO50`, etc.
- **New format**: `USERNAME@WG`
- **Existing**: Old codes still work
- **New affiliates**: Auto-generated format only

## Future Enhancements (Optional)

- [ ] Email verification before account activation
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Custom coupon code requests
- [ ] Social media registration (OAuth)

## Support

For issues with registration:
1. Check validation error messages
2. Ensure all fields meet requirements
3. Try different username if collision occurs
4. Contact admin if problems persist

---

**Last Updated**: October 23, 2025
**Status**: ✅ Production Ready
