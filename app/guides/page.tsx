import { createServerSupabaseClient } from '@/lib/supabase/server';
import Header from '../components/Header';
import Image from 'next/image';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  difficulty: string;
  published_at: string;
}

async function getGuides() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('guides')
    .select('id, title, slug, excerpt, featured_image, category, difficulty, published_at')
    .order('published_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching guides:', error);
    return [];
  }

  return (data || []) as Guide[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-500/20 text-green-400';
    case 'intermediate':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'advanced':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="guides" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Gaming Guides
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Master your favorite games with our comprehensive guides, walkthroughs, and tutorials. From beginner tips to advanced strategies.
          </p>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No guides available yet. Check back soon for expert gaming tutorials!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <article
                key={guide.id}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20"
              >
                {guide.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={guide.featured_image}
                      alt={guide.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(guide.published_at)}</span>
                    </div>
                    {guide.difficulty && (
                      <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium ${getDifficultyColor(guide.difficulty)}`}>
                        {guide.difficulty}
                      </span>
                    )}
                  </div>

                  {guide.category && (
                    <div className="mb-2">
                      <span className="text-green-400 text-sm font-medium">{guide.category}</span>
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
                    {guide.title}
                  </h2>

                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">{guide.excerpt}</p>

                  <div className="flex items-center text-green-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Read guide
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
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
