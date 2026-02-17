import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Get env vars safely in BOTH environments:
 * - Vite: import.meta.env.VITE_*
 * - Next: process.env.NEXT_PUBLIC_*
 */
function getEnv(key: string): string | undefined {
  // Vite environment
  try {
    const viteEnv = (import.meta as any)?.env;
    if (viteEnv && typeof viteEnv[key] === 'string') return viteEnv[key];
  } catch {
    // ignore
  }

  // Next environment (injected at build time)
  try {
    const nextEnv = (process as any)?.env;
    if (nextEnv && typeof nextEnv[key] === 'string') return nextEnv[key];
  } catch {
    // ignore
  }

  return undefined;
}

// Prefer Vite vars when running Vite, otherwise Next public vars
const supabaseUrl =
  getEnv('VITE_SUPABASE_URL') ||
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  '';

const supabaseAnonKey =
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  '';

// Fail fast so you don’t get weird auth-js lock errors
if (!supabaseUrl) {
  throw new Error(
    'Missing Supabase URL. Set VITE_SUPABASE_URL (Vite) or NEXT_PUBLIC_SUPABASE_URL (Next).'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase anon key. Set VITE_SUPABASE_ANON_KEY (Vite) or NEXT_PUBLIC_SUPABASE_ANON_KEY (Next).'
  );
}

/**
 * Singleton client (prevents multiple auth listeners / locks issues)
 */
declare global {
  // eslint-disable-next-line no-var
  var __fgn_supabase__: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__fgn_supabase__ ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

if (!globalThis.__fgn_supabase__) {
  globalThis.__fgn_supabase__ = supabase;

  // Optional: safe debug message (no secrets)
  if (typeof window !== 'undefined') {
    console.log('🔌 Supabase client ready:', supabaseUrl);
  }
}

/* =========================
   Types (unchanged)
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
