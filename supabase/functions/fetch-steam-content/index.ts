import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SteamAppDetails {
  type: string;
  name: string;
  steam_appid: number;
  required_age: number;
  is_free: boolean;
  detailed_description: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  website?: string;
  developers?: string[];
  publishers?: string[];
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
  };
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  metacritic?: {
    score: number;
    url: string;
  };
  categories?: Array<{
    id: number;
    description: string;
  }>;
  genres?: Array<{
    id: string;
    description: string;
  }>;
  screenshots?: Array<{
    id: number;
    path_thumbnail: string;
    path_full: string;
  }>;
  movies?: Array<{
    id: number;
    name: string;
    thumbnail: string;
    webm: {
      480: string;
      max: string;
    };
    mp4: {
      480: string;
      max: string;
    };
    highlight: boolean;
  }>;
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  background: string;
  background_raw?: string;
}

interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
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
    .replace(/\[.*?\]/g, '')
    .trim();
}

function truncateText(text: string, maxLength: number): string {
  const cleaned = stripHtml(text);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3) + '...';
}

async function getTopSteamGames(): Promise<number[]> {
  try {
    const response = await fetch(
      'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/'
    );

    if (!response.ok) {
      console.error('Failed to fetch top Steam games');
      return [];
    }

    const data = await response.json();
    const topGames = data.response?.ranks || [];
    return topGames.slice(0, 20).map((game: any) => game.appid);
  } catch (error) {
    console.error('Error fetching top Steam games:', error);
    return [];
  }
}

async function getSteamGameDetails(appId: number): Promise<SteamAppDetails | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data[appId]?.success && data[appId]?.data) {
      return data[appId].data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching Steam game ${appId}:`, error);
    return null;
  }
}

async function getSteamGameNews(appId: number): Promise<SteamNewsItem[]> {
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.appnews?.newsitems || [];
  } catch (error) {
    console.error(`Error fetching Steam news for ${appId}:`, error);
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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      reviews_added: 0,
      news_added: 0,
      gallery_added: 0,
      videos_added: 0,
      errors: [] as string[],
    };

    const topGameIds = await getTopSteamGames();

    if (topGameIds.length === 0) {
      results.errors.push('Failed to fetch top Steam games');
    }

    for (const appId of topGameIds.slice(0, 10)) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const gameDetails = await getSteamGameDetails(appId);
      if (!gameDetails || gameDetails.type !== 'game') {
        continue;
      }

      const reviewSlug = createSlug(`${gameDetails.name}-steam-${appId}`);
      const { data: existingReview } = await supabase
        .from('game_reviews')
        .select('id')
        .eq('slug', reviewSlug)
        .maybeSingle();

      if (!existingReview && gameDetails.metacritic) {
        const platforms = [];
        if (gameDetails.platforms.windows) platforms.push('Windows');
        if (gameDetails.platforms.mac) platforms.push('Mac');
        if (gameDetails.platforms.linux) platforms.push('Linux');

        const { error } = await supabase.from('game_reviews').insert({
          game_title: gameDetails.name,
          slug: reviewSlug,
          game_cover: gameDetails.header_image,
          platform: platforms.join(', '),
          genre: gameDetails.genres?.map(g => g.description).join(', ') || 'Various',
          developer: gameDetails.developers?.join(', ') || 'Unknown',
          publisher: gameDetails.publishers?.join(', ') || 'Unknown',
          release_date: gameDetails.release_date.date,
          rating: (gameDetails.metacritic.score / 10).toFixed(1),
          excerpt: truncateText(gameDetails.short_description, 200),
          content: stripHtml(gameDetails.detailed_description),
          reviewer: 'Steam Editorial',
          published_at: new Date().toISOString(),
          view_count: 0,
          is_featured: false,
        });

        if (error) {
          results.errors.push(`Failed to add review for ${gameDetails.name}: ${error.message}`);
        } else {
          results.reviews_added++;
        }
      }

      if (gameDetails.screenshots) {
        for (const screenshot of gameDetails.screenshots.slice(0, 3)) {
          const gallerySlug = createSlug(`${gameDetails.name}-screenshot-${screenshot.id}`);
          const { data: existingImage } = await supabase
            .from('gallery_images')
            .select('id')
            .eq('slug', gallerySlug)
            .maybeSingle();

          if (!existingImage) {
            const { error } = await supabase.from('gallery_images').insert({
              title: `${gameDetails.name} - Screenshot`,
              slug: gallerySlug,
              description: `Official screenshot from ${gameDetails.name} on Steam`,
              image_url: screenshot.path_full,
              thumbnail_url: screenshot.path_thumbnail,
              category: 'Screenshots',
              game_title: gameDetails.name,
              photographer: 'Steam',
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

      if (gameDetails.movies) {
        for (const movie of gameDetails.movies.slice(0, 2)) {
          const videoSlug = createSlug(`${gameDetails.name}-video-${movie.id}`);
          const { data: existingVideo } = await supabase
            .from('videos')
            .select('id')
            .eq('slug', videoSlug)
            .maybeSingle();

          if (!existingVideo) {
            const { error } = await supabase.from('videos').insert({
              title: movie.name || `${gameDetails.name} - Trailer`,
              slug: videoSlug,
              description: `Official video for ${gameDetails.name} from Steam`,
              video_url: movie.mp4['480'],
              thumbnail: movie.thumbnail,
              category: 'Trailer',
              duration: '',
              creator: 'Steam',
              published_at: new Date().toISOString(),
              view_count: 0,
              is_featured: false,
            });

            if (!error) {
              results.videos_added++;
            }
          }
        }
      }

      const newsItems = await getSteamGameNews(appId);
      for (const newsItem of newsItems.slice(0, 2)) {
        const newsSlug = createSlug(`${newsItem.title}-${newsItem.gid}`);
        const { data: existingNews } = await supabase
          .from('news_articles')
          .select('id')
          .eq('slug', newsSlug)
          .maybeSingle();

        if (!existingNews) {
          const { error } = await supabase.from('news_articles').insert({
            title: newsItem.title,
            slug: newsSlug,
            excerpt: truncateText(newsItem.contents, 200),
            content: stripHtml(newsItem.contents),
            featured_image: gameDetails.header_image,
            category: 'Steam News',
            author: newsItem.author || 'Steam',
            published_at: new Date(newsItem.date * 1000).toISOString(),
            view_count: 0,
            is_featured: false,
          });

          if (!error) {
            results.news_added++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Added ${results.reviews_added} reviews, ${results.news_added} news articles, ${results.gallery_added} images, and ${results.videos_added} videos from Steam`,
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
    console.error('Error fetching Steam content:', error);
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