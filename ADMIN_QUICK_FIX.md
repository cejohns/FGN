# Admin Login Quick Fix

Your credentials aren't working. Here's the fastest way to fix it.

## Step 1: Run the Diagnostic Tool

Open `diagnose-admin.html` in your browser. This will tell you exactly what's wrong:
- Is the account active?
- Does the auth user exist?
- Is the password correct?
- Are there any database issues?

The diagnostic tool will also generate the exact SQL you need to fix each problem.

## Step 2: Run the Complete Fix Script

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/sql)

2. Open `COMPLETE_ADMIN_FIX.sql`

3. Edit these three lines at the top:
   ```sql
   target_email text := 'cejohns3@gmail.com';  -- Your email
   new_password text := 'NewPassword123!';     -- Your new password
   display_name text := 'Admin User';          -- Your name
   ```

4. Copy the entire script

5. Paste it into Supabase SQL Editor and click "Run"

6. You should see output like:
   ```
   ✓ Found existing auth user
   ✓ Password updated
   ✓ Admin record updated and activated
   ✅ SUCCESS! You can now log in at /admin
   ```

## Step 3: Test Your Login

1. Go to `/admin` page in your app

2. Enter your email and password

3. You should be logged in successfully

## What This Script Does

The `COMPLETE_ADMIN_FIX.sql` script is a comprehensive solution that:

1. **Checks for existing auth user** - Looks in Supabase Auth
2. **Creates or updates auth user** - Ensures you exist in the system
3. **Resets your password** - Updates to the password you specified
4. **Checks admin record** - Looks in admin_users table
5. **Creates or updates admin record** - Ensures admin permissions exist
6. **Activates your account** - Sets is_active = true
7. **Verifies everything** - Confirms all setup is correct

It's completely safe to run multiple times - it will only update what needs updating.

## Troubleshooting

### Still can't log in?

1. Check browser console for errors (F12 → Console tab)
2. Verify you're using the exact email and password from the script
3. Make sure your Supabase project URL and keys are correct in `.env`
4. Try clearing browser cache and cookies

### Getting "Invalid credentials" error?

This usually means:
- Password is wrong (double-check what you set in the SQL)
- Auth user doesn't exist (run the fix script again)
- Email is incorrect (check for typos)

### Getting "Admin account is inactive" error?

The admin_users record exists but is_active is false. The fix script will resolve this.

### Database connection errors?

Check that your `.env` file has the correct:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Quick Links

- **Admin Panel**: `/admin`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz
- **SQL Editor**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/sql/new

## Other Helpful Files

- `diagnose-admin.html` - Interactive diagnostic tool
- `test-admin-login.html` - Quick credential tester
- `CHECK_ADMIN_STATUS.sql` - Check account status
- `RESET_ADMIN_PASSWORD.sql` - Simple password reset
- `FIX_ADMIN_LOGIN.md` - Detailed troubleshooting guide

All of these tools are safe to use and won't damage your data.
