import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';
import { igdbFetch } from '../_shared/igdbClient.ts';
import { buildCoverUrl, buildScreenshotUrl } from '../_shared/igdbImages.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

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

    const releases = await igdbFetch('release_dates', query);

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

      const coverImage = buildCoverUrl(release.game?.cover?.image_id);

      const screenshots = release.game?.screenshots || [];
      const bannerImage = screenshots.length > 0
        ? buildScreenshotUrl(screenshots[0].image_id)
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
