import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  cover?: {
    url: string;
    image_id: string;
  };
  rating?: number;
  first_release_date?: number;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ name: string }>;
  involved_companies?: Array<{
    company: { name: string };
    developer: boolean;
    publisher: boolean;
  }>;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

function getDefaultImage(): string {
  return 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg';
}

async function getIGDBAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );

    if (!response.ok) {
      console.error('Failed to get IGDB access token:', response.status);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting IGDB access token:', error);
    return null;
  }
}

async function fetchIGDBGames(accessToken: string, clientId: string): Promise<IGDBGame[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

    const query = `
      fields name, summary, cover.url, cover.image_id, rating, first_release_date, genres.name, platforms.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher;
      where first_release_date >= ${thirtyDaysAgo} & first_release_date <= ${now} & rating >= 70;
      sort rating desc;
      limit 10;
    `;

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    });

    if (!response.ok) {
      console.error('IGDB API error:', response.status, await response.text());
      return [];
    }

    const games = await response.json();
    console.log(`Fetched ${games.length} games from IGDB`);
    return games;
  } catch (error) {
    console.error('Error fetching IGDB games:', error);
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
    const igdbClientId = Deno.env.get('IGDB_CLIENT_ID');
    const igdbClientSecret = Deno.env.get('IGDB_CLIENT_SECRET');

    if (!igdbClientId || !igdbClientSecret) {
      console.warn('IGDB credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'IGDB API credentials not configured. Please add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET environment variables.',
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Getting IGDB access token...');
    const accessToken = await getIGDBAccessToken(igdbClientId, igdbClientSecret);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to authenticate with IGDB API',
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

    console.log('Fetching games from IGDB...');
    const games = await fetchIGDBGames(accessToken, igdbClientId);

    const results = {
      game_reviews: 0,
      news_articles: 0,
      gallery_images: 0,
      errors: [] as string[],
    };

    for (const game of games) {
      try {
        const slug = generateSlug(game.name);
        
        const existingReview = await supabase
          .from('game_reviews')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!existingReview.data) {
          const coverUrl = game.cover?.url 
            ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
            : getDefaultImage();

          const developer = game.involved_companies?.find(c => c.developer)?.company.name || 'Various';
          const publisher = game.involved_companies?.find(c => c.publisher)?.company.name || 'Various';
          const platform = game.platforms?.map(p => p.name).join(', ') || 'Multi-platform';
          const genre = game.genres?.[0]?.name || 'Adventure';
          const rating = game.rating ? (game.rating / 10).toFixed(1) : '8.0';
          const releaseDate = game.first_release_date 
            ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          const excerpt = game.summary?.substring(0, 200) || `An exciting ${genre} game that has garnered positive reviews.`;
          const content = game.summary || `${game.name} is a ${genre} game developed by ${developer} and published by ${publisher}. Released for ${platform}, it offers an engaging experience for players.`;

          const { error: reviewError } = await supabase
            .from('game_reviews')
            .insert({
              game_title: game.name,
              slug: slug,
              game_cover: coverUrl,
              platform: platform,
              genre: genre,
              developer: developer,
              publisher: publisher,
              release_date: releaseDate,
              rating: parseFloat(rating),
              excerpt: excerpt,
              content: content,
              reviewer: 'IGDB Reviews',
              published_at: new Date().toISOString(),
              view_count: 0,
              is_featured: results.game_reviews < 3,
            });

          if (reviewError) {
            results.errors.push(`Error adding review for ${game.name}: ${reviewError.message}`);
          } else {
            results.game_reviews++;
            console.log(`Added game review: ${game.name}`);
          }

          const newsSlug = generateSlug(`${game.name} released`);
          const existingNews = await supabase
            .from('news_articles')
            .select('id')
            .eq('slug', newsSlug)
            .maybeSingle();

          if (!existingNews.data) {
            const { error: newsError } = await supabase
              .from('news_articles')
              .insert({
                title: `${game.name} Now Available`,
                slug: newsSlug,
                excerpt: `${game.name} has been released for ${platform}.`,
                content: `${game.name}, the highly anticipated ${genre} title from ${developer}, is now available on ${platform}. ${game.summary || 'The game promises an exciting experience for players.'}`,
                featured_image: coverUrl,
                category: 'Game Releases',
                author: 'IGDB',
                published_at: new Date(game.first_release_date ? game.first_release_date * 1000 : Date.now()).toISOString(),
                view_count: 0,
                is_featured: results.news_articles < 3,
              });

            if (!newsError) {
              results.news_articles++;
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing game ${game.name}: ${error.message}`);
      }
    }

    console.log('IGDB fetch results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'IGDB games fetched successfully',
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in IGDB fetch function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
