import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// IMPORTANT: don’t use revalidate on this route while stabilizing deploy
// export const revalidate = 3600;

interface SitemapUrl {
  slug: string;
  updated_at: string;
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getAllPublishedContent() {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) {
      return { blogPosts: [], newsArticles: [], reviews: [], guides: [] };
    }

    const [blogPosts, newsArticles, reviews, guides] = await Promise.all([
      supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
      // NOTE: earlier you used "news_articles" here; make sure this matches your real table
      supabase.from('news_articles').select('slug, updated_at').eq('status', 'published'),
      supabase.from('game_reviews').select('slug, updated_at').eq('status', 'published'),
      supabase.from('guides').select('slug, updated_at').eq('status', 'published'),
    ]);

    // Don’t throw — return empty arrays if any query errors
    if (blogPosts.error) console.error('sitemap blog_posts error:', blogPosts.error);
    if (newsArticles.error) console.error('sitemap news_articles error:', newsArticles.error);
    if (reviews.error) console.error('sitemap game_reviews error:', reviews.error);
    if (guides.error) console.error('sitemap guides error:', guides.error);

    return {
      blogPosts: (blogPosts.data || []) as SitemapUrl[],
      newsArticles: (newsArticles.data || []) as SitemapUrl[],
      reviews: (reviews.data || []) as SitemapUrl[],
      guides: (guides.data || []) as SitemapUrl[],
    };
  } catch (e) {
    console.error('sitemap getAllPublishedContent failed:', e);
    return { blogPosts: [], newsArticles: [], reviews: [], guides: [] };
  }
}

function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.firestargn.com';

  const { blogPosts, newsArticles, reviews, guides } = await getAllPublishedContent();

  const nowIso = new Date().toISOString();

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/news', priority: '0.9', changefreq: 'daily' },
    { url: '/reviews', priority: '0.8', changefreq: 'weekly' },
    { url: '/guides', priority: '0.8', changefreq: 'weekly' },
    { url: '/releases', priority: '0.7', changefreq: 'weekly' },
    { url: '/gallery', priority: '0.6', changefreq: 'weekly' },
    { url: '/videos', priority: '0.6', changefreq: 'weekly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${nowIso}</lastmod>
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
      // Let Vercel edge cache it; safe defaults
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
