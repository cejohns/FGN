import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  published_at: string;
  view_count: number;
  is_featured: boolean;
}

export interface GameReview {
  id: string;
  game_title: string;
  slug: string;
  game_cover: string;
  platform: string;
  genre: string;
  developer: string;
  publisher: string;
  release_date: string;
  rating: number;
  excerpt: string;
  content: string;
  reviewer: string;
  published_at: string;
  view_count: number;
  is_featured: boolean;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail: string;
  category: string;
  duration: string;
  creator: string;
  published_at: string;
  view_count: number;
  is_featured: boolean;
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
  post_type: 'blog' | 'vlog';
  video_url: string;
  category: string;
  author: string;
  published_at: string;
  view_count: number;
  is_featured: boolean;
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
