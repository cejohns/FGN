import { createServerSupabaseClient } from '@/lib/supabase/server';
import Header from '../components/Header';
import Image from 'next/image';
import { ImageIcon, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  game_title: string;
  category: string;
  published_at: string;
}

async function getGalleryImages() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, title, description, image_url, game_title, category, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }

  return (data || []) as GalleryImage[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'screenshot':
      return 'bg-blue-500/20 text-blue-400';
    case 'artwork':
      return 'bg-purple-500/20 text-purple-400';
    case 'concept art':
      return 'bg-pink-500/20 text-pink-400';
    case 'wallpaper':
      return 'bg-green-500/20 text-green-400';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
}

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-fs-dark">
      <Header currentPage="gallery" />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Gaming Gallery
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Explore stunning screenshots, artwork, and concept art from your favorite games. A visual journey through gaming worlds.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No gallery images available yet. Check back soon for amazing gaming visuals!</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {images.map((image) => (
              <article
                key={image.id}
                className="group relative break-inside-avoid bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={image.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4">
                  {image.game_title && (
                    <div className="mb-2">
                      <span className="text-pink-400 text-sm font-medium">{image.game_title}</span>
                    </div>
                  )}

                  <h2 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
                    {image.title}
                  </h2>

                  {image.description && (
                    <p className="text-slate-300 text-sm line-clamp-2 mb-3">{image.description}</p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(image.published_at)}</span>
                    </div>
                    {image.category && (
                      <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium ${getCategoryColor(image.category)}`}>
                        {image.category}
                      </span>
                    )}
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
