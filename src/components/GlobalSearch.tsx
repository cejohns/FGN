import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, X, FileText, Star, BookOpen, Newspaper, Loader } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'news' | 'review' | 'blog' | 'guide';
  slug: string;
  published_at: string;
  featured_image?: string;
}

interface GlobalSearchProps {
  onNavigate: (section: string, id?: string) => void;
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchPattern = `%${searchQuery}%`;

      const [newsRes, reviewsRes, blogsRes, guidesRes] = await Promise.all([
        supabase
          .from('news_articles')
          .select('id, title, excerpt, slug, published_at, featured_image')
          .eq('status', 'published')
          .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .order('published_at', { ascending: false })
          .limit(5),
        supabase
          .from('game_reviews')
          .select('id, game_title, excerpt, slug, published_at, game_cover')
          .eq('status', 'published')
          .or(`game_title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .order('published_at', { ascending: false })
          .limit(5),
        supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, published_at, featured_image')
          .eq('status', 'published')
          .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .order('published_at', { ascending: false })
          .limit(5),
        supabase
          .from('guides')
          .select('id, title, excerpt, slug, published_at, featured_image')
          .eq('status', 'published')
          .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern},content.ilike.${searchPattern}`)
          .order('published_at', { ascending: false })
          .limit(5),
      ]);

      const allResults: SearchResult[] = [];

      if (newsRes.data) {
        allResults.push(
          ...newsRes.data.map((item) => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            type: 'news' as const,
            slug: item.slug,
            published_at: item.published_at,
            featured_image: item.featured_image,
          }))
        );
      }

      if (reviewsRes.data) {
        allResults.push(
          ...reviewsRes.data.map((item) => ({
            id: item.id,
            title: item.game_title,
            excerpt: item.excerpt,
            type: 'review' as const,
            slug: item.slug,
            published_at: item.published_at,
            featured_image: item.game_cover,
          }))
        );
      }

      if (blogsRes.data) {
        allResults.push(
          ...blogsRes.data.map((item) => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            type: 'blog' as const,
            slug: item.slug,
            published_at: item.published_at,
            featured_image: item.featured_image,
          }))
        );
      }

      if (guidesRes.data) {
        allResults.push(
          ...guidesRes.data.map((item) => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            type: 'guide' as const,
            slug: item.slug,
            published_at: item.published_at,
            featured_image: item.featured_image,
          }))
        );
      }

      allResults.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

      setResults(allResults.slice(0, 10));
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const sectionMap = {
      news: 'news',
      review: 'reviews',
      blog: 'blog',
      guide: 'guides',
    };

    onNavigate(sectionMap[result.type], result.id);
    setShowResults(false);
    setQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Newspaper className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      case 'blog':
        return <FileText className="w-4 h-4" />;
      case 'guide':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'text-blue-400';
      case 'review':
        return 'text-yellow-400';
      case 'blog':
        return 'text-purple-400';
      case 'guide':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search news, reviews, guides, and more..."
          className="w-full pl-12 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

        {loading && (
          <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 animate-spin" />
        )}

        {!loading && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-cyan-500/10 max-h-[500px] overflow-y-auto z-50">
          {results.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No results found for "{query}"</p>
              <p className="text-gray-500 text-sm mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {result.featured_image && (
                      <img
                        src={result.featured_image}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${getTypeColor(result.type)}`}>{getTypeIcon(result.type)}</span>
                        <span className="text-xs text-gray-500 uppercase">{result.type}</span>
                      </div>
                      <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{result.excerpt}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
