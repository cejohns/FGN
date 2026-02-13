'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (adminUser && adminUser.is_active) {
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!adminUser) {
        setError('Invalid admin credentials');
        return;
      }

      if (!adminUser.is_active) {
        setError('Admin account is inactive');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Invalid email or password');
        return;
      }

      await supabase.from('admin_users').update({
        last_login: new Date().toISOString(),
      }).eq('email', email);

      setIsLoggedIn(true);
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fs-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-fs-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-fs-panel border border-fs-dark rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-cyan-500/10 p-4 rounded-full">
                <Shield className="w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-white mb-2">
              Admin Login
            </h1>
            <p className="text-center text-slate-400 mb-8">
              Access the FireStar Gaming Network admin panel
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-fs-dark border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="admin@firestar.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-fs-dark border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fs-dark">
      <header className="bg-fs-panel border-b border-fs-dark">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">{email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-fs-panel border border-fs-dark rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Content Management</h3>
            <p className="text-slate-400 text-sm mb-4">Manage blog posts, news, reviews, and guides</p>
            <a
              href="/"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Go to full admin panel →
            </a>
          </div>

          <div className="bg-fs-panel border border-fs-dark rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Media Library</h3>
            <p className="text-slate-400 text-sm mb-4">Upload and manage images and videos</p>
            <a
              href="/"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Access gallery →
            </a>
          </div>

          <div className="bg-fs-panel border border-fs-dark rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">System Monitoring</h3>
            <p className="text-slate-400 text-sm mb-4">View logs, cron jobs, and analytics</p>
            <a
              href="/"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              View dashboard →
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">Quick Access</h2>
          <p className="text-slate-300 mb-4">
            For the full admin panel with all content management features, use the keyboard shortcut{' '}
            <kbd className="px-2 py-1 bg-fs-dark border border-slate-700 rounded text-cyan-400 font-mono text-sm">
              Ctrl + Shift + A
            </kbd>{' '}
            on the main site, or access it via the home page after logging in here.
          </p>
          <div className="flex gap-3">
            <a
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Go to Main Site
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
