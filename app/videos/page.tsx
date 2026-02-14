import { createServerSupabaseClient } from '@/lib/supabase/server';
import Header from '../components/Header';
import Image from 'next/image';
import { Play, Clock, Eye } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail: string;
  category: string;
  published_at: string;
  view_count: number;
}

async function getVideos() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('videos')
    .select('id, title, slug, description, video_url, thumbnail, category, published_at, view_count')
    .order('published_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return (data || []) as Video[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatViewCount(count: number) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'review':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'gameplay':
      return 'bg-blue-500/20 text-blue-400';
    case 'tutorial':
      return 'bg-green-500/20 text-green-400';
    case 'news':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="videos" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Gaming Videos
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Watch gameplay, reviews, tutorials, and more from our gaming video library. Subscribe to stay updated with our latest content.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16">
            <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No videos available yet. Check back soon for exciting gaming content!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <article
                key={video.id}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-16 h-16 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                    <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(video.published_at)}</span>
                    </div>
                    {video.view_count > 0 && (
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Eye className="w-4 h-4" />
                        <span>{formatViewCount(video.view_count)}</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2">
                    {video.title}
                  </h2>

                  <p className="text-slate-300 text-sm line-clamp-2 mb-4">{video.description}</p>

                  {video.category && (
                    <span className={`inline-block px-2 py-1 rounded text-xs uppercase font-medium ${getCategoryColor(video.category)}`}>
                      {video.category}
                    </span>
                  )}
                </div>
              </article>
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
