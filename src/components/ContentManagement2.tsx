'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Plus, Trash2 } from 'lucide-react';

interface ContentManagementProps {
  supabase: SupabaseClient;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function GuidesManagement({ supabase, onSuccess, onError }: ContentManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Gaming Tips',
    difficulty: 'Beginner',
    author: 'Admin',
    estimated_time: '5 min',
    is_featured: false,
  });

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading guides:', err);
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

      const { error } = await supabase.from('guides').insert([{
        ...form,
        featured_image: form.featured_image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
      }]);

      if (error) throw error;
      onSuccess('Guide created successfully!');
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'Gaming Tips',
        difficulty: 'Beginner',
        author: 'Admin',
        estimated_time: '5 min',
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
      const { error } = await supabase.from('guides').delete().eq('id', id);
      if (error) throw error;
      onSuccess('Guide deleted!');
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Guides & Tutorials</h2>
          <p className="text-slate-300 text-sm">Create and manage gaming guides</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Guide
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-4 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Create Guide</h3>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="Enter guide title"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="Full guide content"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Featured Image URL</label>
            <input
              type="text"
              value={form.featured_image}
              onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Gaming Tips">Gaming Tips</option>
                <option value="Game Development">Game Development</option>
                <option value="Technology">Technology</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Est. Time</label>
              <input
                type="text"
                value={form.estimated_time}
                onChange={(e) => setForm({ ...form, estimated_time: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                placeholder="5 min"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="guide_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="guide_featured" className="text-slate-300 text-sm">
              Feature on homepage
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Guide'}
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
          <h3 className="text-lg font-bold text-white">Recent Guides ({items.length})</h3>
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="text-white font-semibold">{item.title}</h4>
                <p className="text-slate-400 text-sm">
                  {item.category} • {item.difficulty} • {item.estimated_time}
                  {item.is_featured && (
                    <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
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

export function VideosManagement({ supabase, onSuccess, onError }: ContentManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    video_url: '',
    thumbnail: '',
    category: 'General',
    duration: '',
    creator: 'Admin',
    is_featured: false,
  });

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading videos:', err);
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
      if (!form.title || !form.slug || !form.description || !form.video_url) {
        throw new Error('Please fill in all required fields');
      }

      const { error } = await supabase.from('videos').insert([{
        ...form,
        thumbnail: form.thumbnail || 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
      }]);

      if (error) throw error;
      onSuccess('Video created successfully!');
      setForm({
        title: '',
        slug: '',
        description: '',
        video_url: '',
        thumbnail: '',
        category: 'General',
        duration: '',
        creator: 'Admin',
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
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      onSuccess('Video deleted!');
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-900/20 to-red-900/20 border border-rose-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Videos</h2>
          <p className="text-slate-300 text-sm">Create and manage video content</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Video
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-4 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Create Video</h3>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Video URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
              placeholder="YouTube URL or embed code"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
              placeholder="Video description"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Thumbnail URL</label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="General">General</option>
                <option value="Gameplay">Gameplay</option>
                <option value="Review">Review</option>
                <option value="News">News</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
                placeholder="10:45"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="video_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="video_featured" className="text-slate-300 text-sm">
              Feature on homepage
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Video'}
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
          <h3 className="text-lg font-bold text-white">Recent Videos ({items.length})</h3>
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="text-white font-semibold">{item.title}</h4>
                <p className="text-slate-400 text-sm">
                  {item.category} {item.duration && `• ${item.duration}`}
                  {item.is_featured && (
                    <span className="ml-2 text-xs bg-rose-600 text-white px-2 py-0.5 rounded">
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

export function GalleryManagement({ supabase, onSuccess, onError }: ContentManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    thumbnail_url: '',
    category: 'General',
    game_title: '',
    photographer: 'Admin',
    is_featured: false,
  });

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error loading gallery:', err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!form.title || !form.image_url) {
        throw new Error('Please fill in all required fields');
      }

      const { error } = await supabase.from('gallery_images').insert([{
        ...form,
        thumbnail_url: form.thumbnail_url || form.image_url,
      }]);

      if (error) throw error;
      onSuccess('Gallery image created successfully!');
      setForm({
        title: '',
        description: '',
        image_url: '',
        thumbnail_url: '',
        category: 'General',
        game_title: '',
        photographer: 'Admin',
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
      const { error } = await supabase.from('gallery_images').delete().eq('id', id);
      if (error) throw error;
      onSuccess('Gallery image deleted!');
      await loadItems();
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border border-teal-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Gallery Images</h2>
          <p className="text-slate-300 text-sm">Create and manage gallery images</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Image
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-4 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Add Gallery Image</h3>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Enter image title"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Image URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Thumbnail URL</label>
            <input
              type="text"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Leave empty to use main image"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              placeholder="Image description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="General">General</option>
                <option value="Screenshots">Screenshots</option>
                <option value="Concept Art">Concept Art</option>
                <option value="Cosplay">Cosplay</option>
                <option value="Fan Art">Fan Art</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Game Title</label>
              <input
                type="text"
                value={form.game_title}
                onChange={(e) => setForm({ ...form, game_title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                placeholder="Related game (optional)"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="gallery_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="gallery_featured" className="text-slate-300 text-sm">
              Feature on homepage
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Add Image'}
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
          <h3 className="text-lg font-bold text-white">Recent Images ({items.length})</h3>
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="text-white font-semibold">{item.title}</h4>
                <p className="text-slate-400 text-sm">
                  {item.category} {item.game_title && `• ${item.game_title}`}
                  {item.is_featured && (
                    <span className="ml-2 text-xs bg-teal-600 text-white px-2 py-0.5 rounded">
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
