# Content Management Quick Start Guide

## IMMEDIATE ACTION REQUIRED

### Step 1: Fix Database Permissions

Open your **Supabase SQL Editor** and run the contents of:
```
FIX_ALL_CONTENT_RLS_POLICIES.sql
```

This allows the admin panel to create/edit/delete content.

### Step 2: Access Admin Panel

Navigate to:
```
http://localhost:3000/admin
```
or
```
https://your-site.com/admin
```

### Step 3: Create Content

You'll see 6 content management sections:

1. **Blog Posts** (Emerald green)
   - Click "New Post" button
   - Fill in title, slug, excerpt, content
   - Choose category and status
   - Submit

2. **News Articles** (Blue)
   - Click "New Article" button
   - Fill in title, slug, excerpt, content
   - Choose news category
   - Submit

3. **Game Reviews** (Purple/Pink)
   - Click "New Review" button
   - Enter game title, platform, genre
   - **Must provide rating (0-10)**
   - Fill in review content
   - Submit

4. **Guides & Tutorials** (Amber/Orange)
   - Click "New Guide" button
   - Fill in title and content
   - Choose difficulty (Beginner/Intermediate/Advanced)
   - Set estimated time
   - Submit

5. **Videos** (Rose/Red)
   - Click "New Video" button
   - Enter title and description
   - **Must provide video URL** (YouTube link)
   - Optional: thumbnail URL and duration
   - Submit

6. **Gallery Images** (Teal)
   - Click "New Image" button
   - Enter title
   - **Must provide image URL**
   - Optional: thumbnail, description, game title
   - Submit

## What Each Section Shows

- **Top of page:** Database connection status (green = good)
- **Each section:**
  - "New [Type]" button to open form
  - List of 10 most recent items
  - Trash icon to delete items
  - Featured badge if item is featured

## Required Fields

### Blog Posts
- Title ✅
- Slug ✅ (auto-generated from title)
- Excerpt ✅
- Content ✅

### News Articles
- Title ✅
- Slug ✅ (auto-generated)
- Excerpt ✅
- Content ✅

### Game Reviews
- Game Title ✅
- Platform ✅
- Genre ✅
- Rating (0-10) ✅
- Excerpt ✅
- Content ✅

### Guides
- Title ✅
- Slug ✅ (auto-generated)
- Excerpt ✅
- Content ✅

### Videos
- Title ✅
- Slug ✅ (auto-generated)
- Description ✅
- Video URL ✅

### Gallery Images
- Title ✅
- Image URL ✅

## Tips

1. **Slug Auto-Generation:** When you type a title, the slug is automatically created. You can edit it manually if needed.

2. **Default Images:** If you don't provide an image URL, a default Unsplash gaming image is used.

3. **Featured Content:** Check the "Feature on homepage" box to highlight content.

4. **Status (Blog Only):**
   - Draft = Not published yet (published_at = null)
   - Published = Live on site (published_at = now)

5. **Ratings (Reviews Only):** Must be a number between 0 and 10 (e.g., 8.5, 9.0)

## Troubleshooting

### "New row violates row-level security policy"
→ You didn't run the SQL migration. Go to Step 1.

### "Please fill in all required fields"
→ Check that all fields marked with red asterisk (*) are filled.

### "Database connection failed"
→ Check your `.env` file has correct Supabase credentials:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### Content not appearing in list
→ Refresh the page. The list shows the 10 most recent items only.

## Files to Reference

- **SQL Migration:** `FIX_ALL_CONTENT_RLS_POLICIES.sql`
- **Full Documentation:** `COMPLETE_CONTENT_MANAGEMENT_SETUP.md`
- **Blog Only Docs:** `BLOG_ADMIN_SETUP_COMPLETE.md`

## Security Warning

⚠️ **IMPORTANT:** The current setup uses temporary RLS policies that allow anyone with your anon key to modify content. This is for **testing only**.

Before going to production:
1. Remove "TEMP:" policies from database
2. Implement proper admin authentication
3. Use the existing admin_users table and is_admin() function

See `COMPLETE_CONTENT_MANAGEMENT_SETUP.md` for production checklist.
