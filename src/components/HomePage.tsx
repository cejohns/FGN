import { useEffect, useState } from 'react';
import { supabase, NewsArticle, GameReview, Video, BlogPost } from '../lib/supabase';
import { Clock, Eye, Star, Play, BookOpen } from 'lucide-react';
import { useSEO, pageSEO } from '../lib/seo';
import ImageWithFallback from './ImageWithFallback';

interface HomePageProps {
  onNavigate: (section: string, id?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  useSEO(pageSEO.home);

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-fs-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="bg-fs-dark py-12 -mt-6 -mx-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                <span className="bg-gradient-to-b from-fs-silverLight via-fs-silverMid to-fs-silverDark bg-clip-text text-transparent">
                  Dragon-Powered Gaming Coverage
                </span>
              </h1>
              <p className="text-fs-muted mb-6 text-lg leading-relaxed">
                FireStar Gaming Network brings you news, honest reviews, dev-focused tutorials,
                and cinematic playthroughs—all wrapped in a high-energy esports vibe.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => onNavigate('news')}
                  className="px-6 py-3 rounded-full bg-fs-blue text-fs-dark font-semibold hover:bg-fs-blueStrong transition-colors"
                >
                  Read Latest News
                </button>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="px-6 py-3 rounded-full border border-fs-blue text-fs-blue hover:bg-fs-panel transition-colors"
                >
                  Browse Reviews
                </button>
              </div>

              <div className="text-xs uppercase tracking-wide text-fs-muted">
                Updated regularly • Indie & AAA • Esports & dev culture
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-full blur-3xl opacity-40"
                  style={{
                    background: 'radial-gradient(circle, #7BE8FF 0%, transparent 70%)',
                  }}
                />
                <img
                  src="/FGNLogo.png"
                  alt="FireStar Dragon Logo"
                  className="relative h-48 md:h-64 w-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredNews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-fs-text">Featured News</h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-fs-blue hover:text-fs-blueStrong font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredNews.map((article) => (
              <button
                key={article.id}
                onClick={() => onNavigate('news', article.id)}
                className="group bg-fs-panel rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left border border-fs-dark hover:border-fs-blue"
              >
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={article.featured_image || article.cover_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-fs-blue uppercase tracking-wide">{article.category || 'News'}</span>
                  <h3 className="text-xl font-bold text-fs-text mt-2 mb-2 group-hover:text-fs-blue transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-fs-muted text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-fs-silverDark">
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
                    <span className="font-medium">{article.author || 'FireStar'}</span>
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
            <h2 className="text-3xl font-bold text-fs-text">Top Reviews</h2>
            <button
              onClick={() => onNavigate('reviews')}
              className="text-fs-blue hover:text-fs-blueStrong font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredReviews.map((review) => (
              <button
                key={review.id}
                onClick={() => onNavigate('reviews', review.id)}
                className="group bg-fs-panel rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left border border-fs-dark hover:border-fs-blue"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <ImageWithFallback
                    src={review.game_cover || review.cover_image_url}
                    alt={review.game_title || review.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-fs-blue text-fs-dark px-3 py-1 rounded-full flex items-center space-x-1 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{review.rating || review.score}</span>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-fs-blue uppercase tracking-wide">{review.genre || 'Review'}</span>
                  <h3 className="text-xl font-bold text-fs-text mt-2 mb-2 group-hover:text-fs-blue transition-colors line-clamp-2">
                    {review.game_title || review.title}
                  </h3>
                  <p className="text-fs-muted text-sm mb-3 line-clamp-2">{review.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-fs-silverDark">
                    <span>{review.platform || 'Multi-platform'}</span>
                    <span className="font-medium">{review.reviewer || 'FireStar'}</span>
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
            <h2 className="text-3xl font-bold text-fs-text">Featured Videos</h2>
            <button
              onClick={() => onNavigate('videos')}
              className="text-fs-blue hover:text-fs-blueStrong font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => onNavigate('videos', video.id)}
                className="group bg-fs-panel rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left border border-fs-dark hover:border-fs-blue"
              >
                <div className="aspect-video overflow-hidden relative">
                  <ImageWithFallback
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="w-16 h-16 bg-fs-blue rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 text-fs-dark fill-current ml-1" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-medium">
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-fs-blue uppercase tracking-wide">{video.category}</span>
                  <h3 className="text-xl font-bold text-fs-text mt-2 mb-2 group-hover:text-fs-blue transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-fs-silverDark mt-3">
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
            <h2 className="text-3xl font-bold text-fs-text">Latest from the Blog</h2>
            <button
              onClick={() => onNavigate('blog')}
              className="text-fs-blue hover:text-fs-blueStrong font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestBlogs.map((post) => (
              <button
                key={post.id}
                onClick={() => onNavigate('blog', post.id)}
                className="group bg-fs-panel rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left border border-fs-dark hover:border-fs-blue"
              >
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={post.featured_image || post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-fs-blue" />
                    <span className="text-xs font-semibold text-fs-blue uppercase tracking-wide">
                      {post.post_type === 'vlog' ? 'Vlog' : 'Blog'}
                    </span>
                    <span className="text-xs text-fs-muted">•</span>
                    <span className="text-xs text-fs-silverDark">{post.category || 'General'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-fs-text mb-2 group-hover:text-fs-blue transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-fs-muted text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-fs-silverDark">
                    <span className="font-medium">{post.author || 'FireStar'}</span>
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
