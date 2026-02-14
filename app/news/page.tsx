import { createServerSupabaseClient } from '@/lib/supabase/server';
import Header from '../components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  published_at: string;
  category: string;
}

interface NewsPlatformPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  source: string;
  platform: string;
  published_at: string;
}

async function getNewsContent() {
  const supabase = createServerSupabaseClient();

  const [articlesRes, platformRes] = await Promise.all([
    supabase
      .from('news_articles')
      .select('id, title, slug, excerpt, cover_image_url, published_at, category')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20),
    supabase
      .from('news_posts')
      .select('id, title, slug, excerpt, image_url, source, platform, published_at')
      .order('published_at', { ascending: false })
      .limit(20),
  ]);

  return {
    articles: (articlesRes.data || []) as NewsArticle[],
    platformNews: (platformRes.data || []) as NewsPlatformPost[],
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'ps':
    case 'playstation':
      return 'bg-blue-600';
    case 'xbox':
      return 'bg-green-600';
    case 'nintendo':
      return 'bg-red-600';
    default:
      return 'bg-slate-600';
  }
}

export default async function NewsPage() {
  const { articles, platformNews } = await getNewsContent();
  const allNews = [
    ...articles.map((a) => ({ ...a, type: 'article' as const })),
    ...platformNews.map((p) => ({ ...p, type: 'platform' as const })),
  ].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="news" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Gaming News
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Stay up to date with the latest gaming news, announcements, and updates from across the industry.
          </p>
        </div>

        {allNews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No news articles available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNews.map((item) => (
              <article
                key={`${item.type}-${item.id}`}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
              >
                {(item.type === 'article' ? item.cover_image_url : item.image_url) && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.type === 'article' ? item.cover_image_url! : item.image_url!}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {item.type === 'platform' && (
                      <div
                        className={`absolute top-3 left-3 ${getPlatformColor(
                          item.platform
                        )} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}
                      >
                        {item.source}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-400 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                    {item.type === 'article' && item.category && (
                      <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs uppercase font-medium">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">{item.excerpt}</p>

                  <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-fs-panel border-t border-fs-dark py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-fs-muted">
          <p>&copy; {new Date().getFullYear()} FireStar Gaming Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
