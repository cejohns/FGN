import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSEO, pageSEO } from '../lib/seo';
import GameDetailsModal from './GameDetailsModal';

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
  useSEO(pageSEO.releases);

  const [games, setGames] = useState<GameRelease[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pc' | 'playstation' | 'xbox' | 'switch'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const getDaysUntilRelease = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(dateString);
    releaseDate.setHours(0, 0, 0, 0);
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'TOMORROW';
    if (diffDays <= 7) return `${diffDays} DAYS`;
    return null;
  };

  const isReleasingToday = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(dateString);
    releaseDate.setHours(0, 0, 0, 0);
    return today.getTime() === releaseDate.getTime();
  };

  const getTodaysReleases = () => {
    return getFilteredGames().filter(game => isReleasingToday(game.release_date));
  };

  const getFilteredGames = () => {
    if (filter === 'all') return games;

    return games.filter(game => {
      const platforms = game.platform.toLowerCase();
      switch (filter) {
        case 'pc':
          return platforms.includes('pc');
        case 'playstation':
          return platforms.includes('playstation') || platforms.includes('ps');
        case 'xbox':
          return platforms.includes('xbox');
        case 'switch':
          return platforms.includes('switch');
        default:
          return true;
      }
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const filteredGames = getFilteredGames();
  const todaysReleases = getTodaysReleases();
  const relatedGames = selectedGame
    ? games.filter(g => g.id !== selectedGame.id && g.genre === selectedGame.genre).slice(0, 3)
    : [];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gx-gradient bg-gx-grid opacity-50" />

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 font-poppins tracking-tight">
            Game Releases
          </h1>
          <p className="text-gray-400">Upcoming game releases you don't want to miss</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gx-accent" />
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Platforms' },
              { id: 'pc', label: 'PC' },
              { id: 'playstation', label: 'PlayStation' },
              { id: 'xbox', label: 'Xbox' },
              { id: 'switch', label: 'Switch' },
        { id: 'sMac', label: 'Mac' },
        { id: 'Linux', label: 'Linux' },
        { id: 'iOS', label: 'iOS' },
        { id: 'Andriod', label: 'Andriodh' },
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => setFilter(platform.id as any)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  filter === platform.id
                    ? 'bg-gx-accent text-white shadow-gx-red'
                    : 'bg-gx-dark text-gray-300 hover:bg-gx-midnight border border-white/10 hover:border-gx-accent/30'
                }`}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && todaysReleases.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-lg">
                  <span className="text-white font-bold text-lg uppercase tracking-wider">
                    🎮 Releasing Today
                  </span>
                </div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysReleases.map((game) => {
                const { day, month } = formatDate(game.release_date);

                return (
                  <div
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    className="cursor-pointer group/today"
                  >
                    <div className="relative overflow-hidden rounded-xl border-2 border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                      <div className="relative h-80 overflow-hidden bg-gx-dark">
                        <img
                          src={game.cover_image}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover/today:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-gx-dark via-gx-dark/40 to-transparent" />

                        <div className="absolute top-3 left-3 bg-cyan-500 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg animate-pulse">
                          <div className="text-xl font-bold text-white leading-none">{day}</div>
                          <div className="text-xs font-semibold text-white uppercase tracking-wider">{month}</div>
                        </div>

                        <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider animate-pulse">
                          OUT NOW
                        </div>

                        {game.is_featured && (
                          <div className="absolute top-14 right-3 bg-yellow-500 text-gx-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase">
                            Featured
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gx-dark to-transparent">
                          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 font-poppins">
                            {game.title}
                          </h3>
                          <p className="text-cyan-300 text-sm font-medium mb-2">
                            {game.genre.split(',')[0]}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {game.platform.split(',').slice(0, 4).map((platform, idx) => (
                              <span
                                key={idx}
                                className="text-xs text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30"
                              >
                                {platform.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gx-accent mx-auto shadow-gx-red"></div>
            <p className="text-gray-400 mt-6 text-lg">Loading releases...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-gx-midnight/50 rounded-2xl border border-white/5">
            <p className="text-gray-400 text-xl">No releases found for this platform</p>
          </div>
        ) : (
          <>
            {todaysReleases.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white font-poppins">All Upcoming Releases</h2>
                <p className="text-gray-400 text-sm">Browse the complete calendar of upcoming games</p>
              </div>
            )}

            <div className="relative group">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-gx-dark/90 hover:bg-gx-accent text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:shadow-gx-red"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-gx-dark/90 hover:bg-gx-accent text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:shadow-gx-red"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {filteredGames.map((game) => {
                const { day, month } = formatDate(game.release_date);
                const statusLabel = getDaysUntilRelease(game.release_date);

                return (
                  <div
                    key={game.id}
                    onClick={() => handleGameClick(game)}
                    className="flex-shrink-0 w-64 snap-start cursor-pointer group/card"
                  >
                    <div className="relative overflow-hidden rounded-2xl border-2 border-transparent hover:border-gx-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-gx-card">
                      <div className="relative h-96 overflow-hidden bg-gx-dark">
                        <img
                          src={game.cover_image}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-gx-dark via-gx-dark/20 to-transparent" />

                        <div className="absolute top-3 left-3 bg-gx-accent/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gx-accent">
                          <div className="text-2xl font-bold text-white leading-none">{day}</div>
                          <div className="text-xs font-semibold text-white/90 uppercase tracking-wider">{month}</div>
                        </div>

                        {statusLabel && (
                          <div className="absolute top-3 right-0 bg-gx-accent text-white text-xs font-bold px-4 py-2 shadow-lg uppercase tracking-wider">
                            {statusLabel}
                          </div>
                        )}

                        {game.is_featured && (
                          <div className="absolute top-14 right-0 bg-gx-neon text-gx-dark text-xs font-bold px-4 py-2 shadow-lg uppercase tracking-wider">
                            Featured
                          </div>
                        )}

                        {game.rating_expected && (
                          <div className="absolute bottom-3 right-3 bg-gx-dark/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                            {game.rating_expected}
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gx-dark/95 to-transparent">
                          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 font-poppins">
                            {game.title}
                          </h3>
                          <p className="text-gray-300 text-sm line-clamp-1">
                            {game.genre.split(',')[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 px-1">
                      {game.platform.split(',').slice(0, 3).map((platform, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-gray-400 bg-gx-dark/50 px-2 py-1 rounded border border-white/5"
                        >
                          {platform.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Scroll horizontally to explore more releases • Click any game for details
          </p>
        </div>
      </div>

      {selectedGame && (
        <GameDetailsModal
          game={selectedGame}
          relatedGames={relatedGames}
          onClose={() => setSelectedGame(null)}
          onGameSelect={(game) => {
            setSelectedGame(game);
            incrementViewCount(game.id);
          }}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
