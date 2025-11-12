import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Tag, DollarSign, ExternalLink, Gamepad2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GameRelease {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  banner_image: string;
  trailer_url?: string;
  genre: string;
  platform: string;
  developer: string;
  publisher: string;
  release_date: string;
  price?: string;
  preorder_link?: string;
  rating_expected?: string;
  features: string[];
  view_count: number;
  is_featured: boolean;
}

interface ReleaseCalendarPageProps {
  selectedGameId?: string;
  onBack: () => void;
}

export default function ReleaseCalendarPage({ selectedGameId, onBack }: ReleaseCalendarPageProps) {
  const [games, setGames] = useState<GameRelease[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'this-month'>('all');

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (selectedGameId && games.length > 0) {
      const game = games.find(g => g.id === selectedGameId);
      if (game) {
        setSelectedGame(game);
        incrementViewCount(game.id);
      }
    }
  }, [selectedGameId, games]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_releases')
        .select('*')
        .order('release_date', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (gameId: string) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      await supabase
        .from('game_releases')
        .update({ view_count: (game.view_count || 0) + 1 })
        .eq('id', gameId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleGameClick = (game: GameRelease) => {
    setSelectedGame(game);
    incrementViewCount(game.id);
    window.scrollTo(0, 0);
  };

  const handlePreviousGame = () => {
    if (!selectedGame) return;
    const currentIndex = games.findIndex(g => g.id === selectedGame.id);
    if (currentIndex > 0) {
      const prevGame = games[currentIndex - 1];
      setSelectedGame(prevGame);
      incrementViewCount(prevGame.id);
      window.scrollTo(0, 0);
    }
  };

  const handleNextGame = () => {
    if (!selectedGame) return;
    const currentIndex = games.findIndex(g => g.id === selectedGame.id);
    if (currentIndex < games.length - 1) {
      const nextGame = games[currentIndex + 1];
      setSelectedGame(nextGame);
      incrementViewCount(nextGame.id);
      window.scrollTo(0, 0);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilRelease = (dateString: string) => {
    const today = new Date();
    const releaseDate = new Date(dateString);
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Released';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getFilteredGames = () => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (filter) {
      case 'upcoming':
        return games.filter(game => new Date(game.release_date) >= today);
      case 'this-month':
        return games.filter(game => {
          const releaseDate = new Date(game.release_date);
          return releaseDate >= today && releaseDate <= endOfMonth;
        });
      default:
        return games;
    }
  };

  const filteredGames = getFilteredGames();
  const currentIndex = selectedGame ? games.findIndex(g => g.id === selectedGame.id) : -1;

  if (selectedGame) {
    return (
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => {
            setSelectedGame(null);
            onBack();
          }}
          className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Calendar
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
          {selectedGame.banner_image && (
            <div className="relative h-96 overflow-hidden">
              <img
                src={selectedGame.banner_image}
                alt={selectedGame.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <img
                src={selectedGame.cover_image}
                alt={selectedGame.title}
                className="w-48 h-64 object-cover rounded-lg shadow-xl border-2 border-slate-700"
              />

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-3">{selectedGame.title}</h1>

                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">
                    {selectedGame.genre}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                    {selectedGame.platform}
                  </span>
                  {selectedGame.rating_expected && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                      {selectedGame.rating_expected}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">Release Date</div>
                      <div className="font-semibold">{formatDate(selectedGame.release_date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">Countdown</div>
                      <div className="font-semibold">{getDaysUntilRelease(selectedGame.release_date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Gamepad2 className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">Developer</div>
                      <div className="font-semibold">{selectedGame.developer}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-slate-400">Publisher</div>
                      <div className="font-semibold">{selectedGame.publisher}</div>
                    </div>
                  </div>

                  {selectedGame.price && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-xs text-slate-400">Price</div>
                        <div className="font-semibold">{selectedGame.price}</div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedGame.preorder_link && (
                  <a
                    href={selectedGame.preorder_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/30"
                  >
                    Pre-Order Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">About</h2>
                <p className="text-slate-300 leading-relaxed">{selectedGame.description}</p>
              </div>

              {selectedGame.features && selectedGame.features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                    <Tag className="w-6 h-6 text-cyan-400" />
                    Key Features
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedGame.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedGame.trailer_url && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Trailer</h2>
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                    <iframe
                      src={selectedGame.trailer_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={handlePreviousGame}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Game
              </button>

              <button
                onClick={handleNextGame}
                disabled={currentIndex === games.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next Game
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-10 h-10 text-cyan-400" />
          Release Calendar
        </h1>
        <p className="text-slate-400">Track upcoming game releases and never miss a launch</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Games
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'upcoming'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('this-month')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'this-month'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          This Month
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading games...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={game.cover_image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                {game.is_featured && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    Featured
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{game.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-cyan-500/30 backdrop-blur-sm text-cyan-200 rounded border border-cyan-500/50">
                      {game.genre}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/30 backdrop-blur-sm text-blue-200 rounded border border-blue-500/50">
                      {game.platform}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">{formatDate(game.release_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-300">
                      {getDaysUntilRelease(game.release_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
