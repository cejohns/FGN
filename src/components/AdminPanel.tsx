import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
              <h4 className="font-semibold text-white mb-3">Content Added:</h4>
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

              {result.results.errors && result.results.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">Warnings:</p>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    {result.results.errors.slice(0, 5).map((err: string, idx: number) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                Updated at: {new Date(result.timestamp).toLocaleString()}
              </p>
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
      </div>
    </div>
  );
}
