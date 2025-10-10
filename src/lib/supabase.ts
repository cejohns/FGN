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
