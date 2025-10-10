import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    setTimeout(() => {
      if (password === adminPassword) {
        sessionStorage.setItem('adminAuth', 'true');
        onLogin();
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
      setLoading(false);
    }, 500);
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
        <p className="text-gray-400 text-center mb-6">Enter your password to continue</p>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter admin password"
              disabled={loading}
              autoFocus
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
            disabled={loading || !password}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-xs text-gray-400">
            <strong>Note:</strong> To set a custom password, add <code className="bg-slate-800 px-1 rounded">VITE_ADMIN_PASSWORD</code> to your .env file.
          </p>
        </div>
      </div>
    </div>
  );
}
