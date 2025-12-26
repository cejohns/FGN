# Admin Setup Guide

Your project now uses secure Supabase Auth for admin authentication. Follow these steps to create your first admin user.

## Creating Your First Admin User

### Step 1: Create Auth User in Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add user** > **Create new user**
4. Enter:
   - Email: your admin email
   - Password: a secure password
   - User metadata (optional): `{"full_name": "Your Name"}`
5. Click **Create user**

### Step 2: Add User to Admin Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Run this SQL query (replace with your admin email):

```sql
INSERT INTO admin_users (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User') as full_name,
  'super_admin' as role
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Step 3: Log In

1. Press `Ctrl+Shift+A` in your app to open the admin panel
2. Sign in with your email and password
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
