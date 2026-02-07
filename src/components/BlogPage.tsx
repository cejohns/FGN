import { useEffect, useMemo, useState } from 'react';
import { supabase, BlogPost } from '../lib/supabase';
import { ArrowLeft, Clock, Eye, BookOpen, Filter } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface BlogPageProps {
  selectedPostId?: string;
  onBack: () => void;
}

export default function BlogPage({ selectedPostId, onBack }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (selectedPostId) {
      fetchPostById(selectedPostId);
    } else {
      fetchAllPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPostId]);

  // ─────────────────────────────────────────────
  // Data Fetching
  // ─────────────────────────────────────────────
  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      console.log('BlogPage: Fetching blog posts...');
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('BlogPage: Error fetching posts:', error);
        throw error;
      }

      console.log('BlogPage: Fetched', data?.length || 0, 'posts');
      console.log('BlogPage: Posts data:', data);
      setPosts((data ?? []) as BlogPost[]);
    } catch (error) {
      console.error('BlogPage: Catch block error:', error);
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
      if (!data) return;

      const post = data as BlogPost;
      setSelectedPost(post);

      // Safe increment (prevents NaN if view_count is null/undefined)
      const nextViewCount = ((post as any).view_count ?? 0) + 1;

      // NOTE: This will 400 if blog_posts.view_count column doesn't exist OR RLS blocks UPDATE.
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ view_count: nextViewCount })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating blog view count:', updateError);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const formatDate = (date?: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const safeImage = (url?: string | null) =>
    url && url.trim().length > 0
      ? url
      : 'https://placehold.co/1280x720/png?text=FireStar+Gaming+Network';

  const categories = useMemo(
    () => [
      'All',
      'Gaming',
      'Game Development',
      'Technology',
      'Reviews',
      'Tutorials',
      'Opinion',
      'News',
      'Hardware',
      'Software',
    ],
    []
  );

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((post) => (post.category ?? '').trim() === selectedCategory);

  console.log('BlogPage Render:', {
    loading,
    postsCount: posts.length,
    selectedCategory,
    filteredPostsCount: filteredPosts.length,
    selectedPostId
  });

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Single Post View
  // ─────────────────────────────────────────────
  if (selectedPost) {
    const authorName = selectedPost.author?.trim() || 'Staff';
    const authorInitial = authorName.charAt(0).toUpperCase();

    const publishedLabel = formatDate(selectedPost.published_at);
    const safeViewCount = (selectedPost as any).view_count ?? 0;

    const safeFeaturedImage = safeImage(selectedPost.featured_image);
    const safeExcerpt = selectedPost.excerpt?.trim() || '';
    const safeContent = selectedPost.content?.trim() || '';

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Blog</span>
        </button>

        <article className="bg-slate-950 rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <ImageWithFallback
              src={safeFeaturedImage}
              alt={selectedPost.title || 'Featured image'}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-3 mb-4 flex-wrap gap-y-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                  Blog
                </span>
              </div>

              <span className="text-gray-400">•</span>

              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                {selectedPost.category || 'Uncategorized'}
              </span>

              {!!publishedLabel && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {publishedLabel}
                  </span>
                </>
              )}

              <span className="text-gray-400">•</span>

              <span className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {safeViewCount}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              {selectedPost.title || 'Untitled Post'}
            </h1>

            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {authorInitial}
              </div>
              <div>
                <p className="font-medium text-white">{authorName}</p>
                <p className="text-sm text-gray-500">Content Creator</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {safeExcerpt && (
                <p className="text-xl text-gray-300 mb-6 font-medium leading-relaxed">
                  {safeExcerpt}
                </p>
              )}
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{safeContent}</div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // List View
  // ─────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Blog</h1>
        <p className="text-gray-600">Community content, opinions, tutorials, and more</p>
      </div>

      <div className="mb-6 flex items-center space-x-4 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex space-x-2">
          {categories.map((category) => (
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
          <p className="text-gray-500 text-lg">No posts available in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const author = post.author?.trim() || 'Staff';
            const publishedLabel = formatDate(post.published_at);
            const featured = safeImage(post.featured_image);

            return (
              <button
                key={post.id}
                onClick={() => fetchPostById(post.id)}
                className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-video overflow-hidden relative">
                  <ImageWithFallback
                    src={featured}
                    alt={post.title || 'Featured image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                      {post.category || 'Uncategorized'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {post.title || 'Untitled Post'}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.excerpt ?? ''}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">{author}</span>
                    {!!publishedLabel && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {publishedLabel}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
