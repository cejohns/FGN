export const revalidate = 3600;

import { createServerSupabaseClient } from '@/lib/supabase/server';
import Header from '../components/Header';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';

interface GameRelease {
  id: string;
  title: string;
  slug: string;
  release_date: string;
  cover_image: string;
  platform: string;
  genre: string;
  developer: string;
  publisher: string;
}

/**
 * Fetch upcoming releases safely.
 * Prevents build/ISR failures if Supabase is unreachable (ENOTFOUND, DNS, etc).
 */
async function getUpcomingReleases(): Promise<GameRelease[]> {
  try {
    const supabase = createServerSupabaseClient();

    // Use local date to avoid timezone edge-cases around midnight UTC
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('game_releases')
      .select(
        'id, title, slug, release_date, cover_image, platform, genre, developer, publisher'
      )
      .gte('release_date', today)
      .order('release_date', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching releases:', error.message);
      return [];
    }

    return (data || []) as GameRelease[];
  } catch (err) {
    console.error('Supabase releases fetch failed:', err);
    return [];
  }
}

function formatDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'TBD';

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysUntilRelease(releaseDate: string) {
  const release = new Date(releaseDate);
  if (Number.isNaN(release.getTime())) return 'TBD';

  // Compare by local day to avoid timezone hour differences
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfRelease = new Date(release.getFullYear(), release.getMonth(), release.getDate());

  const diffTime = startOfRelease.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}

function groupByMonth(releases: GameRelease[]) {
  const grouped: { [key: string]: GameRelease[] } = {};

  releases.forEach((release) => {
    const date = new Date(release.release_date);
    const monthYear = Number.isNaN(date.getTime())
      ? 'TBD'
      : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!grouped[monthYear]) grouped[monthYear] = [];
    grouped[monthYear].push(release);
  });

  return grouped;
}

export default async function ReleasesPage() {
  const releases = await getUpcomingReleases();
  const groupedReleases = groupByMonth(releases);

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="releases" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Release Calendar
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Track upcoming game releases across all platforms. Never miss a launch date for your most anticipated titles.
          </p>
        </div>

        {releases.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              No upcoming releases scheduled yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedReleases).map(([monthYear, monthReleases]) => (
              <section key={monthYear}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  {monthYear}
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {monthReleases.map((release) => (
                    <article
                      key={release.id}
                      className="group bg-slate-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      {release.cover_image && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={release.cover_image}
                            alt={release.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {getDaysUntilRelease(release.release_date)}
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(release.release_date)}</span>
                        </div>

                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                          {release.title}
                        </h3>

                        {release.genre && (
                          <div className="mb-2">
                            <span className="bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded text-xs uppercase font-medium">
                              {release.genre}
                            </span>
                          </div>
                        )}

                        {release.platform && (
                          <div className="mt-2">
                            <span className="text-xs bg-slate-700/30 text-slate-400 px-2 py-0.5 rounded">
                              {release.platform}
                            </span>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
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
