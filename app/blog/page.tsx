import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Header from '../components/Header';

// ✅ Make this page build-safe on Vercel (no static prerender with request-scoped cookies)
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// (Optional) After everything is stable, you can re-enable revalidate.
// For now, keep it off to prevent build-time surprises.
// export const revalidate = 3600;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  created_at: string;
}

export const metadata: Metadata = {
  title: 'Blog - FireStar Gaming Network',
  description:
    'Read the latest gaming blog posts, tutorials, and insights from FireStar Gaming Network.',
  openGraph: {
    title: 'Blog - FireStar Gaming Network',
    description:
      'Read the latest gaming blog posts, tutorials, and insights from FireStar Gaming Network.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - FireStar Gaming Network',
    description:
      'Read the latest gaming blog posts, tutorials, and insights from FireStar Gaming Network.',
  },
};

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Don't crash builds — just log and return null
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Fetch blog posts safely.
 * This prevents build/runtime failures if Supabase is unreachable.
 */
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }

    return (data || []) as BlogPost[];
  } catch (err) {
    console.error('Supabase blog fetch failed:', err);
    return [];
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="blog" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-fs-blue to-fs-blueGlow bg-clip-text text-transparent">
              Gaming Blog
            </span>
          </h1>
          <p className="text-fs-muted text-lg">
            Insights, tutorials, and stories from the gaming world. Updated regularly.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-fs-muted text-lg">No blog posts found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-fs-panel backdrop-blur-sm rounded-xl overflow-hidden border border-fs-dark hover:border-fs-blue/50 transition-all hover:shadow-lg hover:shadow-fs-blue/20 flex flex-col"
              >
                {post.featured_image && (
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-fs-muted mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-fs-text mb-3 group-hover:text-fs-blue transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-fs-muted line-clamp-3 flex-1">{post.excerpt}</p>

                  <div className="mt-4 text-fs-blue font-semibold group-hover:translate-x-2 transition-transform inline-block">
                    Read more →
                  </div>
                </div>
              </Link>
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
