# Admin Setup Guide

Your project now uses secure Supabase Auth for admin authentication. Follow these simple steps to create your first admin user.

## Creating Your First Admin User

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar (it looks like `</>`)
4. Click **New query**

### Step 2: Run the Setup Script

1. Open the file `CREATE_FIRST_ADMIN.sql` from your project
2. **Edit these three lines** with your information:
   ```sql
   user_email text := 'admin@example.com';  -- Your email
   user_password text := 'YourSecurePassword123!';  -- Your password
   user_full_name text := 'Admin User';  -- Your name
   ```
3. Copy the entire SQL script
4. Paste it into the Supabase SQL Editor
5. Click **Run** (or press `Ctrl+Enter`)
6. You should see "Success" with a message that your admin was created

### Step 3: Log In

1. In your app, press `Ctrl+Shift+A` to open the admin panel
2. Sign in with the email and password you just created
3. You're now logged in as a super admin

## Admin Roles

- **super_admin**: Full access including creating other admins
- **editor**: Can manage content
- **moderator**: Can review and moderate content

## Creating Additional Admins

Once logged in as a super admin, you can create additional admin users through the admin panel interface.

## Security Features

- Email/password authentication with encrypted storage
- JWT-based session management
- Row Level Security on all admin data
- Individual user accounts with audit trails
- Automatic session expiration

## Troubleshooting

**Can't log in?**
- Verify the user exists in Authentication > Users
- Verify the user exists in the admin_users table
- Check that is_active = true in admin_users table
- Try resetting the password in the Supabase dashboard

**Need to reset admin access?**
Run this query in SQL Editor to check your admin status:
```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```
