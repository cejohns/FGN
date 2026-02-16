'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Shield, LogOut, User, BarChart3, Users, FileText,
  Settings, Activity, Database, Search, Filter,
  TrendingUp, Eye, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';
import { NewsManagement, ReviewsManagement } from '@/components/ContentManagement';
import { GuidesManagement, VideosManagement, GalleryManagement } from '@/components/ContentManagement2';
import AuditLogDashboard from '@/components/AuditLogDashboard';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface DashboardStats {
  totalPosts: number;
  totalNews: number;
  totalReviews: number;
  totalGuides: number;
  totalVideos: number;
  totalGallery: number;
  totalReleases: number;
  recentActivity: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadAdminProfile(session.user.id);
      } else {
        setAdminUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && adminUser && activeTab === 'dashboard') {
      loadDashboardStats();
    }
  }, [user, adminUser, activeTab]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadAdminProfile(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const loadAdminProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAdminUser(data);
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [blogPosts, newsArticles, reviews, guides, videos, gallery, releases] = await Promise.all([
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('news_posts').select('id', { count: 'exact', head: true }),
        supabase.from('game_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('guides').select('id', { count: 'exact', head: true }),
        supabase.from('gaming_videos').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
        supabase.from('game_releases').select('id', { count: 'exact', head: true }),
      ]);

      const recentActivity = await supabase
        .from('admin_audit_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalPosts: blogPosts.count || 0,
        totalNews: newsArticles.count || 0,
        totalReviews: reviews.count || 0,
        totalGuides: guides.count || 0,
        totalVideos: videos.count || 0,
        totalGallery: gallery.count || 0,
        totalReleases: releases.count || 0,
        recentActivity: recentActivity.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdminUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-cyan-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Admin Portal
              </h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <AdminLogin />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-slate-400">Firestar Gaming Network</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                <User className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{adminUser.full_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{adminUser.role.replace('_', ' ')}</p>
                </div>
              </div>

              <a
                href="/"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                View Site
              </a>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('blog')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'blog'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Blog Posts</span>
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'news'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">News</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('guides')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'guides'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Guides</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'videos'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Videos</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Gallery</span>
            </button>

            <div className="border-t border-slate-700 my-2"></div>

            {adminUser.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'admins'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Admin Users</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView stats={stats} adminUser={adminUser} supabase={supabase} />
            )}

            {activeTab === 'blog' && (
              <BlogManagement supabase={supabase} />
            )}

            {activeTab === 'news' && (
              <NewsManagement
                supabase={supabase}
                onSuccess={() => {}}
                onError={() => {}}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsManagement
                supabase={supabase}
                onSuccess={() => {}}
                onError={() => {}}
              />
            )}

            {activeTab === 'guides' && (
              <GuidesManagement
                supabase={supabase}
                onSuccess={() => {}}
                onError={() => {}}
              />
            )}

            {activeTab === 'videos' && (
              <VideosManagement
                supabase={supabase}
                onSuccess={() => {}}
                onError={() => {}}
              />
            )}

            {activeTab === 'gallery' && (
              <GalleryManagement
                supabase={supabase}
                onSuccess={() => {}}
                onError={() => {}}
              />
            )}

            {activeTab === 'admins' && adminUser.role === 'super_admin' && (
              <AdminUsersManagement supabase={supabase} />
            )}

            {activeTab === 'audit' && (
              <AuditLogDashboard supabase={supabase} />
            )}

            {activeTab === 'settings' && (
              <SettingsView adminUser={adminUser} supabase={supabase} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardView({ stats, adminUser, supabase }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {adminUser.full_name}!</h2>
        <p className="text-slate-400">Here's what's happening with your content today.</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Blog Posts"
              value={stats.totalPosts}
              icon={<FileText className="w-6 h-6" />}
              gradient="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="News Articles"
              value={stats.totalNews}
              icon={<Activity className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Reviews"
              value={stats.totalReviews}
              icon={<Eye className="w-6 h-6" />}
              gradient="from-violet-500 to-purple-600"
            />
            <StatCard
              title="Activity (24h)"
              value={stats.recentActivity}
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="from-orange-500 to-red-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Guides"
              value={stats.totalGuides}
              icon={<Database className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-600"
            />
            <StatCard
              title="Videos"
              value={stats.totalVideos}
              icon={<Activity className="w-6 h-6" />}
              gradient="from-pink-500 to-rose-600"
            />
            <StatCard
              title="Gallery Images"
              value={stats.totalGallery}
              icon={<Eye className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-600"
            />
          </div>
        </>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton
            title="Sync Platform News"
            description="Import from PlayStation, Xbox, Nintendo"
            icon={<Activity className="w-5 h-5" />}
            onClick={async () => {
              await fetch(`${SUPABASE_URL}/functions/v1/sync-platform-news`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
              });
            }}
          />
          <QuickActionButton
            title="Sync Game Releases"
            description="Update from IGDB database"
            icon={<Database className="w-5 h-5" />}
            onClick={async () => {
              await fetch(`${SUPABASE_URL}/functions/v1/sync-game-releases?source=igdb&days=90`, {
                headers: {
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
              });
            }}
          />
          <QuickActionButton
            title="Sync YouTube News"
            description="Latest gaming channel updates"
            icon={<Activity className="w-5 h-5" />}
            onClick={async () => {
              await fetch(`${SUPABASE_URL}/functions/v1/sync-youtube-news`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ maxResults: 10 }),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: any) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`bg-gradient-to-r ${gradient} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ title, description, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 hover:border-cyan-500/50 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h4 className="text-white font-semibold mb-1">{title}</h4>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );
}

function BlogManagement({ supabase }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Blog Posts</h2>
          <p className="text-slate-400">Manage your blog content</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
        >
          Create New Post
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:outline-none"
          />
          <Filter className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            All Posts ({filteredPosts.length})
          </h3>
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{post.title}</h4>
                    <p className="text-slate-400 text-sm mb-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                        {post.category}
                      </span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      {post.is_featured && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsersManagement({ supabase }: any) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Admin Users</h2>
        <p className="text-slate-400">Manage administrator accounts and permissions</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {admin.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{admin.full_name}</div>
                        <div className="text-xs text-slate-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400 capitalize">
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ adminUser, supabase }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input
              type="text"
              value={adminUser.full_name}
              readOnly
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
            <input
              type="email"
              value={adminUser.email}
              readOnly
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
            <input
              type="text"
              value={adminUser.role.replace('_', ' ').toUpperCase()}
              readOnly
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white capitalize"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
        <p className="text-slate-400 text-sm mb-4">
          Your password is securely managed by Supabase Auth. Contact a super admin to reset your password.
        </p>
      </div>
    </div>
  );
}
