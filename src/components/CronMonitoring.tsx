import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, AlertCircle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

interface CronStatus {
  function_name: string;
  execution_status: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  records_processed: number;
  error_message: string;
  created_at: string;
}

interface CronStats {
  function_name: string;
  total_executions: number;
  successful: number;
  failed: number;
  timeouts: number;
  avg_duration_ms: number;
  last_execution: string;
  success_rate: number;
}

interface CronFailure {
  function_name: string;
  execution_status: string;
  started_at: string;
  error_message: string;
  error_details: Record<string, unknown>;
  created_at: string;
}

export default function CronMonitoring() {
  const [latestStatus, setLatestStatus] = useState<CronStatus[]>([]);
  const [stats, setStats] = useState<CronStats[]>([]);
  const [recentFailures, setRecentFailures] = useState<CronFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchCronData();
    const interval = setInterval(fetchCronData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCronData = async () => {
    try {
      const [statusRes, statsRes, failuresRes] = await Promise.all([
        supabase.from('cron_latest_status').select('*').order('created_at', { ascending: false }),
        supabase.from('cron_execution_stats').select('*'),
        supabase.from('cron_recent_failures').select('*').limit(10),
      ]);

      if (statusRes.data) setLatestStatus(statusRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (failuresRes.data) setRecentFailures(failuresRes.data);

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching cron data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'failure':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'timeout':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failure':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'timeout':
        return <Clock className="w-5 h-5 text-orange-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Cron Job Monitoring</h1>
            <p className="text-gray-400 text-sm">Track automated task execution and health</p>
          </div>
        </div>

        <button
          onClick={fetchCronData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="text-sm text-gray-400 mb-6">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.function_name} className="bg-slate-900 rounded-lg border border-slate-700 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{stat.function_name}</h3>
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl font-bold text-white">{stat.success_rate}%</div>
              <TrendingUp className={`w-6 h-6 ${stat.success_rate >= 90 ? 'text-green-400' : 'text-orange-400'}`} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Success:</span>{' '}
                <span className="text-green-400 font-medium">{stat.successful}</span>
              </div>
              <div>
                <span className="text-gray-500">Failed:</span>{' '}
                <span className="text-red-400 font-medium">{stat.failed}</span>
              </div>
              <div>
                <span className="text-gray-500">Avg Duration:</span>{' '}
                <span className="text-white font-medium">{formatDuration(stat.avg_duration_ms)}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Run:</span>{' '}
                <span className="text-white font-medium">{formatDate(stat.last_execution)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Latest Status</h2>
        <div className="space-y-3">
          {latestStatus.length === 0 ? (
            <div className="bg-slate-900 rounded-lg border border-slate-700 p-8 text-center">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No cron executions recorded yet</p>
            </div>
          ) : (
            latestStatus.map((status) => (
              <div
                key={status.function_name}
                className="bg-slate-900 rounded-lg border border-slate-700 p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(status.execution_status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{status.function_name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            status.execution_status
                          )}`}
                        >
                          {status.execution_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Last run: {formatDate(status.created_at)}</span>
                        {status.duration_ms && <span>Duration: {formatDuration(status.duration_ms)}</span>}
                        {status.records_processed > 0 && <span>Processed: {status.records_processed} records</span>}
                      </div>
                      {status.error_message && (
                        <p className="text-sm text-red-400 mt-2">Error: {status.error_message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {recentFailures.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Recent Failures (Last 24 Hours)
          </h2>
          <div className="space-y-3">
            {recentFailures.map((failure, idx) => (
              <div
                key={`${failure.function_name}-${failure.created_at}-${idx}`}
                className="bg-red-950/20 rounded-lg border border-red-500/30 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <h3 className="text-white font-medium">{failure.function_name}</h3>
                      <span className="text-xs text-gray-400">{formatDate(failure.created_at)}</span>
                    </div>
                    <p className="text-sm text-red-400 mb-2">{failure.error_message}</p>
                    {failure.error_details && (
                      <details className="text-xs text-gray-400">
                        <summary className="cursor-pointer hover:text-gray-300">View Details</summary>
                        <pre className="mt-2 bg-slate-950 rounded p-2 overflow-x-auto">
                          {JSON.stringify(failure.error_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
