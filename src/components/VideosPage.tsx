import { useEffect, useState } from 'react';
import { supabase, Video } from '../lib/supabase';
import { Play, Eye, ArrowLeft, Clock, Filter } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface VideosPageProps {
  selectedVideoId?: string;
  onBack: () => void;
}

export default function VideosPage({ selectedVideoId, onBack }: VideosPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (selectedVideoId) {
      fetchVideoById(selectedVideoId);
    } else {
      fetchAllVideos();
    }
  }, [selectedVideoId]);

  const fetchAllVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoById = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedVideo(data);
        await supabase
          .from('videos')
          .update({ view_count: data.view_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Videos</span>
        </button>

        <article className="bg-slate-950 rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video bg-slate-900">
            <iframe
              src={selectedVideo.video_url}
              title={selectedVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                {selectedVideo.category}
              </span>
              {selectedVideo.duration && (
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedVideo.duration}
                </span>
              )}
              <span className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {selectedVideo.view_count} views
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">{selectedVideo.title}</h1>

            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedVideo.creator.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-white">{selectedVideo.creator}</p>
                <p className="text-sm text-gray-500">Published on {formatDate(selectedVideo.published_at)}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedVideo.description}</p>
            </div>
          </div>
        </article>
      </div>
    );
  }

  const categories = ['All', 'Gaming', 'Game Development', 'Technology', 'Gameplay', 'Reviews', 'Tutorials', 'News', 'Esports', 'Streaming'];

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter(video => video.category === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gaming Videos</h1>
        <p className="text-gray-600">Watch gameplay, reviews, news coverage, and more</p>
      </div>

      <div className="mb-6 flex items-center space-x-4 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">No videos available in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => fetchVideoById(video.id)}
              className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="aspect-video overflow-hidden relative">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-medium">
                    {video.duration}
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">{video.category}</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-3">
                  <span className="font-medium">{video.creator}</span>
                  <span className="flex items-center text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    {video.view_count}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
