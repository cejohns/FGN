const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface FetchResult {
  success: boolean;
  results?: any;
  error?: string;
  timestamp?: string;
}

async function callEdgeFunction(url: string, name: string): Promise<FetchResult> {
  try {
    console.log(`Calling ${name} function...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(`${name} completed:`, data.success ? 'Success' : 'Failed');
    return data;
  } catch (error) {
    console.error(`Error calling ${name}:`, error);
    return {
      success: false,
      error: error.message,
    };
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
    const functionBase = `${supabaseUrl}/functions/v1`;

    console.log('Starting comprehensive gaming content fetch...');

    const results = {
      rss_news: { success: false, count: 0 },
      igdb_games: { success: false, count: 0 },
      game_deals: { success: false, count: 0 },
      total_items: 0,
      errors: [] as string[],
    };

    const rssResult = await callEdgeFunction(
      `${functionBase}/fetch-gaming-news`,
      'RSS News'
    );
    results.rss_news.success = rssResult.success;
    if (rssResult.results) {
      results.rss_news.count = rssResult.results.news_articles || 0;
      results.total_items += results.rss_news.count;
    }
    if (rssResult.error) {
      results.errors.push(`RSS: ${rssResult.error}`);
    }

    const dealsResult = await callEdgeFunction(
      `${functionBase}/fetch-game-deals`,
      'Game Deals'
    );
    results.game_deals.success = dealsResult.success;
    if (dealsResult.results) {
      results.game_deals.count = dealsResult.results.news_articles || 0;
      results.total_items += results.game_deals.count;
    }
    if (dealsResult.error) {
      results.errors.push(`Deals: ${dealsResult.error}`);
    }

    const igdbResult = await callEdgeFunction(
      `${functionBase}/fetch-igdb-games`,
      'IGDB Games'
    );
    results.igdb_games.success = igdbResult.success;
    if (igdbResult.results) {
      results.igdb_games.count = (igdbResult.results.game_reviews || 0) + (igdbResult.results.news_articles || 0);
      results.total_items += results.igdb_games.count;
    }
    if (igdbResult.error) {
      results.errors.push(`IGDB: ${igdbResult.error}`);
    }

    const allSuccess = results.rss_news.success || results.game_deals.success || results.igdb_games.success;

    console.log('Comprehensive fetch completed:', results);

    return new Response(
      JSON.stringify({
        success: allSuccess,
        message: `Gaming content fetch completed. Added ${results.total_items} items.`,
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
    console.error('Error in comprehensive fetch:', error);
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
