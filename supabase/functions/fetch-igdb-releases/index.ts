import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_URL = 'https://api.igdb.com/v4';

let cachedToken: { value: string; exp: number } | null = null;

async function getTwitchToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.exp > now + 60000) {
    return cachedToken.value;
  }

  const clientId = Deno.env.get('TWITCH_CLIENT_ID');
  const clientSecret = Deno.env.get('TWITCH_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be configured');
  }

  const tokenUrl = `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
  const res = await fetch(tokenUrl, { method: 'POST' });

  if (!res.ok) {
    throw new Error(`Twitch token error ${res.status}`);
  }

  const json = await res.json();
  cachedToken = {
    value: json.access_token,
    exp: now + json.expires_in * 1000,
  };

  return cachedToken.value;
}

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

  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return createUnauthorizedResponse(authResult.error);
  }

  try {
    const url = new URL(req.url);
    const daysAhead = parseInt(url.searchParams.get('days') || '90');
    const platformIds = url.searchParams.get('platforms')?.split(',').map(Number).filter(Boolean);

    const now = Date.now();
    const end = now + daysAhead * 86400000;
    const startEpoch = Math.floor(now / 1000);
    const endEpoch = Math.floor(end / 1000);

    const token = await getTwitchToken();
    const clientId = Deno.env.get('TWITCH_CLIENT_ID');

    const whereParts = [
      `date >= ${startEpoch}`,
      `date < ${endEpoch}`,
      'game != null',
    ];

    if (platformIds && platformIds.length > 0) {
      whereParts.push(`platform = (${platformIds.join(',')})`);
    }

    const query = `fields id, date, platform.name, platforms.name, game.name, game.summary, game.cover.image_id, game.screenshots.image_id, game.genres.name, game.websites.url, game.category, game.status;
where ${whereParts.join(' & ')};
sort date asc;
limit 200;`;

    const igdbRes = await fetch(`${IGDB_URL}/release_dates`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    });

    if (!igdbRes.ok) {
      throw new Error(`IGDB API error: ${igdbRes.status}`);
    }

    const releases = await igdbRes.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const release of releases) {
      if (!release.game?.name) {
        skipped++;
        continue;
      }

      const coverId = release.game?.cover?.image_id;
      const coverImage = coverId
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverId}.jpg`
        : 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg';

      const screenshots = release.game?.screenshots || [];
      const bannerImage = screenshots.length > 0
        ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshots[0].image_id}.jpg`
        : coverImage;

      const platforms = [];
      if (release.platform?.name) platforms.push(release.platform.name);
      if (release.platforms) {
        platforms.push(...release.platforms.map((p: any) => p.name).filter(Boolean));
      }
      const platformStr = [...new Set(platforms)].join(', ') || 'PC';

      const genres = (release.game?.genres || []).map((g: any) => g.name).filter(Boolean);
      const genreStr = genres.join(', ') || 'Action';

      const website = release.game?.websites?.find((w: any) => w?.url)?.url || '';
      const releaseDate = new Date(release.date * 1000).toISOString().split('T')[0];
      const title = release.game.name;
      const slug = createSlug(title);

      const { data: existing } = await supabase
        .from('game_releases')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      const gameData = {
        title,
        slug,
        description: release.game?.summary || `${title} is an upcoming game releasing soon.`,
        cover_image: coverImage,
        banner_image: bannerImage,
        genre: genreStr,
        platform: platformStr,
        developer: 'TBA',
        publisher: 'TBA',
        release_date: releaseDate,
        preorder_link: website || '',
        features: genres.length > 0 ? genres.slice(0, 5) : ['Action-packed gameplay', 'Stunning graphics', 'Immersive story'],
        is_featured: false,
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
        source: 'igdb',
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
    console.error('Error fetching IGDB releases:', error);
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