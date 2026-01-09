import { useState, useEffect } from 'react';
import { supabase, Guide } from '../lib/supabase';
import { BookOpen, Search, Filter } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuideClick = (guide: Guide) => {
    setSelectedGuide(guide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['All', ...Array.from(new Set(guides.map(g => g.category).filter(Boolean)))];

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (guide.excerpt && guide.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (guide.tags && guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredGuides = filteredGuides.filter(guide => guide.is_featured);
  const regularGuides = filteredGuides.filter(guide => !guide.is_featured);

  if (selectedGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => setSelectedGuide(null)}
            className="mb-8 text-cyan-400 hover:text-cyan-300 flex items-center space-x-2 transition-colors"
          >
            <span>← Back to Guides</span>
          </button>

          <article className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="relative h-96 overflow-hidden">
              <ImageWithFallback
                src={selectedGuide.cover_image_url}
                alt={selectedGuide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                {selectedGuide.category && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30">
                      {selectedGuide.category}
                    </span>
                  </div>
                )}
                <h1 className="text-4xl font-bold text-white mb-3">{selectedGuide.title}</h1>
                {selectedGuide.published_at && (
                  <div className="text-sm text-gray-400">
                    {new Date(selectedGuide.published_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="prose prose-invert prose-cyan max-w-none">
                {selectedGuide.excerpt && (
                  <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                    {selectedGuide.excerpt}
                  </p>
                )}
                {selectedGuide.content && (
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedGuide.content}
                  </div>
                )}
              </div>

              {selectedGuide.tags && selectedGuide.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-800 text-cyan-400 text-sm rounded-full hover:bg-slate-700 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="w-12 h-12 text-cyan-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Guides & Tutorials
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Master gaming, game development, and technology with our comprehensive guides
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search guides by title, topic, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 font-medium">Category:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            {featuredGuides.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
                  <span>Featured Guides</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredGuides.map(guide => (
                    <GuideCard key={guide.id} guide={guide} onClick={() => handleGuideClick(guide)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-3xl font-bold text-white mb-6">All Guides</h2>
              {regularGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularGuides.map(guide => (
                    <GuideCard key={guide.id} guide={guide} onClick={() => handleGuideClick(guide)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No guides found matching your criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GuideCard({ guide, onClick }: { guide: Guide; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500 transition-all cursor-pointer transform hover:scale-105 duration-300 shadow-lg hover:shadow-cyan-500/20"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={guide.cover_image_url}
          alt={guide.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        {guide.category && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/30 backdrop-blur-sm">
              {guide.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {guide.title}
        </h3>
        {guide.excerpt && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {guide.excerpt}
          </p>
        )}

        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {guide.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-800 text-cyan-400 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {guide.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-800 text-gray-400 text-xs rounded-full">
                +{guide.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {guide.published_at && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-gray-500 text-right">
            {new Date(guide.published_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
