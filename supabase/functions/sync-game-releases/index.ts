const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const daysAhead = url.searchParams.get('days') || '90';
    const platforms = url.searchParams.get('platforms') || '';
    const source = url.searchParams.get('source') || 'igdb';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    let result;

    if (source === 'rawg') {
      const rawgUrl = `${supabaseUrl}/functions/v1/fetch-rawg-releases?days=${daysAhead}${platforms ? `&platforms=${platforms}` : ''}`;
      const rawgRes = await fetch(rawgUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!rawgRes.ok) {
        throw new Error(`RAWG fetch failed: ${rawgRes.status}`);
      }

      result = await rawgRes.json();
    } else {
      const igdbUrl = `${supabaseUrl}/functions/v1/fetch-igdb-releases?days=${daysAhead}${platforms ? `&platforms=${platforms}` : ''}`;
      const igdbRes = await fetch(igdbUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (igdbRes.ok) {
        result = await igdbRes.json();
      } else {
        console.warn('IGDB failed, falling back to RAWG');
        const rawgUrl = `${supabaseUrl}/functions/v1/fetch-rawg-releases?days=${daysAhead}${platforms ? `&platforms=${platforms}` : ''}`;
        const rawgRes = await fetch(rawgUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        });

        if (!rawgRes.ok) {
          throw new Error('Both IGDB and RAWG failed');
        }

        result = await rawgRes.json();
        result.fallback = true;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `Successfully synced ${result.inserted || 0} new releases and updated ${result.updated || 0} existing ones from ${result.source}`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error syncing releases:', error);
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