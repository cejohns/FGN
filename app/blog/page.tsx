import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Clock, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 3600;

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
  description: 'Read the latest gaming blog posts, tutorials, and insights from FireStar Gaming Network.',
  openGraph: {
    title: 'Blog - FireStar Gaming Network',
    description: 'Read the latest gaming blog posts, tutorials, and insights from FireStar Gaming Network.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - FireStar Gaming Network',
    description: 'Read the latest gaming blog posts, tutorials, and insights from FireStar Gaming Network.',
  },
};

async function getBlogPosts() {
  const supabase = createServerSupabaseClient();

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
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </Link>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                FireStar Gaming
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <Link href="/blog" className="text-cyan-400 font-semibold">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Gaming Blog
            </span>
          </h1>
          <p className="text-slate-300 text-lg">
            Insights, tutorials, and stories from the gaming world. Updated regularly.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No blog posts found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20 flex flex-col"
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
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-300 line-clamp-3 flex-1">{post.excerpt}</p>
                  <div className="mt-4 text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-slate-800/50 border-t border-slate-700/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} FireStar Gaming Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
