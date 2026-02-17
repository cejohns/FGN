# Fix Admin Login - Complete Guide

Still getting "Invalid admin credentials"? Here's the comprehensive fix.

## FASTEST FIX (2 minutes)

### Step 1: Open the Debug Tool

Double-click `test-admin-debug.html` to open it in your browser.

### Step 2: Click "Test Login"

This will show you the EXACT problem.

### Step 3: Copy the SQL Fix

The debug tool will show you the exact SQL to run for your specific issue.

### Step 4: Run the SQL

1. Copy the SQL from the debug tool
2. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/sql/new)
3. Paste and click "Run"

### Step 5: Try Again

Go back to `/admin` and log in with your credentials.

## NUCLEAR OPTION - Start Fresh

If nothing else works, this WILL fix it:

1. **Go to Supabase SQL Editor**
   https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/sql/new

2. **Open `FIX_ADMIN_NOW.sql`** from your project folder

3. **Edit the top 3 lines:**
   ```sql
   target_email text := 'cejohns3@gmail.com';
   new_password text := 'YourNewPassword123!';
   display_name text := 'Your Name';
   ```

4. **Copy the ENTIRE file**

5. **Paste into SQL Editor**

6. **Click "Run"**

7. **Look for this message:**
   ```
   ✅ SETUP COMPLETE!
   LOGIN CREDENTIALS:
   Email: cejohns3@gmail.com
   Password: YourNewPassword123!
   ```

8. **Try logging in** with those exact credentials

## Common Errors & Fixes

### Error: "Invalid login credentials"

**Meaning:** Email or password is wrong, or account doesn't exist.

**Fix:** Run `FIX_ADMIN_NOW.sql` - it will create/reset everything.

### Error: "Email not confirmed"

**Meaning:** Account exists but email not verified.

**Fix:** Run this in SQL Editor:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'cejohns3@gmail.com';
```

### Error: "Admin account is inactive"

**Meaning:** You're in auth.users but admin_users record is disabled.

**Fix:** Run this in SQL Editor:
```sql
UPDATE admin_users
SET is_active = true
WHERE email = 'cejohns3@gmail.com';
```

### Error: "Cannot access admin_users table"

**Meaning:** Migrations haven't run or RLS blocking access.

**Fix:** Run `FIX_ADMIN_NOW.sql` - it bypasses RLS issues.

## Detailed Troubleshooting

### 1. Check Database Status

Run `CHECK_ADMIN_STATUS.sql` in Supabase SQL Editor:
- Shows if auth user exists
- Shows if admin record exists
- Shows if account is active
- Shows your current role

### 2. Check Browser Console

1. Open `/admin` page
2. Press `F12` to open DevTools
3. Click "Console" tab
4. Try to log in
5. Look for red error messages

Common console errors:

- **"Invalid API key"** = Wrong `.env` configuration
- **"Network request failed"** = Internet or Supabase down
- **"Invalid credentials"** = Wrong email/password

### 3. Verify Environment Variables

Check your `.env` file has:

```env
VITE_SUPABASE_URL=https://dyfzxamsobywypoyocwz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw
```

If these are different, authentication will fail.

### 4. Clear Browser Cache

Sometimes old auth tokens cause issues:

1. Press `Ctrl+Shift+Delete`
2. Select "Cookies and site data"
3. Select "Cached images and files"
4. Click "Clear data"
5. Close and reopen browser
6. Try logging in again

## Understanding the Login Flow

1. **User enters email/password** at `/admin`
2. **Frontend calls** `supabase.auth.signInWithPassword()`
3. **Supabase checks** `auth.users` table for matching email
4. **Supabase verifies** password hash matches
5. **If match**, Supabase returns JWT token
6. **Frontend queries** `admin_users` table with user ID
7. **RLS allows** authenticated user to read their own record
8. **If record active**, user sees admin panel

Any failure in steps 3-7 causes "Invalid credentials".

## Available Tools

### Diagnostic Files
- `test-admin-debug.html` - **Most useful** - Shows exact problem
- `diagnose-admin.html` - Alternative diagnostic tool
- `CHECK_ADMIN_STATUS.sql` - Database status checker

### Fix Files
- `FIX_ADMIN_NOW.sql` - **Recommended** - Complete reset
- `COMPLETE_ADMIN_FIX.sql` - Alternative complete fix
- `RESET_ADMIN_PASSWORD.sql` - Simple password reset

### Documentation
- `ADMIN_QUICK_FIX.md` - Quick start guide
- `FIX_ADMIN_LOGIN.md` - This file

## Password Requirements

Your password must:
- Be at least 6 characters
- Contain letters and numbers (recommended)
- Not contain quotes or SQL special characters

Good examples:
- `SecurePass123`
- `AdminPassword99`
- `MyNewPass2024`

## Success Checklist

You've fixed it when:

- [ ] `test-admin-debug.html` shows "Login Successful"
- [ ] Browser console has no authentication errors
- [ ] `/admin` shows the admin dashboard (not login form)
- [ ] No "Invalid credentials" message appears
- [ ] You can see admin panel sections

## Still Not Working?

If you've tried everything:

1. Run `test-admin-debug.html`
2. Click "Run Full Diagnostics"
3. Click "Test Login"
4. Take a screenshot of ALL the check boxes
5. The debug tool will show SQL fixes specific to your issue
6. Run those SQL fixes
7. Clear browser cache
8. Try again

## Quick Links

- **Admin Login**: `/admin`
- **SQL Editor**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/sql/new
- **Auth Users**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/auth/users
- **Database**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/editor
- **Logs**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/logs/explorer

## Last Resort

If absolutely nothing works:

1. Delete everything and start over:
   ```sql
   DELETE FROM admin_users WHERE email = 'cejohns3@gmail.com';
   DELETE FROM auth.users WHERE email = 'cejohns3@gmail.com';
   ```

2. Wait 10 seconds

3. Run `FIX_ADMIN_NOW.sql` with your desired credentials

4. Wait another 10 seconds

5. Clear browser cache completely

6. Try logging in

This will work.
