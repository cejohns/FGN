import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemap(entries: SitemapEntry[]): string {
  const baseUrl = window.location.origin;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}${entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''}${entry.priority !== undefined ? `\n    <priority>${entry.priority.toFixed(1)}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}

export async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  const staticPages: SitemapEntry[] = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/news', changefreq: 'daily', priority: 0.9 },
    { loc: '/reviews', changefreq: 'weekly', priority: 0.9 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
    { loc: '/guides', changefreq: 'weekly', priority: 0.8 },
    { loc: '/videos', changefreq: 'daily', priority: 0.7 },
    { loc: '/gallery', changefreq: 'weekly', priority: 0.6 },
    { loc: '/releases', changefreq: 'daily', priority: 0.8 },
  ];

  try {
    const [newsRes, reviewsRes, blogsRes, guidesRes] = await Promise.all([
      supabase
        .from('news_articles')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('game_reviews')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('guides')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(100),
    ]);

    const dynamicPages: SitemapEntry[] = [];

    if (newsRes.data) {
      newsRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/news/${item.slug}`,
          lastmod: item.updated_at,
          changefreq: 'weekly',
          priority: 0.7,
        });
      });
    }

    if (reviewsRes.data) {
      reviewsRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/reviews/${item.slug}`,
          lastmod: item.updated_at,
          changefreq: 'monthly',
          priority: 0.8,
        });
      });
    }

    if (blogsRes.data) {
      blogsRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/blog/${item.slug}`,
          lastmod: item.updated_at,
          changefreq: 'monthly',
          priority: 0.6,
        });
      });
    }

    if (guidesRes.data) {
      guidesRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/guides/${item.slug}`,
          lastmod: item.updated_at,
          changefreq: 'monthly',
          priority: 0.7,
        });
      });
    }

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error('Error fetching sitemap entries:', error);
    return staticPages;
  }
}

export default function SitemapPage() {
  const [sitemap, setSitemap] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSitemapContent();
  }, []);

  const generateSitemapContent = async () => {
    try {
      const entries = await fetchSitemapEntries();
      const xml = generateSitemap(entries);
      setSitemap(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sitemap);
    alert('Sitemap XML copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Sitemap</h1>

      <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400">
            Generated sitemap with {sitemap.split('<url>').length - 1} URLs
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Copy XML
            </button>
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Download
            </button>
          </div>
        </div>

        <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 border border-slate-800">
          {sitemap}
        </pre>
      </div>

      <div className="mt-6 bg-slate-900 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Submit to Search Engines</h2>
        <ul className="space-y-2 text-gray-400">
          <li>
            • <strong className="text-white">Google:</strong>{' '}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Google Search Console
            </a>
          </li>
          <li>
            • <strong className="text-white">Bing:</strong>{' '}
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Bing Webmaster Tools
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
