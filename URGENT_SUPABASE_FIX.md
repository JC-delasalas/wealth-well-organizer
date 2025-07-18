# 🚨 URGENT: Fix Supabase Configuration for Password Reset

## Current Issue
Password reset emails are redirecting to `localhost:3000` instead of the production site `wealth-well-organizer.vercel.app`.

**Error you're seeing:**
```
http://localhost:3000/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## Quick Fix (5 minutes)

### Step 1: Login to Supabase
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: **wealth-well-organizer**

### Step 2: Update Auth Configuration
1. In the left sidebar, click **"Authentication"**
2. Click **"URL Configuration"**
3. Update the following settings:

#### Site URL
**Replace with:**
```
https://wealth-well-organizer.vercel.app
```

#### Redirect URLs
**Add these URLs** (remove any localhost URLs):
```
https://wealth-well-organizer.vercel.app/auth/callback
https://wealth-well-organizer.vercel.app/reset-password
```

**Remove these URLs** (if they exist):
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

### Step 3: Save Changes
1. Click **"Save"** or **"Update"**
2. Wait for the configuration to propagate (usually instant)

## Test the Fix

### Method 1: Request New Password Reset
1. Clear your browser cache
2. Go to [wealth-well-organizer.vercel.app/auth](https://wealth-well-organizer.vercel.app/auth)
3. Click **"Forgot Password?"**
4. Enter your email address
5. Check your email - the link should now go to the production site

### Method 2: Use the Current Broken Link
If you still have the localhost link in your email:
1. Open the link in your browser
2. The app will automatically redirect you to the production site
3. You'll see a helpful screen with a "Request New Reset Link" button

## Screenshots Guide

### 1. Supabase Dashboard → Authentication
![Supabase Auth Menu](https://via.placeholder.com/300x200/blue/white?text=Auth+Menu)

### 2. URL Configuration
![URL Configuration](https://via.placeholder.com/300x200/green/white?text=URL+Config)

### 3. Site URL Setting
```
Site URL: https://wealth-well-organizer.vercel.app
```

### 4. Redirect URLs Setting
```
Redirect URLs:
- https://wealth-well-organizer.vercel.app/auth/callback
- https://wealth-well-organizer.vercel.app/reset-password
```

## What This Fixes

✅ **Password reset emails** will redirect to production site  
✅ **Email confirmation links** will work correctly  
✅ **Authentication flow** will be consistent  
✅ **No more localhost redirects** in production  

## Verification

After updating the configuration:

1. **Test password reset:**
   - Request a new password reset
   - Check that the email link goes to `wealth-well-organizer.vercel.app`
   - Complete the password reset process

2. **Test email confirmation:**
   - Sign up with a new email
   - Check that the confirmation link goes to production site

## Common Issues

### Issue: "Configuration not updating"
**Solution:** Wait 1-2 minutes and try again. Sometimes it takes a moment to propagate.

### Issue: "Still getting localhost links"
**Solution:** 
1. Double-check the Site URL is exactly: `https://wealth-well-organizer.vercel.app`
2. Ensure no trailing slashes
3. Remove ALL localhost URLs from redirect URLs

### Issue: "Reset link still expires"
**Solution:** Request a fresh password reset link after updating the configuration.

## Emergency Contact

If you're still having issues after following this guide:
1. Check the browser console for error messages
2. Try the password reset in an incognito/private window
3. Verify the exact URLs in your Supabase configuration match the ones above

## Development Notes

- The app now includes automatic localhost redirect handling
- When running locally, password reset emails will still use production URLs
- This ensures a consistent experience regardless of development environment

---

**⏱️ This fix should take less than 5 minutes to implement.**

**🎯 Once completed, the password reset flow will work perfectly for all users.**