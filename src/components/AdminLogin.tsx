import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Invalid email or password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-slate-950 rounded-xl shadow-lg shadow-cyan-500/10 border border-cyan-500/20 p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h2>
        <p className="text-gray-400 text-center mb-6">Sign in with your admin credentials</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="admin@example.com"
              disabled={loading}
              autoFocus
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-950/50 border border-red-500/50 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-xs text-gray-400">
            <strong>Secure Authentication:</strong> This admin panel uses Supabase Auth with encrypted password storage and JWT tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
