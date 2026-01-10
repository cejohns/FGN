import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Eye, FileText, Clock, LogOut, User } from 'lucide-react';
import { NewsArticleForm, GameReviewForm, VideoForm, GalleryImageForm, BlogPostForm, GuideForm } from './ContentForms';
import ReleaseCalendarPage from './ReleaseCalendarPage';
import DraftPreview from './DraftPreview';
import { useAuth } from '../lib/auth';

export default function AdminPanel() {
  const { adminUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-gaming-news`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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

  const fetchSteamContent = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-steam-content`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Steam content');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const generateAIContent = async (type: 'news' | 'review' | 'blog' | 'video' | 'gallery', count: number = 1) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-content`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          topic: aiTopic || undefined,
          count,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI content');
      }

      setResult(data);
      setAiTopic('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncReleases = async (source: 'igdb' | 'rawg' | 'demo' = 'demo') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/sync-game-releases?source=${source}&days=90`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to sync releases');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncPlatformNews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-platform-news`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync platform news');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncYouTubeNews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-youtube-news`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxResults: 10 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync YouTube news');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMixedContent = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const totalCreated = { news: 0, review: 0, blog: 0 };
    const allErrors: string[] = [];

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-content`;

      const types: Array<{ type: 'news' | 'review' | 'blog', count: number }> = [
        { type: 'news', count: 2 },
        { type: 'review', count: 1 },
        { type: 'blog', count: 2 },
      ];

      for (const { type, count } of types) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type,
              topic: aiTopic || undefined,
              count,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            totalCreated[type] = data.created || 0;
            if (data.errors) {
              allErrors.push(...data.errors);
            }
          } else {
            allErrors.push(`${type}: ${data.error || 'Failed to generate'}`);
          }
        } catch (err: any) {
          allErrors.push(`${type}: ${err.message}`);
        }
      }

      const totalItems = Object.values(totalCreated).reduce((a, b) => a + b, 0);

      setResult({
        created: totalItems,
        items: [],
        errors: allErrors,
        message: `Generated ${totalItems} items: ${totalCreated.news} news, ${totalCreated.review} reviews, ${totalCreated.blog} blogs`,
      });
      setAiTopic('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showDrafts) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <DraftPreview onBack={() => setShowDrafts(false)} />
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto mb-6">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            ← Back to Admin
          </button>
        </div>
        <div className="max-w-7xl mx-auto">
          <ReleaseCalendarPage onBack={() => setShowPreview(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-950 rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage automatic content updates and sync gaming news</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDrafts(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition-all"
              >
                <FileText className="w-5 h-5" />
                <span>Review Drafts</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2 rounded-full">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="text-white font-semibold">{adminUser?.full_name}</p>
                <p className="text-xs text-gray-500">{adminUser?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Game Releases Management</h2>
          <p className="text-gray-700 mb-4">
            Manage upcoming game releases for the GX Corner section. Load demo data or sync with IGDB/RAWG APIs.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-red-200">
            <h3 className="font-semibold text-white mb-2">What will be synced:</h3>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
              <li>• <strong>Game Covers</strong> - Official cover art from IGDB</li>
              <li>• <strong>Release Dates</strong> - Accurate release dates for upcoming games</li>
              <li>• <strong>Game Details</strong> - Developer, publisher, genre, platform info</li>
              <li>• <strong>Screenshots</strong> - Banner images and screenshots</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              Demo data includes 8 curated upcoming games. IGDB/RAWG sync requires API credentials.
            </p>
          </div>

          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-green-800 mb-1">Automated Daily Sync Active</p>
              <p className="text-green-700">
                Game releases automatically sync every day at <strong>3:00 AM UTC</strong> (11:00 PM EST / 8:00 PM PST).
                Manual sync buttons below are for immediate updates.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => syncReleases('demo')}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Load Demo Data'}</span>
            </button>
            <button
              onClick={() => syncReleases('igdb')}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync IGDB'}</span>
            </button>
            <button
              onClick={() => syncReleases('rawg')}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync RAWG'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 border border-red-300"
          >
            <Eye className="w-5 h-5" />
            <span>Preview Release Calendar</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Sync Platform News (RSS)</h2>
          <p className="text-gray-700 mb-4">
            Import official news from PlayStation, Xbox, and Nintendo directly from their RSS feeds.
            Creates unified news posts with automatic deduplication.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-indigo-200">
            <h3 className="font-semibold text-white mb-2">Platform Sources:</h3>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
              <li>• <strong>PlayStation</strong> - blog.playstation.com</li>
              <li>• <strong>Xbox</strong> - news.xbox.com</li>
              <li>• <strong>Nintendo</strong> - Configured via NINTENDO_FEED_URL env variable</li>
            </ul>
            <h3 className="font-semibold text-white mb-2">Features:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Automatic classification (game updates vs announcements)</li>
              <li>• Deduplication by source URL</li>
              <li>• Extracts images, excerpts, and full content</li>
              <li>• Stores in unified news_posts table</li>
            </ul>
          </div>

          <button
            onClick={syncPlatformNews}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing Platform News...' : 'Sync Platform News'}</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Sync YouTube Channel News</h2>
          <p className="text-gray-700 mb-4">
            Import latest videos from official gaming YouTube channels (PlayStation, Xbox, Nintendo).
            All videos are converted to studio announcement posts with automatic deduplication.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-rose-200">
            <h3 className="font-semibold text-white mb-2">YouTube Channels:</h3>
            <ul className="text-sm text-gray-700 space-y-1 mb-3">
              <li>• <strong>PlayStation</strong> - Official PlayStation channel</li>
              <li>• <strong>Xbox</strong> - Official Xbox channel</li>
              <li>• <strong>Nintendo</strong> - Official Nintendo channel</li>
            </ul>
            <h3 className="font-semibold text-white mb-2">Features:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Fetches latest 10 videos per channel</li>
              <li>• Extracts video titles, descriptions, and thumbnails</li>
              <li>• Creates studio-announcement type posts</li>
              <li>• Deduplication by video URL</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              Requires YouTube Data API v3 key (YOUTUBE_API_KEY environment variable)
            </p>
          </div>

          <button
            onClick={syncYouTubeNews}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing YouTube Videos...' : 'Sync YouTube News'}</span>
          </button>
        </div>

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

        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Fetch Steam Content</h2>
          <p className="text-gray-700 mb-4">
            Get official game data, screenshots, videos, and news from Steam for top games.
          </p>

          <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-blue-200">
            <h3 className="font-semibold text-white mb-2">What will be fetched:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Game Reviews</strong> - Top games with Metacritic scores</li>
              <li>• <strong>Screenshots</strong> - Official game screenshots</li>
              <li>• <strong>Videos</strong> - Game trailers and videos</li>
              <li>• <strong>News</strong> - Latest game news from Steam</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              Uses Steam's public API. No API key required.
            </p>
          </div>

          <button
            onClick={fetchSteamContent}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching Steam Content...' : 'Fetch Steam Content'}</span>
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
                {result.imported !== undefined && result.imported.playstation !== undefined ? 'Platform News Synced (RSS):' :
                 result.imported !== undefined && result.totalChannels !== undefined ? 'YouTube Videos Synced:' :
                 result.inserted !== undefined && result.updated !== undefined ? 'Releases Synced:' :
                 result.created !== undefined && result.items !== undefined ? 'AI Content Generated:' :
                 result.clips_added !== undefined ? 'Videos Fetched:' :
                 result.reviews_added !== undefined && result.news_added !== undefined ? 'Content Fetched:' :
                 result.results?.news_articles !== undefined ? 'Content Added:' :
                 result.results?.reviews_updated !== undefined ? 'Images Updated:' : 'Success!'}
              </h4>
              {result.imported !== undefined && result.imported.playstation !== undefined ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">{result.imported.playstation.inserted}</div>
                    <div className="text-xs text-blue-700 font-medium">PlayStation</div>
                    <div className="text-xs text-gray-600 mt-1">{result.imported.playstation.skipped} skipped</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-900">{result.imported.xbox.inserted}</div>
                    <div className="text-xs text-green-700 font-medium">Xbox</div>
                    <div className="text-xs text-gray-600 mt-1">{result.imported.xbox.skipped} skipped</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-900">{result.imported.nintendo.inserted}</div>
                    <div className="text-xs text-red-700 font-medium">Nintendo</div>
                    <div className="text-xs text-gray-600 mt-1">{result.imported.nintendo.skipped} skipped</div>
                  </div>
                </div>
              ) : result.imported !== undefined && result.totalChannels !== undefined ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-rose-900">{result.imported.playstation?.inserted || 0}</div>
                    <div className="text-xs text-rose-700 font-medium">PlayStation</div>
                    <div className="text-xs text-gray-600 mt-1">{result.imported.playstation?.skipped || 0} skipped</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-pink-900">{result.imported.xbox?.inserted || 0}</div>
                    <div className="text-xs text-pink-700 font-medium">Xbox</div>
                    <div className="text-xs text-gray-600 mt-1">{result.imported.xbox?.skipped || 0} skipped</div>
                  </div>
                  <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-fuchsia-900">{result.imported.nintendo?.inserted || 0}</div>
                    <div className="text-xs text-fuchsia-700 font-medium">Nintendo</div>
                    <div className="text-xs text-gray-600 mt-1">{result.imported.nintendo?.skipped || 0} skipped</div>
                  </div>
                </div>
              ) : result.inserted !== undefined && result.updated !== undefined ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-900">{result.inserted}</div>
                    <div className="text-xs text-red-700 font-medium">New Releases</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-pink-900">{result.updated}</div>
                    <div className="text-xs text-pink-700 font-medium">Updated</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-900">{result.fetched || 0}</div>
                    <div className="text-xs text-purple-700 font-medium">Total Fetched</div>
                  </div>
                </div>
              ) : result.created !== undefined && result.items !== undefined ? (
                <div>
                  <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-lg p-4 text-center mb-4">
                    <div className="text-3xl font-bold text-violet-900">{result.created}</div>
                    <div className="text-sm text-violet-700 font-medium">Items Created</div>
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">Warnings:</p>
                      <ul className="text-xs text-yellow-800 space-y-1">
                        {result.errors.slice(0, 5).map((err: string, idx: number) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : result.clips_added !== undefined ? (
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
              ) : result.reviews_added !== undefined && result.news_added !== undefined ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-900">{result.reviews_added}</div>
                    <div className="text-xs text-blue-700 font-medium">Reviews</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-900">{result.gallery_added}</div>
                    <div className="text-xs text-green-700 font-medium">Gallery Images</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-900">{result.videos_added}</div>
                    <div className="text-xs text-purple-700 font-medium">Videos</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-900">{result.news_added}</div>
                    <div className="text-xs text-cyan-700 font-medium">News</div>
                  </div>
                </div>
              ) : result.results?.news_articles !== undefined ? (
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
          <h2 className="text-2xl font-bold text-white mb-4">Generate AI Content</h2>
          <p className="text-gray-600 mb-6">Use AI to automatically create unique gaming content</p>

          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-3">AI Content Generator</h3>
            <p className="text-gray-700 mb-4 text-sm">
              Generate original gaming content using AI. Optionally specify a topic or leave blank for random content.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Topic (Optional)</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., Elden Ring, Call of Duty, Gaming PCs..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank for AI to choose a random gaming topic</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => generateAIContent('news', 3)}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Generate 3 News
              </button>
              <button
                onClick={() => generateAIContent('review', 2)}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Generate 2 Reviews
              </button>
              <button
                onClick={() => generateAIContent('blog', 3)}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Generate 3 Blogs
              </button>
              <button
                onClick={() => generateAIContent('video', 3)}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Generate 3 Videos
              </button>
              <button
                onClick={() => generateAIContent('gallery', 3)}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Generate 3 Gallery
              </button>
              <button
                onClick={generateMixedContent}
                disabled={loading}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Generating...' : 'Generate Mixed'}
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded border border-violet-200">
              <p className="text-xs text-gray-400">
                <strong>Note:</strong> AI content generation requires an OpenRouter API key. Content is unique and original but should be reviewed before publishing.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Add Manual Content</h2>
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

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'guides' ? null : 'guides')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">Guides & Tutorials</h3>
                  <p className="text-sm text-gray-400">Create gaming tips, game dev guides, and tech tutorials</p>
                </div>
                {expandedSection === 'guides' ? (
                  <ChevronUp className="w-5 h-5 text-cyan-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSection === 'guides' && (
                <div className="px-6 py-4 border-t border-slate-700">
                  <GuideForm />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
