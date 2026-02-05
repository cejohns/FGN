import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function SupabaseTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  const runTests = async () => {
    setStatus('testing');
    setMessage('Running diagnostics...');
    setDetails(null);

    try {
      const results: any = {};

      results.envVars = {
        url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      };

      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        results.sessionCheck = {
          success: !sessionError,
          error: sessionError?.message,
          hasSession: !!session?.session
        };
      } catch (err: any) {
        results.sessionCheck = {
          success: false,
          error: err.message
        };
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('count')
          .limit(1);

        results.tableAccess = {
          success: !error,
          error: error?.message,
          hint: error?.hint,
          details: error?.details
        };
      } catch (err: any) {
        results.tableAccess = {
          success: false,
          error: err.message
        };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

        results.authTest = {
          tested: true,
          error: error?.message,
          status: error?.status
        };
      } catch (err: any) {
        results.authTest = {
          tested: true,
          error: err.message
        };
      }

      setDetails(results);
      setStatus('success');
      setMessage('Diagnostics complete');
    } catch (err: any) {
      setStatus('error');
      setMessage(`Diagnostic failed: ${err.message}`);
      console.error('Diagnostic error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Supabase Connection Test</h1>

        <div className="bg-blue-950/50 border border-blue-500/50 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            This diagnostic tool tests your Supabase connection, environment variables, and authentication setup.
            Use this when troubleshooting login or database connection issues.
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={status === 'testing'}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg mb-6 disabled:opacity-50"
        >
          {status === 'testing' ? (
            <span className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Running Tests...
            </span>
          ) : (
            'Run Diagnostics'
          )}
        </button>

        {status === 'success' && (
          <div className="bg-green-950/50 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}

        {details && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Diagnostic Results</h2>
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
