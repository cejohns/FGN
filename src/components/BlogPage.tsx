import { useEffect, useState } from 'react';
import { supabase, BlogPost } from '../lib/supabase';
import { ArrowLeft, Clock, Eye, Video, BookOpen, Filter } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface BlogPageProps {
  selectedPostId?: string;
  onBack: () => void;
}

export default function BlogPage({ selectedPostId, onBack }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blog' | 'vlog'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (selectedPostId) {
      fetchPostById(selectedPostId);
    } else {
      fetchAllPosts();
    }
  }, [selectedPostId, filter]);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('blog_posts').select('*').eq('status', 'published');

      if (filter !== 'all') {
        query = query.eq('post_type', filter);
      }

      const { data, error } = await query.order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostById = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedPost(data);
        await supabase
          .from('blog_posts')
          .update({ view_count: data.view_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {selectedPost.post_type === 'vlog' ? 'Vlogs' : 'Blog'}</span>
        </button>

        <article className="bg-slate-950 rounded-xl shadow-lg overflow-hidden">
          {selectedPost.post_type === 'vlog' && selectedPost.video_url ? (
            <div className="aspect-video bg-slate-900">
              <iframe
                src={selectedPost.video_url}
                title={selectedPost.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video overflow-hidden">
              <ImageWithFallback
                src={selectedPost.featured_image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center space-x-2">
                {selectedPost.post_type === 'vlog' ? (
                  <Video className="w-4 h-4 text-cyan-600" />
                ) : (
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                )}
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                  {selectedPost.post_type === 'vlog' ? 'Vlog' : 'Blog'}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                {selectedPost.category}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(selectedPost.published_at)}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {selectedPost.view_count}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{selectedPost.title}</h1>

            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {selectedPost.author.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-white">{selectedPost.author}</p>
                <p className="text-sm text-gray-500">Content Creator</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-6 font-medium leading-relaxed">{selectedPost.excerpt}</p>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  const categories = ['All', 'Gaming', 'Game Development', 'Technology', 'Reviews', 'Tutorials', 'Opinion', 'News', 'Hardware', 'Software'];

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Blog & Vlogs</h1>
        <p className="text-gray-600">Community content, opinions, tutorials, and more</p>

        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-950 text-gray-700 hover:bg-slate-800'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('blog')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              filter === 'blog'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-950 text-gray-700 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blogs</span>
          </button>
          <button
            onClick={() => setFilter('vlog')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              filter === 'vlog'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-950 text-gray-700 hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Vlogs</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center space-x-4 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">
            No posts available in this category.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => fetchPostById(post.id)}
              className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="aspect-video overflow-hidden relative">
                <ImageWithFallback
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {post.post_type === 'vlog' && (
                  <div className="absolute top-3 left-3 bg-cyan-600 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold">
                    <Video className="w-3 h-3" />
                    <span>VLOG</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center space-x-2 mb-2">
                  {post.post_type === 'vlog' ? (
                    <Video className="w-4 h-4 text-cyan-600" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-cyan-600" />
                  )}
                  <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{post.author}</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(post.published_at)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
