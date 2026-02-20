// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Next.js App Router:
 * - Only use NEXT_PUBLIC_* here (client-safe)
 * - Do NOT use dynamic env access (e.g. getEnv(key)) because Next can’t inline it reliably.
 * - Do NOT use import.meta in Next builds.
 */

// These get inlined by Next at build-time when referenced directly.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create a browser-safe Supabase client.
 * Uses a singleton to prevent multiple auth listeners/locks.
 */
declare global {
  // eslint-disable-next-line no-var
  var __fgn_supabase__: SupabaseClient | undefined;
}

function createBrowserSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const msg =
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
    // In dev, fail fast so you notice immediately.
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(msg);
    }
    // In prod, still throw (because the app can’t function), but log first.
    // If you prefer a “soft fail”, tell me and I’ll give you a safe-null pattern.
    console.error(msg);
    throw new Error(msg);
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase: SupabaseClient =
  globalThis.__fgn_supabase__ ?? createBrowserSupabaseClient();

if (!globalThis.__fgn_supabase__) {
  globalThis.__fgn_supabase__ = supabase;

  // Optional: safe debug message (no secrets)
  if (typeof window !== 'undefined') {
    console.log('🔌 Supabase client ready');
  }
}

/* =========================
   Types (keep as-is)
========================= */

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface GameReview {
  id: string;
  title: string;
  slug: string;
  score: number;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  youtube_url: string;
  thumbnail_url: string;
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  game_title: string;
  photographer: string;
  published_at: string;
  view_count: number;
  is_featured: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  post_type: string;
  is_featured: boolean;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface Game {
  id: string;
  igdb_id: number;
  name: string;
  slug: string;
  summary: string;
  storyline: string;
  cover_url: string;
  screenshot_urls: string[];
  first_release_date: string;
  rating: number;
  rating_count: number;
  genres: string[];
  platforms: string[];
  studios: string[];
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface GameRelease {
  id: string;
  title: string;
  slug: string;
  release_date: string;
  platform: string;
  region: string;
  cover_image_url: string;
  source: string;
  source_id: string;
  source_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  category: string;
  status: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}