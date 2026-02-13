# Fix Admin Login - Quick Guide

Your old credentials aren't working. Here's how to fix it:

## Option 1: Reset Your Password (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `dyfzxamsobywypoyocwz`

2. **Open SQL Editor**
   - Click on the `</>` SQL Editor icon in the left sidebar
   - Click "New query"

3. **Run the Password Reset Script**
   - Open the file `RESET_ADMIN_PASSWORD.sql`
   - Change these lines:
     ```sql
     target_email text := 'cejohns3@gmail.com';  -- Your email
     new_password text := 'NewPassword123!';     -- Your new password
     ```
   - Copy the entire script
   - Paste into Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter`
   - You should see "✓ Password updated successfully!"

4. **Log In**
   - Go to `/admin` page
   - Use your email and NEW password

## Option 2: Check Admin Status First

If you're not sure what the issue is, run this first:

1. Open `CHECK_ADMIN_STATUS.sql`
2. Change the email to yours
3. Run it in Supabase SQL Editor
4. It will tell you exactly what's wrong

## Quick Access URLs

- **Admin Panel**: `/admin` (bookmark this!)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz
- **SQL Editor**: https://supabase.com/dashboard/project/dyfzxamsobywypoyocwz/sql

## Common Issues

### "Invalid credentials"
- Your password is wrong or the account doesn't exist
- **Fix**: Run `RESET_ADMIN_PASSWORD.sql` to reset your password

### "Admin account is inactive"
- The account exists but is disabled
- **Fix**: Run `RESET_ADMIN_PASSWORD.sql` to reactivate it

### "Invalid admin credentials"
- The email doesn't exist in the admin_users table
- **Fix**: Run `RESET_ADMIN_PASSWORD.sql` to create/link the admin record

## After You're Logged In

Once you successfully log in at `/admin`, you can:
- Manage all content (blog posts, news, reviews, guides)
- Upload images to the gallery
- Monitor cron jobs and system logs
- Create additional admin users

## Need More Help?

The scripts are designed to be safe and will:
- Update your password if you exist
- Create a new admin if you don't exist
- Automatically activate your account
- Give you super_admin permissions

Just make sure to:
1. Edit the email and password in the script
2. Use a strong password
3. Keep your credentials safe
