import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { NewsArticleForm, GameReviewForm, VideoForm, GalleryImageForm, BlogPostForm } from './ContentForms';

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-gaming-news`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch gaming news');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGameImages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-game-images`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update game images');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTwitchVideos = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-twitch-videos`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Twitch videos');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-950 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-600 mb-6">Manage automatic content updates and sync gaming news</p>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Manual Content Update</h2>
          <p className="text-gray-700 mb-4">
            Click the button below to fetch the latest gaming news from major gaming publications.
            This will populate your database with fresh, real news content.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-cyan-200">
            <h3 className="font-semibold text-white mb-2">News Sources:</h3>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
              <li>• <strong>IGN</strong> - Latest gaming news and articles</li>
              <li>• <strong>GameSpot</strong> - Breaking gaming news</li>
              <li>• <strong>Polygon</strong> - Gaming culture and news</li>
              <li>• <strong>PC Gamer</strong> - PC gaming news</li>
            </ul>
            <h3 className="font-semibold text-white mb-2">What will be fetched:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Real gaming news articles from RSS feeds</li>
              <li>• Recent game reviews with ratings (if RAWG API key provided)</li>
              <li>• Game screenshots for gallery (if RAWG API key provided)</li>
            </ul>
          </div>

          <button
            onClick={fetchGamingNews}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching Content...' : 'Fetch Latest Gaming News'}</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Fetch Twitch Gaming Videos</h2>
          <p className="text-gray-700 mb-4">
            Automatically fetch popular gaming clips and videos from Twitch for top games.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-purple-200">
            <h3 className="font-semibold text-white mb-2">What will be fetched:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Gaming Clips</strong> - Popular clips from top games</li>
              <li>• <strong>Gameplay Videos</strong> - Full gameplay videos and VODs</li>
              <li>• <strong>Trending Content</strong> - Videos from the most viewed games</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              Uses the Twitch API to fetch the latest gaming video content automatically.
            </p>
          </div>

          <button
            onClick={fetchTwitchVideos}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching Videos...' : 'Fetch Twitch Videos'}</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Update Game Images from IGDB</h2>
          <p className="text-gray-700 mb-4">
            Replace placeholder images with real game screenshots, cover art, and artwork from the IGDB database.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-green-200">
            <h3 className="font-semibold text-white mb-2">What will be updated:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Game Reviews</strong> - Official cover art for each game</li>
              <li>• <strong>News Articles</strong> - Game screenshots and artwork</li>
              <li>• <strong>Gallery</strong> - High-quality game screenshots</li>
              <li>• <strong>Videos</strong> - Game-specific thumbnails</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              This uses the IGDB API (powered by Twitch) to fetch official game images. Requires IGDB API credentials.
            </p>
          </div>

          <button
            onClick={updateGameImages}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Updating Images...' : 'Update Game Images'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <div className="mt-3 p-3 bg-slate-950 rounded border border-red-300">
                <p className="text-sm text-white font-medium mb-2">Note:</p>
                <p className="text-sm text-gray-700">
                  The news fetching works without any API keys. RSS feeds from IGN, GameSpot, Polygon, and PC Gamer are free and don't require authentication.
                  {error.includes('RAWG_API_KEY') && ' RAWG API key is optional and only needed for game reviews and screenshots.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Success!</h3>
                <p className="text-green-700 text-sm">{result.message}</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-white mb-3">
                {result.clips_added !== undefined ? 'Videos Fetched:' : result.results.news_articles !== undefined ? 'Content Added:' : 'Images Updated:'}
              </h4>
              {result.clips_added !== undefined ? (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-900">{result.clips_added}</div>
                    <div className="text-xs text-purple-700 font-medium">Gaming Clips</div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-violet-900">{result.videos_added}</div>
                    <div className="text-xs text-violet-700 font-medium">Gameplay Videos</div>
                  </div>
                </div>
              ) : result.results.news_articles !== undefined ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">{result.results.news_articles}</div>
                    <div className="text-xs text-blue-700 font-medium">News Articles</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-900">{result.results.game_reviews}</div>
                    <div className="text-xs text-purple-700 font-medium">Game Reviews</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-900">{result.results.videos}</div>
                    <div className="text-xs text-green-700 font-medium">Videos</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-orange-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-900">{result.results.gallery_images}</div>
                    <div className="text-xs text-cyan-700 font-medium">Gallery Images</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">{result.results.reviews_updated}</div>
                    <div className="text-xs text-blue-700 font-medium">Reviews</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-900">{result.results.news_updated}</div>
                    <div className="text-xs text-purple-700 font-medium">News</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-900">{result.results.gallery_updated}</div>
                    <div className="text-xs text-green-700 font-medium">Gallery</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-orange-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-900">{result.results.videos_updated}</div>
                    <div className="text-xs text-cyan-700 font-medium">Videos</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-pink-900">{result.results.blogs_updated}</div>
                    <div className="text-xs text-pink-700 font-medium">Blogs</div>
                  </div>
                </div>
              )}

              {result.results?.errors && result.results.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">Warnings:</p>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    {result.results.errors.slice(0, 5).map((err: string, idx: number) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">Warnings:</p>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    {result.errors.slice(0, 5).map((err: string, idx: number) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.timestamp && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Updated at: {new Date(result.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-bold text-white mb-3">About Automatic Updates</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Current Setup:</strong> The edge function fetches real news from major gaming publications via RSS feeds.
            </p>
            <p>
              <strong>News Sources:</strong> IGN, GameSpot, Polygon, and PC Gamer - No API keys required!
            </p>
            <p>
              <strong>Optional:</strong> Add RAWG API key to also fetch game reviews and screenshots (20,000 free requests/month)
            </p>
            <p>
              <strong>Recommendation:</strong> Run this manually or set up a cron job to run every 6-12 hours for fresh content
            </p>
            <p>
              <strong>No Rate Limits:</strong> RSS feeds are free and unlimited. You can fetch news as often as you like!
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Add Original Content</h2>
          <p className="text-gray-600 mb-6">Create and publish your own content across all sections</p>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'news' ? null : 'news')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">News Articles</h3>
                  <p className="text-sm text-gray-400">Add breaking gaming news and updates</p>
                </div>
                {expandedSection === 'news' ? (
                  <ChevronUp className="w-5 h-5 text-cyan-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSection === 'news' && (
                <div className="px-6 py-4 border-t border-slate-700">
                  <NewsArticleForm />
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'reviews' ? null : 'reviews')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">Game Reviews</h3>
                  <p className="text-sm text-gray-400">Write detailed game reviews with ratings</p>
                </div>
                {expandedSection === 'reviews' ? (
                  <ChevronUp className="w-5 h-5 text-cyan-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSection === 'reviews' && (
                <div className="px-6 py-4 border-t border-slate-700">
                  <GameReviewForm />
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'videos' ? null : 'videos')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">Videos</h3>
                  <p className="text-sm text-gray-400">Add video content and streams</p>
                </div>
                {expandedSection === 'videos' ? (
                  <ChevronUp className="w-5 h-5 text-cyan-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSection === 'videos' && (
                <div className="px-6 py-4 border-t border-slate-700">
                  <VideoForm />
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'gallery' ? null : 'gallery')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">Gallery Images</h3>
                  <p className="text-sm text-gray-400">Upload gaming screenshots and artwork</p>
                </div>
                {expandedSection === 'gallery' ? (
                  <ChevronUp className="w-5 h-5 text-cyan-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSection === 'gallery' && (
                <div className="px-6 py-4 border-t border-slate-700">
                  <GalleryImageForm />
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'blog' ? null : 'blog')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">Blog Posts & Vlogs</h3>
                  <p className="text-sm text-gray-400">Create blog posts and video blogs</p>
                </div>
                {expandedSection === 'blog' ? (
                  <ChevronUp className="w-5 h-5 text-cyan-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSection === 'blog' && (
                <div className="px-6 py-4 border-t border-slate-700">
                  <BlogPostForm />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
