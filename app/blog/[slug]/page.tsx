import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Clock, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Header from '../../components/Header';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// IMPORTANT: remove revalidate while deploying
// export const revalidate = 3600;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ✅ never throw here (throws can still break metadata/build paths in edge cases)
  if (!url || !anon) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createPublicSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('getBlogPost error:', error);
      return null;
    }

    return data as BlogPost;
  } catch (e) {
    console.error('getBlogPost failed:', e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.firestargn.com';

  // ✅ keep metadata safe even if DB is down
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'FireStar Gaming Network',
      description: `Article: ${params.slug}`,
      openGraph: { url: `${baseUrl}/blog/${params.slug}` },
    };
  }

  return {
    title: `${post.title} - FireStar Gaming Network`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      images: post.featured_image
        ? [{ url: post.featured_image, width: 1200, height: 630, alt: post.title }]
        : [],
      url: `${baseUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

// ✅ REMOVE generateStaticParams completely to stop Vercel build from collecting page data
// export async function generateStaticParams() { ... }

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPost(params.slug);

  if (!post) notFound();
  const p = post;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.firestargn.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    image: p.featured_image || undefined,
    datePublished: p.published_at || p.created_at,
    dateModified: p.updated_at,
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
      '@id': `${baseUrl}/blog/${p.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-fs-dark">
        <Header currentPage="blog" />

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-fs-muted hover:text-fs-blue transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <article>
            {p.featured_image && (
              <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8">
                <Image
                  src={p.featured_image}
                  alt={p.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-fs-muted mb-4">
              <Clock className="w-5 h-5" />
              <time dateTime={p.published_at || p.created_at}>
                {formatDate(p.published_at || p.created_at)}
              </time>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-fs-text mb-6 leading-tight">
              {p.title}
            </h1>

            {p.excerpt && (
              <p className="text-xl text-fs-muted mb-8 leading-relaxed border-l-4 border-fs-blue pl-6 italic">
                {p.excerpt}
              </p>
            )}

            <div
              className="prose prose-invert max-w-none
                prose-headings:text-fs-text prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-fs-muted prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-fs-blue prose-a:no-underline hover:prose-a:text-fs-blueGlow hover:prose-a:underline
                prose-strong:text-fs-text prose-strong:font-bold
                prose-ul:text-fs-muted prose-ul:text-lg
                prose-ol:text-fs-muted prose-ol:text-lg
                prose-li:mb-2
                prose-blockquote:border-l-fs-blue prose-blockquote:text-fs-muted prose-blockquote:italic
                prose-code:text-fs-blue prose-code:bg-fs-panel prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-fs-panel prose-pre:border prose-pre:border-fs-dark"
              dangerouslySetInnerHTML={{ __html: p.content }}
            />
          </article>

          <div className="mt-16 pt-8 border-t border-fs-dark">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-fs-blue hover:text-fs-blueGlow transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              View All Blog Posts
            </Link>
          </div>
        </main>

        <footer className="bg-fs-panel border-t border-fs-dark py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-fs-muted">
            <p>&copy; {new Date().getFullYear()} FireStar Gaming Network. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
