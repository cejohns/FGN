import { corsHeaders } from '../_shared/cors.ts';
import { igdbFetch } from '../_shared/igdbClient.ts';
import { buildCoverUrl, buildScreenshotUrl, buildLogoUrl } from '../_shared/igdbImages.ts';

interface GameQueryParams {
  type: 'featured' | 'upcoming' | 'search' | 'slug' | 'id';
  query?: string;
  limit?: number;
  slug?: string;
  id?: string;
}

function normalizeGame(game: any) {
  const screenshots = (game.screenshots || []).map((s: any) => buildScreenshotUrl(s.image_id));

  return {
    id: game.id?.toString() || '',
    title: game.name || '',
    slug: game.slug || createSlug(game.name || ''),
    description: game.summary || '',
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
      : null,
    platforms: (game.platforms || []).map((p: any) => p.name).filter(Boolean),
    genres: (game.genres || []).map((g: any) => g.name).filter(Boolean),
    coverImage: buildCoverUrl(game.cover?.image_id),
    screenshots,
    rating: game.rating ? game.rating / 10 : undefined,
    developer: game.involved_companies?.find((c: any) => c.developer)?.company?.name,
    publisher: game.involved_companies?.find((c: any) => c.publisher)?.company?.name,
    website: game.websites?.find((w: any) => w.url)?.url,
  };
}

function normalizeRelease(release: any) {
  return {
    id: release.id?.toString() || '',
    title: release.game?.name || '',
    slug: createSlug(release.game?.name || ''),
    releaseDate: new Date(release.date * 1000).toISOString().split('T')[0],
    platforms: [release.platform?.name, ...(release.platforms || []).map((p: any) => p.name)]
      .filter(Boolean),
    coverImage: buildCoverUrl(release.game?.cover?.image_id),
    description: release.game?.summary,
  };
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

async function handleFeaturedGames(limit: number = 10) {
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsAgo = now - (180 * 24 * 60 * 60);

  const query = `
    fields name, slug, summary, cover.image_id, screenshots.image_id, rating, first_release_date,
           genres.name, platforms.name, involved_companies.company.name,
           involved_companies.developer, involved_companies.publisher, websites.url;
    where first_release_date >= ${sixMonthsAgo} & rating >= 75 & rating_count >= 10;
    sort rating desc;
    limit ${limit};
  `;

  const games = await igdbFetch('games', query);
  return games.map(normalizeGame);
}

async function handleUpcomingReleases(limit: number = 10) {
  const now = Math.floor(Date.now() / 1000);
  const threeMonthsLater = now + (90 * 24 * 60 * 60);

  const query = `
    fields id, date, platform.name, platforms.name,
           game.name, game.summary, game.cover.image_id, game.screenshots.image_id;
    where date >= ${now} & date < ${threeMonthsLater} & game != null;
    sort date asc;
    limit ${limit};
  `;

  const releases = await igdbFetch('release_dates', query);
  return releases.map(normalizeRelease);
}

async function handleSearchGames(searchQuery: string, limit: number = 10) {
  const query = `
    search "${searchQuery}";
    fields name, slug, summary, cover.image_id, screenshots.image_id, rating, first_release_date,
           genres.name, platforms.name, involved_companies.company.name,
           involved_companies.developer, involved_companies.publisher, websites.url;
    limit ${limit};
  `;

  const games = await igdbFetch('games', query);
  return games.map(normalizeGame);
}

async function handleGameBySlug(slug: string) {
  const query = `
    fields name, slug, summary, cover.image_id, screenshots.image_id, rating, first_release_date,
           genres.name, platforms.name, involved_companies.company.name,
           involved_companies.developer, involved_companies.publisher, websites.url;
    where slug = "${slug}";
    limit 1;
  `;

  const games = await igdbFetch('games', query);
  return games.length > 0 ? normalizeGame(games[0]) : null;
}

async function handleGameById(id: string) {
  const query = `
    fields name, slug, summary, cover.image_id, screenshots.image_id, rating, first_release_date,
           genres.name, platforms.name, involved_companies.company.name,
           involved_companies.developer, involved_companies.publisher, websites.url;
    where id = ${id};
    limit 1;
  `;

  const games = await igdbFetch('games', query);
  return games.length > 0 ? normalizeGame(games[0]) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') as GameQueryParams['type'];
    const query = url.searchParams.get('query') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const slug = url.searchParams.get('slug') || '';
    const id = url.searchParams.get('id') || '';

    let result;

    switch (type) {
      case 'featured':
        result = await handleFeaturedGames(limit);
        break;
      case 'upcoming':
        result = await handleUpcomingReleases(limit);
        break;
      case 'search':
        if (!query) {
          throw new Error('Search query is required');
        }
        result = await handleSearchGames(query, limit);
        break;
      case 'slug':
        if (!slug) {
          throw new Error('Slug is required');
        }
        result = await handleGameBySlug(slug);
        break;
      case 'id':
        if (!id) {
          throw new Error('ID is required');
        }
        result = await handleGameById(id);
        break;
      default:
        throw new Error(`Invalid query type: ${type}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[query-igdb] Error:', error);

    const isConfigError = error instanceof Error &&
      error.message.includes('credentials not configured');

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        configured: !isConfigError,
      }),
      {
        status: isConfigError ? 503 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
