import { createServerSupabaseClient } from '@/lib/supabase/server';
import Header from '../components/Header';
import Image from 'next/image';
import { Clock, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface GameReview {
  id: string;
  game_title: string;
  slug: string;
  rating: number;
  excerpt: string;
  game_cover: string;
  published_at: string;
  platform: string;
  genre: string;
}

async function getReviews() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('game_reviews')
    .select('id, game_title, slug, rating, excerpt, game_cover, published_at, platform, genre')
    .order('published_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return (data || []) as GameReview[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getRatingColor(rating: number) {
  if (rating >= 9) return 'bg-green-500';
  if (rating >= 7) return 'bg-blue-500';
  if (rating >= 5) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="reviews" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Game Reviews
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            In-depth reviews of the latest games across all platforms. Our expert analysis helps you decide what to play next.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No reviews available yet. Check back soon for our latest game reviews!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20"
              >
                {review.game_cover && (
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={review.game_cover}
                      alt={review.game_title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute top-4 right-4 ${getRatingColor(review.rating)} text-white font-bold text-xl px-4 py-2 rounded-full shadow-lg`}>
                      {review.rating}/10
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(review.published_at)}</span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
                    {review.game_title}
                  </h2>

                  {review.genre && (
                    <div className="mb-3">
                      <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs uppercase font-medium">
                        {review.genre}
                      </span>
                    </div>
                  )}

                  <p className="text-slate-300 text-sm line-clamp-3">{review.excerpt}</p>

                  {review.platform && (
                    <div className="mt-4">
                      <span className="text-xs bg-slate-700/30 text-slate-400 px-2 py-1 rounded">
                        {review.platform}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-fs-panel border-t border-fs-dark py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-fs-muted">
          <p>&copy; {new Date().getFullYear()} FireStar Gaming Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
