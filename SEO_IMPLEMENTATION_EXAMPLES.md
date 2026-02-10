# SEO Implementation Examples

This document shows how to use the structured data utilities to improve your search engine visibility.

## Quick Start

The site already includes:
- Base structured data in `index.html`
- SEO utilities in `src/lib/seo.tsx`
- Structured data generators in `src/lib/structuredData.ts`

## Example 1: Blog Post with Structured Data

```tsx
import { useSEO } from '../lib/seo';
import { generateArticleSchema } from '../lib/structuredData';

function BlogPostPage({ post }) {
  const structuredData = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    image: post.cover_image,
    author: post.author,
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    url: `https://yourdomain.com/blog/${post.slug}`,
    tags: post.tags
  });

  useSEO({
    title: post.title,
    description: post.excerpt,
    image: post.cover_image,
    type: 'article',
    author: post.author,
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    structuredData
  });

  return <div>{/* Your post content */}</div>;
}
```

## Example 2: Game Review with Rating

```tsx
import { useSEO } from '../lib/seo';
import { generateReviewSchema } from '../lib/structuredData';

function GameReviewPage({ review }) {
  const structuredData = generateReviewSchema({
    title: review.title,
    description: review.excerpt,
    image: review.cover_image,
    author: review.author,
    publishedTime: review.created_at,
    modifiedTime: review.updated_at,
    url: `https://yourdomain.com/reviews/${review.slug}`,
    rating: review.rating,
    gameName: review.game_title
  });

  useSEO({
    title: `${review.game_title} Review`,
    description: review.excerpt,
    image: review.cover_image,
    type: 'article',
    structuredData
  });

  return <div>{/* Your review content */}</div>;
}
```

## Example 3: Video Content

```tsx
import { useSEO } from '../lib/seo';
import { generateVideoSchema } from '../lib/structuredData';

function VideoPage({ video }) {
  const structuredData = generateVideoSchema({
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail,
    uploadDate: video.published_at,
    duration: video.duration, // Format: PT1H30M (1 hour 30 minutes)
    embedUrl: video.embed_url
  });

  useSEO({
    title: video.title,
    description: video.description,
    image: video.thumbnail,
    structuredData
  });

  return <div>{/* Your video player */}</div>;
}
```

## Example 4: Game Database Entry

```tsx
import { useSEO } from '../lib/seo';
import { generateGameSchema } from '../lib/structuredData';

function GameDetailsPage({ game }) {
  const structuredData = generateGameSchema({
    name: game.name,
    description: game.summary,
    image: game.cover_image,
    genre: game.genres,
    releaseDate: game.release_date,
    publisher: game.publisher,
    platform: game.platforms
  });

  useSEO({
    title: `${game.name} - Game Details`,
    description: game.summary,
    image: game.cover_image,
    structuredData
  });

  return <div>{/* Game details */}</div>;
}
```

## Example 5: Breadcrumb Navigation

```tsx
import { generateBreadcrumbSchema } from '../lib/structuredData';
import { useEffect } from 'react';

function ArticlePage({ category, article }) {
  useEffect(() => {
    const breadcrumbs = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://yourdomain.com/' },
      { name: category, url: `https://yourdomain.com/${category}` },
      { name: article.title, url: `https://yourdomain.com/${category}/${article.slug}` }
    ]);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbs);
    document.head.appendChild(script);

    return () => script.remove();
  }, [category, article]);

  return <div>{/* Your content */}</div>;
}
```

## Best Practices

### 1. Always Include Required Fields
- **Articles**: title, description, author, publishedTime
- **Reviews**: All article fields + rating, gameName
- **Videos**: name, description, thumbnailUrl, uploadDate
- **Games**: name, description

### 2. Use High-Quality Images
```tsx
// Good - Specific, high-res image
image: "https://yourdomain.com/images/game-review-1200x630.jpg"

// Bad - Generic or low-res
image: "/logo.png"
```

### 3. Format Dates Correctly
```tsx
// ISO 8601 format
publishedTime: "2024-01-15T10:30:00Z"
```

### 4. Optimize URLs
```tsx
// Good - Clean, descriptive URLs
url: "https://yourdomain.com/reviews/elden-ring-complete-review"

// Bad - Query parameters, IDs
url: "https://yourdomain.com/post?id=123"
```

## Testing Your Structured Data

### Google Rich Results Test
Test your structured data:
```
https://search.google.com/test/rich-results
```

### Schema.org Validator
Validate your schema:
```
https://validator.schema.org/
```

### Steps:
1. Deploy your page
2. Copy the page URL
3. Paste into the testing tool
4. Fix any errors or warnings
5. Re-test until perfect

## Common Structured Data Types for Gaming Sites

### NewsArticle
```json
{
  "@type": "NewsArticle",
  "headline": "New Game Announcement",
  "datePublished": "2024-01-15"
}
```

### Review
```json
{
  "@type": "Review",
  "itemReviewed": {
    "@type": "VideoGame",
    "name": "Game Name"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 8.5,
    "bestRating": 10
  }
}
```

### HowTo (for guides)
```json
{
  "@type": "HowTo",
  "name": "How to Beat Final Boss",
  "step": [
    {
      "@type": "HowToStep",
      "text": "Step 1 description"
    }
  ]
}
```

## Impact on Search Results

With proper structured data, your content can appear as:
- ⭐ **Rich Snippets** - Star ratings, prices, availability
- 📰 **Top Stories** - News carousel
- 🎬 **Video Results** - Video thumbnails in search
- 🍞 **Breadcrumbs** - Site navigation in results
- ❓ **FAQ** - Expandable Q&A in results
- 📝 **Article** - Author, date, image in results

## Monitoring Results

### Google Search Console
1. Go to "Enhancements" section
2. Check "Rich Results" report
3. Fix any errors
4. Monitor impressions and clicks

### Expected Timeline
- **Week 1**: Google discovers structured data
- **Week 2-4**: Rich results start appearing
- **Month 2+**: Full rich result coverage

## Tips for Maximum SEO Impact

1. **Update URLs** - Replace "yourdomain.com" with your actual domain everywhere
2. **Use Real Data** - Don't use placeholder content
3. **Be Specific** - Detailed descriptions perform better
4. **Include Images** - Always use high-quality images
5. **Keep Updated** - Update modifiedTime when content changes
6. **Test Everything** - Use Google's testing tools
7. **Monitor Performance** - Check Search Console weekly

## Need Help?

- [Google Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Schema.org Documentation](https://schema.org/)
- [JSON-LD Validator](https://json-ld.org/playground/)
