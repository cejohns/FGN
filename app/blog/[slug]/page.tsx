import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Clock, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BlogPost;
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firestargamingnetwork.com';

  return {
    title: `${post.title} - FireStar Gaming Network`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      images: post.cover_image
        ? [
            {
              url: post.cover_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      url: `${baseUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export async function generateStaticParams() {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  if (!data) return [];

  return data.map((post) => ({
    slug: post.slug,
  }));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firestargamingnetwork.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image || undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'FireStar Gaming Network',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FireStar Gaming Network',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/FGNLogo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold text-xl">F</span>
                </Link>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  FireStar Gaming
                </h1>
              </div>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/"
                  className="text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/blog"
                  className="text-cyan-400 font-semibold"
                >
                  Blog
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <article>
            {post.cover_image && (
              <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Clock className="w-5 h-5" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-slate-300 mb-8 leading-relaxed border-l-4 border-cyan-500 pl-6 italic">
                {post.excerpt}
              </p>
            )}

            <div
              className="prose prose-invert prose-cyan max-w-none
                prose-headings:text-white prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-slate-300 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300 hover:prose-a:underline
                prose-strong:text-white prose-strong:font-bold
                prose-ul:text-slate-300 prose-ul:text-lg
                prose-ol:text-slate-300 prose-ol:text-lg
                prose-li:mb-2
                prose-blockquote:border-l-cyan-500 prose-blockquote:text-slate-300 prose-blockquote:italic
                prose-code:text-cyan-400 prose-code:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <div className="mt-16 pt-8 border-t border-slate-700">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              View All Blog Posts
            </Link>
          </div>
        </main>

        <footer className="bg-slate-800/50 border-t border-slate-700/50 py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} FireStar Gaming Network. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
