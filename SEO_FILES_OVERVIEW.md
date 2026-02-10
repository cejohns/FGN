# 📁 SEO Files Overview

Quick reference guide to all SEO-related files in your project.

## Core SEO Files

### `/index.html`
**What it does**: Main HTML file with base SEO meta tags and structured data
**Status**: ✅ Ready (needs domain update)
**Priority**: 🔴 Critical
**Update needed**: Replace `yourdomain.com` with actual domain

Key sections:
- Line 4-12: Google Analytics
- Line 14-16: Basic meta tags
- Line 18-32: Open Graph & Twitter Cards
- Line 34-38: Robots meta tags
- Line 42-61: JSON-LD structured data (WebSite schema)

### `/public/robots.txt`
**What it does**: Tells search engines what to crawl
**Status**: ✅ Ready (needs domain update)
**Priority**: 🔴 Critical
**Update needed**: Line 5 - Update sitemap URL

Instructions for crawlers:
- Allows all search engines
- Points to sitemap
- Blocks admin and API routes

## SEO Utility Files

### `/src/lib/seo.tsx`
**What it does**: React hook for dynamic SEO meta tags
**Status**: ✅ Ready to use
**Priority**: 🟡 Important

Features:
- `useSEO()` hook for page-specific meta tags
- Updates title, description, Open Graph, Twitter Cards
- Injects structured data
- Pre-configured page metadata

Usage example:
```tsx
import { useSEO, pageSEO } from '../lib/seo';

function MyPage() {
  useSEO(pageSEO.news);
  return <div>...</div>;
}
```

### `/src/lib/structuredData.ts`
**What it does**: Generates JSON-LD structured data
**Status**: ✅ Ready to use
**Priority**: 🟢 Nice to have

Functions:
- `generateArticleSchema()` - For blog posts and news
- `generateReviewSchema()` - For game reviews with ratings
- `generateVideoSchema()` - For video content
- `generateGameSchema()` - For game database entries
- `generateBreadcrumbSchema()` - For navigation breadcrumbs
- `injectStructuredData()` - Adds schema to page
- `removeStructuredData()` - Cleanup on unmount

### `/src/components/Sitemap.tsx`
**What it does**: Generates XML sitemap from database
**Status**: ✅ Working
**Priority**: 🟡 Important

Features:
- Fetches published content from database
- Generates valid XML sitemap
- Accessible at `/sitemap` route
- Download and copy functionality

## Edge Functions

### `/supabase/functions/generate-sitemap/`
**What it does**: Server-side sitemap generation
**Status**: ⚠️ Created (not deployed)
**Priority**: 🟢 Optional

Use case:
- Alternative to client-side sitemap
- Can be called by crawlers directly
- Caches results for performance

**Note**: Deployment encountered an issue. Use the built-in `/sitemap` route for now.

## Documentation Files

### `SEO_INDEXING_GUIDE.md`
**What it contains**: Complete guide to getting indexed
**Priority**: 📚 Read first

Covers:
- Step-by-step search engine submission
- Gaming-specific directories
- Building backlinks
- Content strategy
- Technical SEO checklist
- Expected timelines

### `SEO_QUICK_START.md`
**What it contains**: Quick action checklist
**Priority**: ⚡ Use for launch

Includes:
- Day 1 tasks
- Week 1 tasks
- Monthly maintenance
- Success metrics
- Common issues and fixes

### `SEO_IMPLEMENTATION_EXAMPLES.md`
**What it contains**: Code examples for developers
**Priority**: 💻 For developers

Shows:
- How to add structured data to components
- Blog post SEO example
- Game review SEO example
- Video content SEO example
- Breadcrumb navigation example

### `PRE_LAUNCH_CHECKLIST.md`
**What it contains**: Final pre-launch verification
**Priority**: 🎯 Use before deploy

Checklist:
- Critical updates needed
- Testing requirements
- Launch day timeline
- Success criteria

### `SEO_FILES_OVERVIEW.md`
**What it contains**: This file!
**Priority**: 📋 Quick reference

## File Priority Matrix

### 🔴 Must Update Before Launch
1. `/index.html` - Update all "yourdomain.com" references
2. `/public/robots.txt` - Update sitemap URL

### 🟡 Should Use for Best Results
3. `/src/lib/seo.tsx` - Use on every page component
4. `/src/components/Sitemap.tsx` - Already integrated

### 🟢 Optional but Recommended
5. `/src/lib/structuredData.ts` - Use for rich snippets
6. `/supabase/functions/generate-sitemap/` - Alternative sitemap

## Quick File Locations

```
project/
├── index.html                          🔴 Update domain references
├── public/
│   └── robots.txt                      🔴 Update sitemap URL
├── src/
│   ├── lib/
│   │   ├── seo.tsx                     🟡 Use this hook
│   │   └── structuredData.ts           🟢 Rich snippets
│   └── components/
│       └── Sitemap.tsx                 ✅ Working
├── supabase/functions/
│   └── generate-sitemap/               🟢 Optional
└── docs/
    ├── SEO_INDEXING_GUIDE.md           📚 Read this
    ├── SEO_QUICK_START.md              ⚡ Do this
    ├── SEO_IMPLEMENTATION_EXAMPLES.md  💻 Code examples
    ├── PRE_LAUNCH_CHECKLIST.md         🎯 Pre-launch
    └── SEO_FILES_OVERVIEW.md           📋 This file
```

## How to Use These Files

### For Launch (30 minutes)
1. Read `PRE_LAUNCH_CHECKLIST.md`
2. Update domain in `/index.html` and `/public/robots.txt`
3. Follow `SEO_QUICK_START.md` day 1 tasks

### For Development (ongoing)
1. Use `useSEO()` hook in all page components
2. Add structured data to key content (reviews, articles)
3. Reference `SEO_IMPLEMENTATION_EXAMPLES.md` for code

### For Strategy (monthly)
1. Follow `SEO_INDEXING_GUIDE.md` long-term strategy
2. Monitor metrics from `SEO_QUICK_START.md`
3. Adjust based on Search Console data

## Common Tasks

### Update a Page's SEO
```tsx
// In your component file
import { useSEO } from '../lib/seo';

function MyPage() {
  useSEO({
    title: 'Your Page Title',
    description: 'Your page description 150-160 chars',
    image: 'https://yourdomain.com/image.jpg',
    type: 'article'
  });

  return <div>Your content</div>;
}
```

### Add Structured Data to Article
```tsx
import { useSEO } from '../lib/seo';
import { generateArticleSchema } from '../lib/structuredData';

function Article({ data }) {
  const structuredData = generateArticleSchema({
    title: data.title,
    description: data.excerpt,
    author: data.author,
    publishedTime: data.created_at,
    url: `https://yourdomain.com/article/${data.slug}`
  });

  useSEO({
    title: data.title,
    description: data.excerpt,
    type: 'article',
    structuredData
  });

  return <div>Article content</div>;
}
```

### Check if SEO is Working
1. Visit your deployed site
2. View page source (Ctrl+U or Cmd+U)
3. Look for:
   - `<title>` tag with your content
   - `<meta name="description">` tag
   - `<meta property="og:*">` tags
   - `<script type="application/ld+json">` with structured data

## Testing URLs

After deployment, test these:

1. **Robots.txt**: `https://yourdomain.com/robots.txt`
   - Should show the contents of `/public/robots.txt`

2. **Sitemap**: `https://yourdomain.com/sitemap`
   - Should display XML sitemap UI

3. **Homepage**: `https://yourdomain.com/`
   - View source, check for meta tags and structured data

4. **Google Test**: Paste URL into:
   - https://search.google.com/test/rich-results
   - Should pass with no errors

## Troubleshooting

### "robots.txt not found"
- Ensure `/public/robots.txt` exists
- Check it's in the `public` folder, not `src`
- Rebuild: `npm run build`

### "Sitemap doesn't work"
- Visit `/sitemap` route (not `/sitemap.xml`)
- Check `Sitemap.tsx` is imported in routing
- Verify database has published content

### "Meta tags not updating"
- Check you're using `useSEO()` hook in component
- Verify import: `import { useSEO } from '../lib/seo'`
- Clear browser cache and reload

### "Structured data errors"
- Test with: https://validator.schema.org/
- Ensure all required fields provided
- Check for typos in property names

## Status Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Google Analytics | ✅ Active | None |
| Base meta tags | ✅ Ready | Update domain |
| robots.txt | ✅ Ready | Update domain |
| Sitemap component | ✅ Working | None |
| SEO hooks | ✅ Ready | Use in components |
| Structured data | ✅ Ready | Optional use |
| Edge function | ⚠️ Created | Not deployed (optional) |
| Documentation | ✅ Complete | Read and follow |

## Next Steps

1. ✅ Read `PRE_LAUNCH_CHECKLIST.md`
2. ✅ Update domain references
3. ✅ Deploy site
4. ✅ Follow `SEO_QUICK_START.md`
5. ✅ Monitor Google Search Console

---

**Questions?** Reference the specific documentation file for detailed information on each topic.
