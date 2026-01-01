import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

interface GiantBombGame {
  id: number;
  name: string;
  deck: string;
  description: string;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    screen_large_url: string;
    small_url: string;
    super_url: string;
    thumb_url: string;
    tiny_url: string;
    original_url: string;
  };
  original_release_date: string;
  platforms: Array<{
    id: number;
    name: string;
    abbreviation: string;
  }>;
  developers: Array<{
    id: number;
    name: string;
  }>;
  publishers: Array<{
    id: number;
    name: string;
  }>;
  genres: Array<{
    id: number;
    name: string;
  }>;
  site_detail_url: string;
}

interface GiantBombVideo {
  id: number;
  name: string;
  deck: string;
  image: {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    screen_large_url: string;
    small_url: string;
    super_url: string;
    thumb_url: string;
    tiny_url: string;
    original_url: string;
  };
  length_seconds: number;
  publish_date: string;
  site_detail_url: string;
  url: string;
  low_url?: string;
  high_url?: string;
  hd_url?: string;
  user: string;
};

interface GiantBombImage {
  id: number;
  original: string;
  screen_large: string;
  medium: string;
  thumb: string;
  tags: string;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function truncateText(text: string, maxLength: number): string {
  const cleaned = stripHtml(text);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3) + '...';
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

async function fetchGiantBombGames(apiKey: string): Promise<GiantBombGame[]> {
  try {
    const response = await fetch(
      `https://www.giantbomb.com/api/games/?api_key=${apiKey}&format=json&sort=date_last_updated:desc&filter=date_last_updated:2024-01-01|2025-12-31&limit=20`,
      {
        headers: {
          'User-Agent': 'FireStarGamingNetwork/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Giant Bomb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Giant Bomb games:', error);
    return [];
  }
}

async function fetchGiantBombVideos(apiKey: string): Promise<GiantBombVideo[]> {
  try {
    const response = await fetch(
      `https://www.giantbomb.com/api/videos/?api_key=${apiKey}&format=json&sort=publish_date:desc&limit=20`,
      {
        headers: {
          'User-Agent': 'FireStarGamingNetwork/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Giant Bomb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Giant Bomb videos:', error);
    return [];
  }
}

async function fetchGameImages(gameId: number, apiKey: string): Promise<GiantBombImage[]> {
  try {
    const response = await fetch(
      `https://www.giantbomb.com/api/game/${gameId}/?api_key=${apiKey}&format=json&field_list=images`,
      {
        headers: {
          'User-Agent': 'FireStarGamingNetwork/1.0',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results?.images || [];
  } catch (error) {
    console.error(`Error fetching images for game ${gameId}:`, error);
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return createUnauthorizedResponse(authResult.error);
  }

  try {
    const giantBombApiKey = Deno.env.get('GIANTBOMB_API_KEY');

    if (!giantBombApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Giant Bomb API key not configured. Please add GIANTBOMB_API_KEY to your environment variables.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      reviews_added: 0,
      gallery_added: 0,
      videos_added: 0,
      errors: [] as string[],
    };

    const games = await fetchGiantBombGames(giantBombApiKey);

    for (const game of games.slice(0, 10)) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!game.deck && !game.description) {
        continue;
      }

      const reviewSlug = createSlug(`${game.name}-giantbomb-${game.id}`);
      const { data: existingReview } = await supabase
        .from('game_reviews')
        .select('id')
        .eq('slug', reviewSlug)
        .maybeSingle();

      if (!existingReview) {
        const { error } = await supabase.from('game_reviews').insert({
          game_title: game.name,
          slug: reviewSlug,
          game_cover: game.image?.super_url || game.image?.original_url || game.image?.screen_large_url,
          platform: game.platforms?.map(p => p.name).join(', ') || 'Multiple Platforms',
          genre: game.genres?.map(g => g.name).join(', ') || 'Various',
          developer: game.developers?.map(d => d.name).join(', ') || 'Unknown',
          publisher: game.publishers?.map(p => p.name).join(', ') || 'Unknown',
          release_date: game.original_release_date || null,
          rating: null,
          excerpt: truncateText(game.deck || game.description, 200),
          content: stripHtml(game.description || game.deck),
          reviewer: 'Giant Bomb',
          published_at: new Date().toISOString(),
          view_count: 0,
          is_featured: false,
        });

        if (error) {
          results.errors.push(`Failed to add review for ${game.name}: ${error.message}`);
        } else {
          results.reviews_added++;
        }
      }

      const images = await fetchGameImages(game.id, giantBombApiKey);
      for (const image of images.slice(0, 3)) {
        const imageSlug = createSlug(`${game.name}-giantbomb-${image.id}`);
        const { data: existingImage } = await supabase
          .from('gallery_images')
          .select('id')
          .eq('slug', imageSlug)
          .maybeSingle();

        if (!existingImage) {
          const { error } = await supabase.from('gallery_images').insert({
            title: `${game.name} - Screenshot`,
            slug: imageSlug,
            description: `Official image from ${game.name} via Giant Bomb`,
            image_url: image.original || image.screen_large,
            thumbnail_url: image.thumb,
            category: 'Screenshots',
            game_title: game.name,
            photographer: 'Giant Bomb',
            published_at: new Date().toISOString(),
            view_count: 0,
            is_featured: false,
          });

          if (!error) {
            results.gallery_added++;
          }
        }
      }
    }

    const videos = await fetchGiantBombVideos(giantBombApiKey);
    for (const video of videos.slice(0, 15)) {
      const videoSlug = createSlug(`${video.name}-giantbomb-${video.id}`);
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('slug', videoSlug)
        .maybeSingle();

      if (!existingVideo) {
        const { error } = await supabase.from('videos').insert({
          title: video.name,
          slug: videoSlug,
          description: truncateText(video.deck || `Gaming video from Giant Bomb`, 300),
          video_url: video.site_detail_url,
          thumbnail: video.image?.super_url || video.image?.screen_large_url,
          category: 'Giant Bomb',
          duration: formatDuration(video.length_seconds),
          creator: video.user || 'Giant Bomb',
          published_at: video.publish_date,
          view_count: 0,
          is_featured: false,
        });

        if (!error) {
          results.videos_added++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Added ${results.reviews_added} reviews, ${results.gallery_added} images, and ${results.videos_added} videos from Giant Bomb`,
        ...results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Giant Bomb content:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});