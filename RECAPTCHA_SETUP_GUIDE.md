# reCAPTCHA Setup Guide

## What Was Added

### 1. ✅ "Earn" Link in Navbar
Added an affiliate program link in the main navigation for desktop devices:
- **Location:** `index.html` navbar (desktop only)
- **Link Text:** "Earn" with dollar sign icon
- **Destination:** `affiliate-access.html` (affiliate program portal)

### 2. ✅ reCAPTCHA Protection
Added Google reCAPTCHA v2 to prevent spam, bots, and cross-site scripting attacks:

**Frontend (Client-side):**
- `client-signup.html` - Client registration form
- `login.html` - Affiliate registration form

**Backend (Server-side):**
- `middleware/recaptcha.js` - Verification middleware
- `routes/auth.js` - Affiliate registration endpoint
- `routes/affiliates.js` - Client signup endpoint

## How to Set Up reCAPTCHA

### Step 1: Get reCAPTCHA Keys from Google

1. Go to https://www.google.com/recaptcha/admin
2. Click **"+ Add"** or **"Create"**
3. Fill in the registration form:

   ```
   Label: WebGemini Portfolio
   reCAPTCHA type: ✓ reCAPTCHA v2
                   ✓ "I'm not a robot" Checkbox
   
   Domains: 
   - localhost (for testing)
   - your-domain.com (your production domain)
   - webgemini-portfolio.onrender.com (if using Render)
   
   Accept reCAPTCHA Terms of Service: ✓
   ```

4. Click **Submit**
5. You'll receive two keys:
   - **Site Key** (public) - Used in frontend HTML
   - **Secret Key** (private) - Used in backend verification

### Step 2: Add Site Key to Frontend

**Files to Update:**
1. `client-signup.html`
2. `login.html`

**Find this line in each file:**
```html
<div class="g-recaptcha" data-sitekey="6LfYourSiteKeyHere"></div>
```

**Replace with your actual Site Key:**
```html
<div class="g-recaptcha" data-sitekey="6LdRcOYpAAAAAJ...your_actual_site_key"></div>
```

### Step 3: Add Secret Key to Backend

**Option A: Local Development**

Edit `affiliate-backend/.env`:
```bash
RECAPTCHA_SECRET_KEY=6LdRcOYpAAAAAH...your_actual_secret_key
```

**Option B: Render Production**

1. Go to Render Dashboard
2. Select your service: `webgemini-affiliate-backend`
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   ```
   Key: RECAPTCHA_SECRET_KEY
   Value: 6LdRcOYpAAAAAH...your_actual_secret_key
   ```
6. Click **"Save Changes"**
7. Service will redeploy automatically

### Step 4: Test the Implementation

#### Test Frontend:
1. Open client signup: `https://your-domain.com/client-signup.html`
2. Fill out the form
3. **Without checking reCAPTCHA** → Click submit
   - ✅ Should show: "Please complete the reCAPTCHA verification"
4. **Check the "I'm not a robot" box**
5. Submit form
   - ✅ Should proceed normally if valid

#### Test Backend:
1. Open browser console (F12)
2. Try submitting without reCAPTCHA token
3. Check Network tab:
   - ✅ Should return 400 error: "reCAPTCHA verification required"

#### Test Affiliate Registration:
1. Go to `login.html`
2. Click "Register here"
3. Fill out form
4. Complete reCAPTCHA
5. Submit
   - ✅ Should register successfully

## How It Works

### Frontend Flow:
```
1. User fills form
2. User checks "I'm not a robot"
3. Google reCAPTCHA validates user
4. Frontend gets temporary token
5. Token sent to backend with form data
```

### Backend Flow:
```
1. Receive form data + reCAPTCHA token
2. Middleware: verifyRecaptcha()
3. Send token to Google API
4. Google verifies: Is this user legitimate?
5. If yes → Process signup
   If no → Reject with error
```

## Security Benefits

### ✅ Prevents:
- **Bot submissions** - Automated spam
- **Brute force attacks** - Repeated fake registrations
- **Cross-site scripting (XSS)** - Malicious code injection
- **Spam signups** - Fake accounts
- **DDoS attempts** - Mass registration attacks

### ✅ Protects:
- Client signup form
- Affiliate registration
- Database integrity
- Server resources
- Email list quality

## Development vs Production

### Development Mode (No Secret Key Set):
```javascript
// In middleware/recaptcha.js
if (!process.env.RECAPTCHA_SECRET_KEY) {
  console.warn('⚠️ RECAPTCHA_SECRET_KEY not set - skipping verification');
  return next(); // Allow request
}
```
- **Behavior:** Logs warning, allows all requests
- **Purpose:** Easy local testing without reCAPTCHA setup

### Production Mode (Secret Key Set):
```javascript
// Strict verification
if (!recaptchaToken) {
  return res.status(400).json({
    success: false,
    message: 'reCAPTCHA verification required'
  });
}
```
- **Behavior:** Blocks requests without valid reCAPTCHA
- **Purpose:** Full protection against bots and spam

## Troubleshooting

### Issue: "reCAPTCHA not working on localhost"

**Solution:** Add `localhost` to allowed domains:
1. Go to Google reCAPTCHA Admin Console
2. Click on your site
3. Settings → Domains
4. Add: `localhost`
5. Save

### Issue: "ERROR for site owner: Invalid domain"

**Solution:** The domain you're testing on isn't registered
- Add your domain to reCAPTCHA settings
- For Codespaces: Add `*.github.dev`
- For Render: Add `*.onrender.com` OR your specific subdomain

### Issue: "reCAPTCHA keeps resetting"

This is normal and expected:
- Resets after successful submission
- Resets after form validation error
- Resets after network error

**Code handles this automatically:**
```javascript
grecaptcha.reset(); // Called on success and errors
```

### Issue: "Backend says verification failed"

**Check:**
1. ✅ RECAPTCHA_SECRET_KEY set correctly?
2. ✅ Using matching Site Key and Secret Key pair?
3. ✅ Domain matches what's registered?
4. ✅ Token sent from frontend?

**Debug:**
```bash
# Check backend logs
# Should see:
✅ reCAPTCHA verified successfully

# Or error:
❌ reCAPTCHA verification failed: [error-codes]
```

## Testing Checklist

After setup, verify:

- [ ] reCAPTCHA appears on client signup form
- [ ] reCAPTCHA appears on affiliate registration form
- [ ] Form can't be submitted without checking reCAPTCHA
- [ ] Form submits successfully after checking reCAPTCHA
- [ ] Backend logs show verification success
- [ ] Bot submissions are blocked
- [ ] Legitimate users can register normally

## Files Modified

### Frontend:
1. **`index.html`**
   - Added "Earn" link to desktop navbar

2. **`client-signup.html`**
   - Added reCAPTCHA script tag
   - Added reCAPTCHA widget
   - Updated submit handler to verify token
   - Resets reCAPTCHA on error/success

3. **`login.html`**
   - Added reCAPTCHA script tag
   - Added reCAPTCHA widget to registration form
   - Updated submit handler to verify token
   - Resets reCAPTCHA on error/success

### Backend:
4. **`affiliate-backend/middleware/recaptcha.js`** ✨ NEW
   - reCAPTCHA verification middleware
   - Calls Google API
   - Validates tokens
   - Handles dev/prod modes

5. **`affiliate-backend/routes/auth.js`**
   - Imported reCAPTCHA middleware
   - Added to `/register-affiliate` endpoint

6. **`affiliate-backend/routes/affiliates.js`**
   - Imported reCAPTCHA middleware
   - Added to `/track-signup` endpoint

7. **`affiliate-backend/.env`**
   - Added RECAPTCHA_SECRET_KEY placeholder
   - Added setup instructions

## Next Steps

1. **Get reCAPTCHA Keys:**
   - Visit: https://www.google.com/recaptcha/admin
   - Register your site
   - Get Site Key and Secret Key

2. **Update Frontend:**
   - Replace `6LfYourSiteKeyHere` with actual Site Key
   - In both `client-signup.html` and `login.html`

3. **Update Backend:**
   - Add Secret Key to `.env` file locally
   - Add Secret Key to Render environment variables

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add reCAPTCHA protection and Earn link to navbar"
   git push origin main
   ```

5. **Test:**
   - Try registering without reCAPTCHA → Should fail
   - Complete reCAPTCHA and register → Should work
   - Check backend logs for verification messages

## Support

### Google reCAPTCHA Help:
- Documentation: https://developers.google.com/recaptcha/docs/display
- Admin Console: https://www.google.com/recaptcha/admin
- Support: https://support.google.com/recaptcha/

### Implementation Reference:
- Middleware: `affiliate-backend/middleware/recaptcha.js`
- Frontend example: `client-signup.html` (lines with `grecaptcha`)
- Backend example: `routes/auth.js` (verifyRecaptcha middleware)

---

**Summary:** reCAPTCHA is now fully integrated into both client and affiliate signup forms, with automatic server-side verification to prevent spam and abuse. Just add your keys and you're protected! 🔒
