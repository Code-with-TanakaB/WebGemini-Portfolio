# Visual Guide: Admin Credential Viewing Feature

## 🖼️ What You'll See

### 1. Affiliates Table - New Key Button

```
┌─────────────────────────────────────────────────────────────────────┐
│  Affiliates                                                          │
├────┬─────────────┬────────────────┬───────────┬─────────────────────┤
│ ID │ Name        │ Email          │ Username  │ Actions             │
├────┼─────────────┼────────────────┼───────────┼─────────────────────┤
│ 1  │ John Smith  │ john@email.com │ john_smi  │ [🗄️] [🔑] [🗑️]     │
│ 2  │ Jane Doe    │ jane@email.com │ jane_doe  │ [🗄️] [🔑] [🗑️]     │
└────┴─────────────┴────────────────┴───────────┴─────────────────────┘
                                                    ↑
                                          NEW: Blue Key Icon
```

**Key Icon Colors:**
- 🗄️ Orange = Archive
- 🔑 Blue = View Credentials (NEW!)
- 🗑️ Red = Delete

---

### 2. Credentials Modal Window

When you click the key icon, this modal appears:

```
╔═══════════════════════════════════════════════════════════════╗
║  Affiliate Credentials                                    [×] ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Login Information                                       │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ Full Name:    John Smith                               │ ║
║  │ Username:     john_smith                          [📋]  │ ║
║  │ Email:        john@example.com                    [📋]  │ ║
║  │ Coupon Code:  JOHNSMI@WG                               │ ║
║  │ Status:       active                                    │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Password Reset                                          │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │ Passwords are securely hashed and cannot be viewed.    │ ║
║  │ Generate a new temporary password for troubleshooting. │ ║
║  │                                                         │ ║
║  │ New Password: [________________________]               │ ║
║  │                                                         │ ║
║  │              [🎲 Generate Random Password]              │ ║
║  │                                                         │ ║
║  │              [🔑 Reset Password]                        │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ ⚠️ Security Notice                                      │ ║
║  │ After resetting, share credentials securely.           │ ║
║  │ Advise affiliate to change password after login.       │ ║
║  └─────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### 3. After Clicking "Generate Random Password"

```
╔═══════════════════════════════════════════════════════════════╗
║  Affiliate Credentials                                    [×] ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Password Reset                                          │ ║
║  ├─────────────────────────────────────────────────────────┤ ║
║  │                                                         │ ║
║  │ New Password: [Xp4$mK9nQw2R]  ← Strong password!       │ ║
║  │                    ↑                                    │ ║
║  │              Auto-generated                             │ ║
║  │                                                         │ ║
║  │              [🎲 Generate Random Password]              │ ║
║  │                                                         │ ║
║  │              [🔑 Reset Password]  ← Click to confirm    │ ║
║  └─────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### 4. Success Confirmation

After clicking "Reset Password", you'll see:

```
┌─────────────────────────────────────────────────┐
│  ✅ Password reset successfully!                │
│                                                 │
│  Username: john_smith                           │
│  New Password: Xp4$mK9nQw2R                     │
│                                                 │
│  Please share these credentials securely        │
│  with the affiliate.                            │
│                                                 │
│  ✓ Credentials copied to clipboard!            │
│                                                 │
│                     [OK]                        │
└─────────────────────────────────────────────────┘
```

---

## 📱 Mobile View

The modal is responsive and works on all devices:

```
┌──────────────────────┐
│ Affiliate Credentials│
│                   [×]│
├──────────────────────┤
│ Login Information    │
│                      │
│ Full Name:           │
│ John Smith           │
│                      │
│ Username: [📋]       │
│ john_smith           │
│                      │
│ Email: [📋]          │
│ john@example.com     │
│                      │
│ Password Reset       │
│ ┌──────────────────┐ │
│ │ New Password     │ │
│ └──────────────────┘ │
│                      │
│ [Generate Random]    │
│ [Reset Password]     │
└──────────────────────┘
```

---

## 🎨 Color Coding

### Action Buttons:
- **🔵 Blue (View/Key)** - Information access, safe
- **🟠 Orange (Archive)** - Warning, reversible
- **🔴 Red (Delete)** - Danger, permanent
- **🟢 Green (Activate)** - Positive action
- **🟣 Purple (Generate)** - Utility function

### Status Badges:
- **🟢 Active** - Green background
- **🟠 Archived** - Orange background
- **🔴 Suspended** - Red background
- **⚪ Pending** - Gray background

---

## 💡 Interactive Features

### Click to Copy:
```
Username: john_smith  [📋]
           ↑           ↑
    Click text OR   Click icon
    Both copy to clipboard!
```

### Copy Confirmation:
When you click to copy, a floating notification appears:

```
        ┌───────────┐
        │ Copied! ✓ │
        └───────────┘
```

---

## 🔄 Complete User Flow

```
Step 1: Admin Dashboard
   ↓
Step 2: Click "Affiliates" in sidebar
   ↓
Step 3: Find affiliate in table
   ↓
Step 4: Click blue key icon (🔑)
   ↓
Step 5: Modal opens with credentials
   ↓
Step 6: (Optional) Click "Generate Random Password"
   ↓
Step 7: Click "Reset Password"
   ↓
Step 8: Confirm action
   ↓
Step 9: Success! Credentials copied
   ↓
Step 10: Share securely with affiliate
```

---

## 📊 Dashboard Location

```
┌─────────────────────────────────────────────────────────┐
│ [☰]  WebGemini Admin Dashboard                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sidebar              Main Content                      │
│  ┌──────────┐        ┌─────────────────────────────┐   │
│  │Overview  │        │                             │   │
│  │Affiliates│◄───────┤  Affiliates Table           │   │
│  │Clients   │        │  with Key Icons (🔑)        │   │
│  │Analytics │        │                             │   │
│  └──────────┘        └─────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Tips

1. **Hover** over any button to see tooltip
2. **Click** username/email directly to copy
3. **Click** copy icon (📋) for same result
4. **Generate** creates 12-char strong password
5. **Credentials** auto-copy after reset
6. **Modal** closes by clicking [×] or outside

---

## 🔍 Finding Affiliates

### Search Methods:
- Scroll through table
- Use browser search (Ctrl+F / Cmd+F)
- Filter by status (future feature)
- Sort by column (future feature)

### Table Shows:
- ID
- Full Name
- Email
- Username
- Coupon Code
- Status
- Join Date
- Actions (with key icon!)

---

## ✅ Success Indicators

### Green Checkmarks:
- ✓ Password reset successfully
- ✓ Credentials copied
- ✓ Modal loaded
- ✓ Affiliate found

### Error Messages:
- ❌ Affiliate not found
- ❌ Password too short
- ❌ Network error
- ❌ Invalid permissions

---

**Remember:** The key icon (🔑) is your gateway to affiliate credential management!
