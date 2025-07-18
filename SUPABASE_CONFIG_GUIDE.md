# Supabase Configuration Guide for Password Reset

## Issue: Password Reset Redirects to Localhost

If password reset emails are redirecting to localhost instead of the production site, you need to update the Supabase project configuration.

## Solution: Update Supabase Auth Configuration

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `wealth-well-organizer`

### Step 2: Update Auth Configuration
1. In the left sidebar, click on **"Authentication"**
2. Click on **"URL Configuration"**
3. Update the following URLs:

#### Site URL
```
https://wealth-well-organizer.vercel.app
```

#### Redirect URLs
Add these URLs to the "Redirect URLs" section:
```
https://wealth-well-organizer.vercel.app/auth/callback
https://wealth-well-organizer.vercel.app/reset-password
```

**Important:** Remove any localhost URLs like:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`

### Step 3: Additional Settings
1. In **"Auth"** > **"Settings"**:
   - **Site URL**: `https://wealth-well-organizer.vercel.app`
   - **Redirect URLs**: Add both callback and reset-password URLs

### Step 4: Email Templates (Optional)
1. Go to **"Authentication"** > **"Email Templates"**
2. In the **"Reset Password"** template, ensure the confirmation link uses:
   ```
   {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
   ```

## Testing the Fix

1. **Clear Browser Cache**: Clear your browser cache and cookies
2. **Test Password Reset**:
   - Go to the login page
   - Click "Forgot Password?"
   - Enter your email
   - Check your email for the reset link
   - The link should now redirect to `wealth-well-organizer.vercel.app/reset-password`

## Debugging

If you're still having issues:

1. **Check Console**: Open browser dev tools and check for any error messages
2. **Verify URLs**: Ensure all URLs in Supabase dashboard are correct
3. **Test in Incognito**: Try the reset flow in an incognito/private browser window

## Development vs Production

- **Development**: The app will automatically use production URLs for password reset
- **Production**: Uses the configured site URL from Supabase dashboard

## Common Issues

1. **Still redirecting to localhost**: 
   - Check Supabase dashboard configuration
   - Ensure no localhost URLs are configured
   - Clear browser cache

2. **Invalid reset link**:
   - Verify the reset link hasn't expired
   - Check that the redirect URLs are correctly configured in Supabase

3. **User not authenticated**:
   - Ensure the reset link contains the proper auth tokens
   - Check browser console for authentication errors

## Support

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Verify Supabase project configuration matches this guide
3. Test with different browsers/devices