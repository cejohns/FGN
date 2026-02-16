import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof window !== 'undefined' && (window as any).VITE_SUPABASE_URL
  ? (window as any).VITE_SUPABASE_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyfzxamsobywypoyocwz.supabase.co';

const supabaseAnonKey = typeof window !== 'undefined' && (window as any).VITE_SUPABASE_ANON_KEY
  ? (window as any).VITE_SUPABASE_ANON_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw';

if (typeof window !== 'undefined') {
  console.log('🔌 Supabase Client Initialized');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? '✓ Present' : '✗ Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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
  updated_at: string;
}
