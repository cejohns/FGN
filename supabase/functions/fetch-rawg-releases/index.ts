import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const RAWG_URL = 'https://api.rawg.io/api';

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const rawgApiKey = Deno.env.get('RAWG_API_KEY');
    if (!rawgApiKey) {
      throw new Error('RAWG_API_KEY must be configured');
    }

    const url = new URL(req.url);
    const daysAhead = parseInt(url.searchParams.get('days') || '90');
    const platformIds = url.searchParams.get('platforms')?.split(',').map(Number).filter(Boolean);

    const now = new Date();
    const end = new Date(Date.now() + daysAhead * 86400000);
    const startDate = now.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    const params = new URLSearchParams({
      key: rawgApiKey,
      dates: `${startDate},${endDate}`,
      ordering: 'released',
      page_size: '40',
    });

    if (platformIds && platformIds.length > 0) {
      params.set('platforms', platformIds.join(','));
    }

    const rawgRes = await fetch(`${RAWG_URL}/games?${params.toString()}`);

    if (!rawgRes.ok) {
      throw new Error(`RAWG API error: ${rawgRes.status}`);
    }

    const data = await rawgRes.json();
    const releases = data.results || [];

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const game of releases) {
      if (!game.name || !game.released) {
        skipped++;
        continue;
      }

      const platforms = (game.platforms || [])
        .map((p: any) => p.platform?.name)
        .filter(Boolean)
        .join(', ') || 'PC';

      const genres = (game.genres || [])
        .map((g: any) => g.name)
        .filter(Boolean);
      const genreStr = genres.join(', ') || 'Action';

      const coverImage = game.background_image || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg';
      const title = game.name;
      const slug = createSlug(title);

      const { data: existing } = await supabase
        .from('game_releases')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      const gameData = {
        title,
        slug,
        description: game.description_raw || `${title} is an upcoming game releasing soon.`,
        cover_image: coverImage,
        banner_image: coverImage,
        genre: genreStr,
        platform: platforms,
        developer: game.developers?.[0]?.name || 'TBA',
        publisher: game.publishers?.[0]?.name || 'TBA',
        release_date: game.released,
        preorder_link: game.website || '',
        rating_expected: game.esrb_rating?.name || '',
        features: genres.length > 0 ? genres.slice(0, 5) : ['Action-packed gameplay', 'Stunning graphics', 'Immersive story'],
        is_featured: game.rating > 4.5,
      };

      if (existing) {
        await supabase
          .from('game_releases')
          .update(gameData)
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('game_releases')
          .insert(gameData);
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: 'rawg',
        fetched: releases.length,
        inserted,
        updated,
        skipped,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching RAWG releases:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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