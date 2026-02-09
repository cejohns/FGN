# Database Setup Instructions

## Step 1: Resume Your Supabase Project

Your Supabase project may be paused. To check:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project: `dyfzxamsobywypoyocwz`
3. If it shows **"Paused"**, click **"Resume Project"**
4. Wait for it to fully restart (usually takes 1-2 minutes)

## Step 2: Run the Migration

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file `/MIGRATION_TO_RUN.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`

You should see a success message. This migration will:

- Create a `profiles` table for user management
- Add `author_id` column to `blog_posts` for ownership tracking
- Set up proper RLS policies:
  - Public can read published posts only
  - Authenticated users can create/edit their own drafts
  - Admins can manage all posts
- Create triggers for auto-updating timestamps
- Set up auto-profile creation on user signup

## Step 3: Create Your First Admin User

### Option A: Sign up and promote (Recommended)

1. Go to your website
2. Sign up with your email/password
3. After signing up, go back to Supabase SQL Editor
4. Run this query (replace with your email):

```sql
SELECT promote_to_admin('your-email@example.com');
```

### Option B: Create admin directly in database

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click **"Add User"** > **"Create User"**
3. Enter your email and password
4. After creating, go to SQL Editor and run:

```sql
SELECT promote_to_admin('your-email@example.com');
```

## Step 4: Verify Setup

Run this query in SQL Editor to verify everything is working:

```sql
-- Check if profiles table exists
SELECT COUNT(*) FROM profiles;

-- Check if your admin user exists
SELECT email, role FROM profiles WHERE role = 'admin';

-- Check blog_posts has author_id column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'blog_posts' AND column_name = 'author_id';
```

## Step 5: Test Your Application

1. Refresh your website
2. The blog page should now load published posts
3. Log in with your admin account
4. Try creating a draft post
5. Try publishing it

## Troubleshooting

### Still seeing "Failed to fetch"?
- Make sure your Supabase project is **active** (not paused)
- Check your browser console for detailed error messages
- Open `/test-supabase-connection.html` to diagnose the issue

### Can't create posts?
- Make sure you ran the migration
- Verify you're logged in
- Check that your user has been promoted to admin

### RLS policy errors?
- The migration replaces old policies with new ones
- If you get conflicts, you may need to manually drop old policies first
- Check Supabase logs for specific policy violations

## What Changed?

### Before
- Blog posts had no ownership tracking
- Anyone could potentially write to the database (security risk)
- No user management system

### After
- Blog posts are owned by specific users via `author_id`
- Proper authentication with user profiles
- Role-based access control (users vs admins)
- Authors can only edit their own drafts
- Admins can manage all content
- Public can only read published content
