import { useEffect, useState } from 'react';
import { supabase, NewsArticle } from '../lib/supabase';
import { Clock, Eye, ArrowLeft, Filter } from 'lucide-react';

interface NewsPageProps {
  selectedArticleId?: string;
  onBack: () => void;
}

export default function NewsPage({ selectedArticleId, onBack }: NewsPageProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (selectedArticleId) {
      fetchArticleById(selectedArticleId);
    } else {
      fetchAllArticles();
    }
  }, [selectedArticleId]);

  const fetchAllArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleById = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedArticle(data);
        await supabase
          .from('news_articles')
          .update({ view_count: data.view_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
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

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to News</span>
        </button>

        <article className="bg-slate-950 rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <img
              src={selectedArticle.featured_image}
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                {selectedArticle.category}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(selectedArticle.published_at)}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {selectedArticle.view_count}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{selectedArticle.title}</h1>

            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {selectedArticle.author.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-white">{selectedArticle.author}</p>
                <p className="text-sm text-gray-500">Staff Writer</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-6 font-medium leading-relaxed">{selectedArticle.excerpt}</p>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  const categories = ['All', 'Gaming', 'Game Development', 'Technology', 'Hardware', 'Software', 'Esports', 'Industry'];

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Latest Gaming News</h1>
        <p className="text-gray-600">Stay updated with the latest happenings in the gaming world</p>
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

      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">No news articles available in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => fetchArticleById(article.id)}
              className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">{article.category}</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(article.published_at)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {article.view_count}
                    </span>
                  </div>
                  <span className="font-medium">{article.author}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
