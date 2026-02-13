'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Eye, FileText, LogOut, User } from 'lucide-react';

export default function AdminPage() {
  // ⚠️ TEMPORARY BYPASS - AUTHENTICATION DISABLED FOR TESTING ⚠️
  const [email] = useState('test@admin.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState('');

  const supabase = createClient();

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-gaming-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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

  const syncReleases = async (source: 'demo' | 'igdb' | 'rawg' = 'demo') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-game-releases?source=${source}&days=90`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-platform-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-youtube-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 text-sm">{email}</span>
              </div>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* WARNING BANNER */}
      <div className="bg-amber-500/20 border-y border-amber-500/50">
        <div className="container mx-auto px-4 py-3">
          <p className="text-amber-300 text-center font-semibold">
            ⚠️ AUTHENTICATION TEMPORARILY DISABLED FOR TESTING - DO NOT USE IN PRODUCTION ⚠️
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Game Releases Management */}
          <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">Game Releases Management</h2>
            <p className="text-slate-300 mb-4">
              Manage upcoming game releases. Load demo data or sync with IGDB/RAWG APIs.
            </p>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => syncReleases('demo')}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Load Demo Data'}</span>
              </button>
              <button
                onClick={() => syncReleases('igdb')}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Sync IGDB'}</span>
              </button>
              <button
                onClick={() => syncReleases('rawg')}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Sync RAWG'}</span>
              </button>
            </div>
          </div>

          {/* Platform News Sync */}
          <div className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border border-indigo-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">Sync Platform News (RSS)</h2>
            <p className="text-slate-300 mb-4">
              Import official news from PlayStation, Xbox, and Nintendo RSS feeds.
            </p>
            <button
              onClick={syncPlatformNews}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Platform News'}</span>
            </button>
          </div>

          {/* YouTube News Sync */}
          <div className="bg-gradient-to-r from-rose-900/20 to-pink-900/20 border border-rose-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">Sync YouTube Channel News</h2>
            <p className="text-slate-300 mb-4">
              Import latest videos from official gaming YouTube channels.
            </p>
            <button
              onClick={syncYouTubeNews}
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync YouTube News'}</span>
            </button>
          </div>

          {/* Gaming News */}
          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">Manual Content Update</h2>
            <p className="text-slate-300 mb-4">
              Fetch the latest gaming news from major gaming publications.
            </p>
            <button
              onClick={fetchGamingNews}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Fetching...' : 'Fetch Latest Gaming News'}</span>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-400 mb-1">Success!</h3>
                  <p className="text-green-300 text-sm">{result.message}</p>
                </div>
              </div>
              {result.inserted !== undefined && (
                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-400">{result.inserted}</div>
                    <div className="text-xs text-slate-400">New Releases</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{result.updated || 0}</div>
                    <div className="text-xs text-slate-400">Updated</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">{result.fetched || 0}</div>
                    <div className="text-xs text-slate-400">Total Fetched</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
