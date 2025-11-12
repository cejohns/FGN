import { X, ExternalLink, Calendar, Gamepad2, Users, Tag } from 'lucide-react';
import { useEffect } from 'react';

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
}

interface GameDetailsModalProps {
  game: GameRelease;
  relatedGames: GameRelease[];
  onClose: () => void;
  onGameSelect: (game: GameRelease) => void;
}

export default function GameDetailsModal({ game, relatedGames, onClose, onGameSelect }: GameDetailsModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const genres = game.genre.split(',').map(g => g.trim());
  const platforms = game.platform.split(',').map(p => p.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gx-midnight border border-gx-accent/30 rounded-2xl shadow-gx-card animate-in slide-in-from-bottom-8 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gx-dark/80 hover:bg-gx-accent text-white rounded-full transition-all shadow-lg hover:shadow-gx-red"
        >
          <X className="w-6 h-6" />
        </button>

        {game.banner_image && (
          <div className="relative h-80 overflow-hidden">
            <img
              src={game.banner_image}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gx-midnight via-gx-midnight/50 to-transparent" />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start gap-6 mb-8">
            <img
              src={game.cover_image}
              alt={game.title}
              className="w-48 h-64 object-cover rounded-xl shadow-gx-card border-2 border-gx-accent/50"
            />

            <div className="flex-1">
              <h1 className="text-5xl font-bold text-white mb-4 font-poppins tracking-tight">
                {game.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gx-accent/20 text-gx-accent rounded-full text-sm font-medium border border-gx-accent/40 hover:bg-gx-accent/30 transition-colors"
                  >
                    {genre}
                  </span>
                ))}
                {platforms.map((platform, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gx-neon/20 text-gx-neon rounded-full text-sm font-medium border border-gx-neon/40"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gx-dark/50 rounded-lg border border-white/5">
                  <Calendar className="w-5 h-5 text-gx-accent" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Release Date</div>
                    <div className="font-semibold text-white">{formatDate(game.release_date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gx-dark/50 rounded-lg border border-white/5">
                  <Gamepad2 className="w-5 h-5 text-gx-accent" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Developer</div>
                    <div className="font-semibold text-white">{game.developer}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gx-dark/50 rounded-lg border border-white/5">
                  <Users className="w-5 h-5 text-gx-accent" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Publisher</div>
                    <div className="font-semibold text-white">{game.publisher}</div>
                  </div>
                </div>

                {game.price && (
                  <div className="flex items-center gap-3 p-3 bg-gx-dark/50 rounded-lg border border-white/5">
                    <Tag className="w-5 h-5 text-gx-accent" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Price</div>
                      <div className="font-semibold text-white">{game.price}</div>
                    </div>
                  </div>
                )}
              </div>

              {game.preorder_link && (
                <a
                  href={game.preorder_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gx-accent hover:bg-gx-accent/80 text-white font-semibold rounded-full transition-all shadow-lg shadow-gx-red hover:shadow-gx-red/70 hover:scale-105"
                >
                  Official Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 font-poppins">About This Game</h2>
              <p className="text-gray-300 leading-relaxed">{game.description}</p>
            </div>

            {game.features && game.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 font-poppins">Key Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {game.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-gx-accent mt-1 text-lg">▸</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {game.trailer_url && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 font-poppins">Trailer</h2>
                <div className="aspect-video bg-gx-dark rounded-xl overflow-hidden border border-gx-accent/20 shadow-gx-card">
                  <iframe
                    src={game.trailer_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {relatedGames.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 font-poppins">Related Games</h2>
                <div className="grid grid-cols-3 gap-4">
                  {relatedGames.slice(0, 3).map((relatedGame) => (
                    <button
                      key={relatedGame.id}
                      onClick={() => onGameSelect(relatedGame)}
                      className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-gx-accent/50 transition-all hover:scale-105"
                    >
                      <img
                        src={relatedGame.cover_image}
                        alt={relatedGame.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gx-dark via-gx-dark/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {relatedGame.title}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
