import { useState, useEffect } from 'react';
import { Eye, Check, X, Loader, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DraftPreviewProps {
  onBack: () => void;
}

type DraftItem = {
  id: string;
  title: string;
  excerpt?: string;
  description?: string;
  content?: string;
  featured_image?: string;
  game_cover?: string;
  thumbnail?: string;
  image_url?: string;
  category: string;
  author?: string;
  reviewer?: string;
  creator?: string;
  photographer?: string;
  type: 'news' | 'review' | 'blog' | 'video' | 'gallery';
  created_at: string;
};

export default function DraftPreview({ onBack }: DraftPreviewProps) {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<DraftItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const allDrafts: DraftItem[] = [];

      const [newsRes, reviewsRes, blogsRes, videosRes, galleryRes] = await Promise.all([
        supabase.from('news_articles').select('*').eq('status', 'draft').order('created_at', { ascending: false }),
        supabase.from('game_reviews').select('*').eq('status', 'draft').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').eq('status', 'draft').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').eq('status', 'draft').order('created_at', { ascending: false }),
        supabase.from('gallery_images').select('*').eq('status', 'draft').order('created_at', { ascending: false }),
      ]);

      if (newsRes.data) {
        allDrafts.push(...newsRes.data.map(item => ({ ...item, type: 'news' as const })));
      }
      if (reviewsRes.data) {
        allDrafts.push(...reviewsRes.data.map(item => ({ ...item, type: 'review' as const, title: item.game_title })));
      }
      if (blogsRes.data) {
        allDrafts.push(...blogsRes.data.map(item => ({ ...item, type: 'blog' as const })));
      }
      if (videosRes.data) {
        allDrafts.push(...videosRes.data.map(item => ({ ...item, type: 'video' as const })));
      }
      if (galleryRes.data) {
        allDrafts.push(...galleryRes.data.map(item => ({ ...item, type: 'gallery' as const })));
      }

      allDrafts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishDraft = async (draft: DraftItem) => {
    setProcessing(true);
    setMessage(null);

    try {
      const tableName =
        draft.type === 'news' ? 'news_articles' :
        draft.type === 'review' ? 'game_reviews' :
        draft.type === 'blog' ? 'blog_posts' :
        draft.type === 'video' ? 'videos' : 'gallery_images';

      const { error } = await supabase
        .from(tableName)
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', draft.id);

      if (error) throw error;

      setMessage({ type: 'success', text: `${draft.title} has been published!` });
      await loadDrafts();
      setSelectedDraft(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const deleteDraft = async (draft: DraftItem) => {
    if (!confirm(`Are you sure you want to delete "${draft.title}"?`)) return;

    setProcessing(true);
    setMessage(null);

    try {
      const tableName =
        draft.type === 'news' ? 'news_articles' :
        draft.type === 'review' ? 'game_reviews' :
        draft.type === 'blog' ? 'blog_posts' :
        draft.type === 'video' ? 'videos' : 'gallery_images';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', draft.id);

      if (error) throw error;

      setMessage({ type: 'success', text: `${draft.title} has been deleted.` });
      await loadDrafts();
      setSelectedDraft(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'from-cyan-500 to-blue-500';
      case 'review': return 'from-purple-500 to-pink-500';
      case 'blog': return 'from-green-500 to-emerald-500';
      case 'video': return 'from-red-500 to-orange-500';
      case 'gallery': return 'from-yellow-500 to-amber-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (selectedDraft) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedDraft(null)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Drafts</span>
        </button>

        <div className="bg-slate-900 rounded-xl shadow-lg border border-cyan-500/20 overflow-hidden">
          {(selectedDraft.featured_image || selectedDraft.game_cover || selectedDraft.thumbnail || selectedDraft.image_url) && (
            <img
              src={selectedDraft.featured_image || selectedDraft.game_cover || selectedDraft.thumbnail || selectedDraft.image_url}
              alt={selectedDraft.title}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeColor(selectedDraft.type)}`}>
                {getTypeLabel(selectedDraft.type)}
              </span>
              <span className="text-sm text-gray-400">
                {new Date(selectedDraft.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">{selectedDraft.title}</h1>

            {selectedDraft.excerpt && (
              <p className="text-lg text-gray-300 mb-6">{selectedDraft.excerpt}</p>
            )}

            {selectedDraft.description && (
              <p className="text-lg text-gray-300 mb-6">{selectedDraft.description}</p>
            )}

            {selectedDraft.content && (
              <div className="prose prose-invert max-w-none mb-8">
                <div className="text-gray-300 whitespace-pre-line">{selectedDraft.content}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-700">
              <div className="text-sm text-gray-400">
                {selectedDraft.author || selectedDraft.reviewer || selectedDraft.creator || selectedDraft.photographer}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => deleteDraft(selectedDraft)}
                  disabled={processing}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => publishDraft(selectedDraft)}
                  disabled={processing}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Admin</span>
      </button>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-lg shadow-cyan-500/10 border border-cyan-500/20 p-8 mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Draft Content</h2>
        <p className="text-gray-400">Review and approve AI-generated content before publishing to the main site</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-950 border-green-500/50 text-green-400'
            : 'bg-red-950 border-red-500/50 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Drafts Available</h3>
          <p className="text-gray-500">Generate some AI content to see drafts here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-slate-900 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden group"
              onClick={() => setSelectedDraft(draft)}
            >
              {(draft.featured_image || draft.game_cover || draft.thumbnail || draft.image_url) && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={draft.featured_image || draft.game_cover || draft.thumbnail || draft.image_url}
                    alt={draft.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeColor(draft.type)}`}>
                      {getTypeLabel(draft.type)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {draft.title}
                </h3>
                {(draft.excerpt || draft.description) && (
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {draft.excerpt || draft.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{draft.author || draft.reviewer || draft.creator || draft.photographer}</span>
                  <span>{new Date(draft.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
