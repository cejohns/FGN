import { useEffect, useState } from 'react';
import { supabase, GalleryImage } from '../lib/supabase';
import { X, Eye, Camera, Filter } from 'lucide-react';

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = async (image: GalleryImage) => {
    setSelectedImage(image);
    await supabase
      .from('gallery_images')
      .update({ view_count: image.view_count + 1 })
      .eq('id', image.id);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
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

  const categories = ['All', 'Gaming', 'Game Development', 'Technology', 'Screenshots', 'Concept Art', 'Cosplay', 'Hardware', 'Events', 'Fan Art'];

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(image => image.category === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gaming Gallery</h1>
        <p className="text-gray-600">Screenshots, concept art, cosplay, and more</p>
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

      {filteredImages.length === 0 ? (
        <div className="text-center py-16 bg-slate-950 rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">No images available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <button
              key={image.id}
              onClick={() => openLightbox(image)}
              className="group relative aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <img
                src={image.thumbnail_url}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm line-clamp-2">{image.title}</p>
                  <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                    <span className="flex items-center">
                      <Camera className="w-3 h-3 mr-1" />
                      {image.photographer}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {image.view_count}
                    </span>
                  </div>
                </div>
              </div>
              <span className="absolute top-3 left-3 px-2 py-1 bg-cyan-600 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {image.category}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-cyan-500 transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-950 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full max-h-[70vh] object-contain bg-slate-900"
              />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                      {selectedImage.category}
                    </span>
                    {selectedImage.game_title && (
                      <span className="ml-2 text-sm text-gray-500">from {selectedImage.game_title}</span>
                    )}
                  </div>
                  <span className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {selectedImage.view_count} views
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h2>

                {selectedImage.description && (
                  <p className="text-gray-700 mb-4">{selectedImage.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Photo by {selectedImage.photographer}</span>
                  </div>
                  <span>{formatDate(selectedImage.published_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
