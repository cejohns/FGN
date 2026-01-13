import { useEffect, useMemo, useState } from 'react';
import { supabase, GameReview } from '../lib/supabase';
import { Star, ArrowLeft, Calendar, Filter } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface ReviewsPageProps {
  selectedReviewId?: string;
  onBack: () => void;
}

export default function ReviewsPage({ selectedReviewId, onBack }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<GameReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    if (selectedReviewId) {
      fetchReviewById(selectedReviewId);
    } else {
      fetchAllReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReviewId]);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setReviews(data as GameReview[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewById = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_reviews')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const review = data as GameReview;
        setSelectedReview(review);

        // Increment view_count safely (won't crash if null/undefined)
        const nextViewCount = ((review as any).view_count ?? 0) + 1;

        const { error: updateError } = await supabase
          .from('game_reviews')
          .update({ view_count: nextViewCount })
          .eq('id', id);

        if (updateError) {
          // If view_count column doesn't exist yet, you'll see PGRST204 here.
          console.error('Error updating review view count:', updateError);
        }
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '—';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRatingColor = (rating?: number | null) => {
    const r = typeof rating === 'number' ? rating : 0;
    if (r >= 8) return 'text-green-600 bg-green-100';
    if (r >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const coverUrl = (url?: string | null) =>
    url && url.trim().length > 0 ? url : 'https://placehold.co/600x800?text=No+Cover';

  const reviewerMeta = useMemo(() => {
    const name = (selectedReview?.reviewer ?? '').trim() || 'Staff';
    return { name, initial: name.charAt(0) };
  }, [selectedReview?.reviewer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  // =========================
  // Single Review View
  // =========================
  if (selectedReview) {
    const ratingValue = typeof selectedReview.rating === 'number' ? selectedReview.rating : 0;

    return (
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Reviews</span>
        </button>

        <article className="bg-slate-950 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 aspect-[3/4] overflow-hidden">
              <ImageWithFallback
                src={coverUrl(selectedReview.game_cover)}
                alt={selectedReview.game_title || 'Game cover'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:w-2/3 p-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                  {selectedReview.genre || 'Uncategorized'}
                </span>

                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full font-bold ${getRatingColor(
                    ratingValue
                  )}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>{ratingValue}/10</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">
                {selectedReview.game_title || 'Untitled Review'}
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Platform</p>
                  <p className="font-medium text-white">{selectedReview.platform || '—'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Developer</p>
                  <p className="font-medium text-white">{selectedReview.developer || '—'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Publisher</p>
                  <p className="font-medium text-white">{selectedReview.publisher || '—'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Release Date</p>
                  <p className="font-medium text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate((selectedReview as any).release_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {reviewerMeta.initial}
                </div>

                <div>
                  <p className="font-medium text-white">{reviewerMeta.name}</p>
                  <p className="text-sm text-gray-500">
                    Reviewed on {formatDate((selectedReview as any).published_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pt-0">
            <div className="prose prose-lg max-w-none">
              {selectedReview.excerpt ? (
                <p className="text-xl text-gray-700 mb-6 font-medium leading-relaxed">
                  {selectedReview.excerpt}
                </p>
              ) : null}

              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedReview.content || 'No review content yet.'}
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // =========================
  // List View
  // =========================
  const genres = [
    'All',
    'Action',
    'RPG',
    'Adventure',
    'Strategy',
    'Simulation',
    'Sports',
    'Racing',
    'Shooter',
    'Puzzle',
    'Horror',
    'Fighting',
  ];

  const filteredReviews =
    selectedGenre === 'All'
      ? reviews
      : reviews.filter((review) =>
          (review.genre ?? '').toLowerCase().includes(selectedGenre.toLowerCase())
        );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Game Reviews</h1>
        <p className="text-gray-600">Expert reviews and ratings for the latest games</p>
      </div>

      <div className="mb-6 flex items-center space-x-4 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex space-x-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">No reviews available in this genre.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => {
            const r = typeof review.rating === 'number' ? review.rating : 0;
            const reviewerName = (review.reviewer ?? '').trim() || 'Staff';

            return (
              <button
                key={review.id}
                onClick={() => fetchReviewById(review.id)}
                className="group bg-slate-950 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <ImageWithFallback
                    src={coverUrl(review.game_cover)}
                    alt={review.game_title || 'Game cover'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full flex items-center space-x-1 font-bold ${getRatingColor(
                      r
                    )}`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span>{r}</span>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
                    {review.genre || 'Uncategorized'}
                  </span>

                  <h3 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {review.game_title || 'Untitled Review'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {review.excerpt || 'No excerpt available.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{review.platform || '—'}</span>
                    <span className="font-medium">{reviewerName}</span>
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
