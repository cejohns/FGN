import { createServerSupabaseClient } from '@/lib/supabase/server';

export const revalidate = 3600;

interface SitemapUrl {
  slug: string;
  updated_at: string;
}

async function getAllPublishedContent() {
  const supabase = createServerSupabaseClient();

  const [blogPosts, newsArticles, reviews, guides] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published'),
    supabase
      .from('news_articles')
      .select('slug, updated_at')
      .eq('status', 'published'),
    supabase
      .from('game_reviews')
      .select('slug, updated_at')
      .eq('status', 'published'),
    supabase
      .from('guides')
      .select('slug, updated_at')
      .eq('status', 'published'),
  ]);

  return {
    blogPosts: (blogPosts.data || []) as SitemapUrl[],
    newsArticles: (newsArticles.data || []) as SitemapUrl[],
    reviews: (reviews.data || []) as SitemapUrl[],
    guides: (guides.data || []) as SitemapUrl[],
  };
}

function formatDate(date: string): string {
  return new Date(date).toISOString();
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firestargamingnetwork.com';
  const { blogPosts, newsArticles, reviews, guides } = await getAllPublishedContent();

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
  ${blogPosts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${formatDate(post.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  ${newsArticles
    .map(
      (article) => `
  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <lastmod>${formatDate(article.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
  ${reviews
    .map(
      (review) => `
  <url>
    <loc>${baseUrl}/reviews/${review.slug}</loc>
    <lastmod>${formatDate(review.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
  ${guides
    .map(
      (guide) => `
  <url>
    <loc>${baseUrl}/guides/${guide.slug}</loc>
    <lastmod>${formatDate(guide.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
