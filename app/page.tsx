import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Clock, Star, BookOpen } from 'lucide-react';
import Header from './components/Header';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
}

interface GameReview {
  id: string;
  title: string;
  slug: string;
  score: number;
  excerpt: string;
  cover_image: string;
  published_at: string;
}

async function getFeaturedContent() {
  const supabase = createServerSupabaseClient();

  const [newsRes, reviewsRes, blogsRes] = await Promise.all([
    supabase
      .from('news_articles')
      .select('id, title, slug, excerpt, cover_image, published_at')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('game_reviews')
      .select('id, title, slug, score, excerpt, cover_image, published_at')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
  ]);

  return {
    news: (newsRes.data || []) as NewsArticle[],
    reviews: (reviewsRes.data || []) as GameReview[],
    blogs: (blogsRes.data || []) as BlogPost[],
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function HomePage() {
  const { news, reviews, blogs } = await getFeaturedContent();

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="home" />

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Dragon-Powered Gaming Coverage
            </span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
            Your ultimate destination for gaming news, reviews, guides, and the latest game releases.
            All powered by cutting-edge server-side rendering for blazing-fast performance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/blog"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Read Latest Blog Posts
            </Link>
          </div>
        </section>

        {blogs.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-8 h-8 text-cyan-400" />
              <h3 className="text-3xl font-bold text-white">Latest Blog Posts</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  {blog.cover_image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={blog.cover_image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(blog.published_at)}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {blog.title}
                    </h4>
                    <p className="text-slate-300 text-sm line-clamp-2">{blog.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-yellow-400" />
              <h3 className="text-3xl font-bold text-white">Featured Reviews</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50"
                >
                  {review.cover_image && (
                    <div className="relative h-48">
                      <Image
                        src={review.cover_image}
                        alt={review.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 font-bold text-lg px-3 py-1 rounded-full">
                        {review.score}/10
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-white mb-2">{review.title}</h4>
                    <p className="text-slate-300 text-sm line-clamp-2">{review.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {news.length > 0 && (
          <section className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8">Gaming News</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {news.map((article) => (
                <div
                  key={article.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50"
                >
                  {article.cover_image && (
                    <div className="relative h-48">
                      <Image
                        src={article.cover_image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{article.title}</h4>
                    <p className="text-slate-300 text-sm line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-fs-panel border-t border-fs-dark py-8">
        <div className="container mx-auto px-4 text-center text-fs-muted">
          <p>&copy; {new Date().getFullYear()} FireStar Gaming Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
