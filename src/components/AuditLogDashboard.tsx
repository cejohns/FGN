import { useEffect, useState } from 'react';
import { Shield, Filter, Calendar, User, FileText, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  actor_user_id: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-500/10 text-green-400 border-green-500/30',
  update: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  delete: 'bg-red-500/10 text-red-400 border-red-500/30',
  publish: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  unpublish: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  approve: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  reject: 'bg-red-500/10 text-red-400 border-red-500/30',
  sync: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  ai_generate: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

interface AuditLogDashboardProps {
  supabase: any;
}

export default function AuditLogDashboard({ supabase }: AuditLogDashboardProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7days');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedAction, selectedEntity, dateFilter, page]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      if (selectedEntity !== 'all') {
        query = query.eq('entity', selectedEntity);
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        let dateThreshold: Date;

        switch (dateFilter) {
          case '24hours':
            dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7days':
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            dateThreshold = new Date(0);
        }

        query = query.gte('created_at', dateThreshold.toISOString());
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));
  const uniqueEntities = Array.from(new Set(logs.map((log) => log.entity)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Audit Log</h1>
          <p className="text-gray-400 text-sm">Track all administrative actions and changes</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Action Type
            </label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="sync">Sync</option>
              <option value="ai_generate">AI Generate</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Entity Type
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Entities</option>
              <option value="blog_posts">Blog Posts</option>
              <option value="news_articles">News Articles</option>
              <option value="news_posts">News Posts</option>
              <option value="guides">Guides</option>
              <option value="game_releases">Game Releases</option>
              <option value="reviews">Reviews</option>
              <option value="videos">Videos</option>
              <option value="gallery_items">Gallery Items</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Time Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount} entries
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Audit Logs Found</h3>
          <p className="text-gray-400">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900 rounded-lg border border-slate-700 p-4 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        ACTION_COLORS[log.action] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-gray-400 text-sm">{log.entity}</span>
                    {log.entity_id && (
                      <span className="text-gray-500 text-xs font-mono">ID: {log.entity_id.substring(0, 8)}...</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {log.actor_email || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs text-gray-400 bg-slate-950 rounded p-2 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {log.ip_address && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">IP: {log.ip_address}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
