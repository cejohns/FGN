'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Plus, Trash2 } from 'lucide-react';

interface ContentManagementProps {
  supabase: SupabaseClient;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function NewsManagement({ supabase, onSuccess, onError }: ContentManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'General',
    author: 'Admin',
    is_featured: false,
  });

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading news:', err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!form.title || !form.slug || !form.excerpt || !form.content) {
        throw new Error('Please fill in all required fields');
      }

      const { error } = await supabase.from('news_articles').insert([{
        ...form,
        featured_image: form.featured_image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
      }]);

      if (error) throw error;
      onSuccess('News article created successfully!');
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'General',
        author: 'Admin',
        is_featured: false,
      });
      setShowForm(false);
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('news_articles').delete().eq('id', id);
      if (error) throw error;
      onSuccess('News article deleted!');
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">News Articles</h2>
          <p className="text-slate-300 text-sm">Create and manage news articles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Article
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-4 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Create News Article</h3>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="url-friendly-slug"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Excerpt <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Brief summary"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Full article content"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Featured Image URL</label>
            <input
              type="text"
              value={form.featured_image}
              onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="General">General</option>
                <option value="Breaking">Breaking</option>
                <option value="Industry">Industry</option>
                <option value="Events">Events</option>
                <option value="Rumors">Rumors</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-300 text-sm">Feature on homepage</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Article'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">Recent Articles ({items.length})</h3>
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="text-white font-semibold">{item.title}</h4>
                <p className="text-slate-400 text-sm">
                  {item.category} • {new Date(item.published_at).toLocaleDateString()}
                  {item.is_featured && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewsManagement({ supabase, onSuccess, onError }: ContentManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    game_title: '',
    slug: '',
    game_cover: '',
    platform: '',
    genre: '',
    developer: '',
    publisher: '',
    release_date: '',
    rating: '',
    excerpt: '',
    content: '',
    reviewer: 'Admin',
    is_featured: false,
  });

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading reviews:', err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!form.game_title || !form.slug || !form.platform || !form.genre || !form.rating || !form.excerpt || !form.content) {
        throw new Error('Please fill in all required fields');
      }

      const rating = parseFloat(form.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        throw new Error('Rating must be a number between 0 and 10');
      }

      const { error } = await supabase.from('game_reviews').insert([{
        ...form,
        rating,
        game_cover: form.game_cover || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
        release_date: form.release_date || null,
      }]);

      if (error) throw error;
      onSuccess('Game review created successfully!');
      setForm({
        game_title: '',
        slug: '',
        game_cover: '',
        platform: '',
        genre: '',
        developer: '',
        publisher: '',
        release_date: '',
        rating: '',
        excerpt: '',
        content: '',
        reviewer: 'Admin',
        is_featured: false,
      });
      setShowForm(false);
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('game_reviews').delete().eq('id', id);
      if (error) throw error;
      onSuccess('Review deleted!');
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Game Reviews</h2>
          <p className="text-slate-300 text-sm">Create and manage game reviews</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Review
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-4 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Create Game Review</h3>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Game Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.game_title}
              onChange={(e) => setForm({ ...form, game_title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter game title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Platform <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="PC, PS5, Xbox Series X"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Genre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Action, RPG, Strategy"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Developer</label>
              <input
                type="text"
                value={form.developer}
                onChange={(e) => setForm({ ...form, developer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Developer name"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Publisher</label>
              <input
                type="text"
                value={form.publisher}
                onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Publisher name"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Rating (0-10) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="8.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Game Cover URL</label>
            <input
              type="text"
              value={form.game_cover}
              onChange={(e) => setForm({ ...form, game_cover: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Excerpt <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Brief review summary"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Full review content"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="review_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="review_featured" className="text-slate-300 text-sm">
              Feature on homepage
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Review'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">Recent Reviews ({items.length})</h3>
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="text-white font-semibold">{item.game_title}</h4>
                <p className="text-slate-400 text-sm">
                  {item.platform} • Rating: {item.rating}/10
                  {item.is_featured && (
                    <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
