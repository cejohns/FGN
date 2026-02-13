'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Eye, FileText, LogOut, User, Plus, Trash2 } from 'lucide-react';
import { NewsManagement, ReviewsManagement } from '@/components/ContentManagement';
import { GuidesManagement, VideosManagement, GalleryManagement } from '@/components/ContentManagement2';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  published_at: string;
  is_featured: boolean;
  post_type: string;
}

export default function AdminPage() {
  // ⚠️ TEMPORARY BYPASS - AUTHENTICATION DISABLED FOR TESTING ⚠️
  const [email] = useState('test@admin.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState('');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'General',
    status: 'draft',
    is_featured: false,
  });

  const supabase = createClient();

  // Test database connection on load
  useEffect(() => {
    testDatabaseConnection();
    loadBlogPosts();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('URL:', SUPABASE_URL);
      console.log('Anon Key:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');

      const { data, error: selectError } = await supabase
        .from('blog_posts')
        .select('id')
        .limit(1);

      if (selectError) {
        console.error('Database connection error:', selectError);
        setDbConnected(false);
        setError(`Database connection failed: ${selectError.message}`);
      } else {
        console.log('Database connection successful!', data);
        setDbConnected(true);
      }
    } catch (err: any) {
      console.error('Connection test error:', err);
      setDbConnected(false);
      setError(`Connection test failed: ${err.message}`);
    }
  };

  const loadBlogPosts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      setBlogPosts(data || []);
    } catch (err: any) {
      console.error('Error loading blog posts:', err);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleBlogFormChange = (field: string, value: any) => {
    setBlogForm(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'title' && !blogForm.slug) {
      setBlogForm(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const createBlogPost = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!blogForm.title || !blogForm.slug || !blogForm.excerpt || !blogForm.content) {
        throw new Error('Please fill in all required fields');
      }

      const newPost = {
        title: blogForm.title,
        slug: blogForm.slug,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        featured_image: blogForm.featured_image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        category: blogForm.category,
        author: 'Admin',
        post_type: 'blog',
        is_featured: blogForm.is_featured,
        published_at: blogForm.status === 'published' ? new Date().toISOString() : null,
      };

      console.log('Creating blog post:', newPost);

      const { data, error: insertError } = await supabase
        .from('blog_posts')
        .insert([newPost])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to create blog post: ${insertError.message}`);
      }

      console.log('Blog post created successfully:', data);
      setResult({ message: `Blog post "${blogForm.title}" created successfully!` });

      setBlogForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'General',
        status: 'draft',
        is_featured: false,
      });

      setShowBlogForm(false);
      await loadBlogPosts();
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setResult({ message: 'Blog post deleted successfully!' });
      await loadBlogPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchGamingNews = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-gaming-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        `${SUPABASE_URL}/functions/v1/sync-game-releases?source=${source}&days=90`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-platform-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
      const token = session?.access_token || SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-youtube-news`, {
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

          {/* Database Connection Status */}
          {dbConnected !== null && (
            <div className={`border rounded-lg p-4 flex items-center gap-3 ${
              dbConnected
                ? 'bg-green-900/20 border-green-800'
                : 'bg-red-900/20 border-red-800'
            }`}>
              {dbConnected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Database Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-semibold">Database Connection Failed</span>
                </>
              )}
            </div>
          )}

          {/* Blog Posts Management */}
          <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Blog Posts Management</h2>
                <p className="text-slate-300 text-sm">
                  Create and manage blog posts manually
                </p>
              </div>
              <button
                onClick={() => setShowBlogForm(!showBlogForm)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Post
              </button>
            </div>

            {/* Blog Creation Form */}
            {showBlogForm && (
              <div className="bg-slate-800/50 rounded-lg p-6 mb-4 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Create New Blog Post</h3>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => handleBlogFormChange('title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Enter blog post title"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={blogForm.slug}
                    onChange={(e) => handleBlogFormChange('slug', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="url-friendly-slug"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Excerpt <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={blogForm.excerpt}
                    onChange={(e) => handleBlogFormChange('excerpt', e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Brief summary of the blog post"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => handleBlogFormChange('content', e.target.value)}
                    rows={8}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Full blog post content (Markdown supported)"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={blogForm.featured_image}
                    onChange={(e) => handleBlogFormChange('featured_image', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave empty for default image</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={blogForm.category}
                      onChange={(e) => handleBlogFormChange('category', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="General">General</option>
                      <option value="Opinion">Opinion</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Community">Community</option>
                      <option value="News">News</option>
                      <option value="Review">Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={blogForm.status}
                      onChange={(e) => handleBlogFormChange('status', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={blogForm.is_featured}
                    onChange={(e) => handleBlogFormChange('is_featured', e.target.checked)}
                    className="w-4 h-4 bg-slate-900 border border-slate-700 rounded"
                  />
                  <label htmlFor="is_featured" className="text-slate-300 text-sm">
                    Feature on homepage
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createBlogPost}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Blog Post'}
                  </button>
                  <button
                    onClick={() => setShowBlogForm(false)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Blog Posts List */}
            {blogPosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Recent Blog Posts ({blogPosts.length})</h3>
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{post.title}</h4>
                      <p className="text-slate-400 text-sm">
                        {post.category} • {new Date(post.published_at).toLocaleDateString()}
                        {post.is_featured && (
                          <span className="ml-2 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBlogPost(post.id)}
                      className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* News Articles Management */}
          <NewsManagement
            supabase={supabase}
            onSuccess={(msg) => setResult({ message: msg })}
            onError={(msg) => setError(msg)}
          />

          {/* Game Reviews Management */}
          <ReviewsManagement
            supabase={supabase}
            onSuccess={(msg) => setResult({ message: msg })}
            onError={(msg) => setError(msg)}
          />

          {/* Guides & Tutorials Management */}
          <GuidesManagement
            supabase={supabase}
            onSuccess={(msg) => setResult({ message: msg })}
            onError={(msg) => setError(msg)}
          />

          {/* Videos Management */}
          <VideosManagement
            supabase={supabase}
            onSuccess={(msg) => setResult({ message: msg })}
            onError={(msg) => setError(msg)}
          />

          {/* Gallery Management */}
          <GalleryManagement
            supabase={supabase}
            onSuccess={(msg) => setResult({ message: msg })}
            onError={(msg) => setError(msg)}
          />

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
