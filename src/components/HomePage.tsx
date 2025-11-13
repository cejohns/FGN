import { useEffect, useState } from 'react';
import { supabase, NewsArticle, GameReview, Video, BlogPost } from '../lib/supabase';
import { Clock, Eye, Star, Play, BookOpen } from 'lucide-react';

interface HomePageProps {
  onNavigate: (section: string, id?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<GameReview[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const [newsRes, reviewsRes, videosRes, blogsRes] = await Promise.all([
        supabase.from('news_articles').select('*').eq('status', 'published').eq('is_featured', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('game_reviews').select('*').eq('status', 'published').eq('is_featured', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('videos').select('*').eq('status', 'published').eq('is_featured', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
      ]);

      if (newsRes.data) setFeaturedNews(newsRes.data);
      if (reviewsRes.data) setFeaturedReviews(reviewsRes.data);
      if (videosRes.data) setFeaturedVideos(videosRes.data);
      if (blogsRes.data) setLatestBlogs(blogsRes.data);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20 -mt-6 -mx-4 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome to FireStar Gaming Network
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your ultimate destination for gaming news, reviews, videos, and community content
          </p>
        </div>
      </section>

      {featuredNews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Featured News</h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredNews.map((article) => (
              <button
                key={article.id}
                onClick={() => onNavigate('news', article.id)}
                className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">{article.category}</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(article.published_at)}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {article.view_count}
                      </span>
                    </div>
                    <span className="font-medium">{article.author}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {featuredReviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Top Reviews</h2>
            <button
              onClick={() => onNavigate('reviews')}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredReviews.map((review) => (
              <button
                key={review.id}
                onClick={() => onNavigate('reviews', review.id)}
                className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={review.game_cover}
                    alt={review.game_title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-cyan-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{review.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">{review.genre}</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {review.game_title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{review.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{review.platform}</span>
                    <span className="font-medium">{review.reviewer}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {featuredVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Featured Videos</h2>
            <button
              onClick={() => onNavigate('videos')}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => onNavigate('videos', video.id)}
                className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
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
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span className="font-medium">{video.creator}</span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {video.view_count}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {latestBlogs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Latest from the Blog</h2>
            <button
              onClick={() => onNavigate('blog')}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestBlogs.map((post) => (
              <button
                key={post.id}
                onClick={() => onNavigate('blog', post.id)}
                className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                      {post.post_type === 'vlog' ? 'Vlog' : 'Blog'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{post.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">{post.author}</span>
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
