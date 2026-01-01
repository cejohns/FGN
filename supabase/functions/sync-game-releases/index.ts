import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

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
    const daysAhead = url.searchParams.get('days') || '90';
    const platforms = url.searchParams.get('platforms') || '';
    const source = url.searchParams.get('source') || 'igdb';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    let result;
    let apiConfigured = false;

    if (source === 'demo') {
      const demoUrl = `${supabaseUrl}/functions/v1/seed-demo-releases`;
      const demoRes = await fetch(demoUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!demoRes.ok) {
        throw new Error(`Demo seed failed: ${demoRes.status}`);
      }

      result = await demoRes.json();
    } else if (source === 'rawg') {
      const rawgUrl = `${supabaseUrl}/functions/v1/fetch-rawg-releases?days=${daysAhead}${platforms ? `&platforms=${platforms}` : ''}`;
      const rawgRes = await fetch(rawgUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!rawgRes.ok) {
        const errorData = await rawgRes.json();
        if (errorData.error?.includes('RAWG_API_KEY')) {
          apiConfigured = false;
          throw new Error('RAWG_API_KEY not configured. Using demo data instead.');
        }
        throw new Error(`RAWG fetch failed: ${rawgRes.status}`);
      }

      result = await rawgRes.json();
      apiConfigured = true;
    } else {
      const igdbUrl = `${supabaseUrl}/functions/v1/fetch-igdb-releases?days=${daysAhead}${platforms ? `&platforms=${platforms}` : ''}`;
      const igdbRes = await fetch(igdbUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (igdbRes.ok) {
        result = await igdbRes.json();
        apiConfigured = true;
      } else {
        const errorData = await igdbRes.json();
        if (errorData.error?.includes('TWITCH_CLIENT_ID')) {
          apiConfigured = false;
        }
        
        console.warn('IGDB failed, trying RAWG fallback');
        const rawgUrl = `${supabaseUrl}/functions/v1/fetch-rawg-releases?days=${daysAhead}${platforms ? `&platforms=${platforms}` : ''}`;
        const rawgRes = await fetch(rawgUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        });

        if (rawgRes.ok) {
          result = await rawgRes.json();
          result.fallback = true;
          apiConfigured = true;
        } else {
          console.warn('Both IGDB and RAWG failed, loading demo data');
          const demoUrl = `${supabaseUrl}/functions/v1/seed-demo-releases`;
          const demoRes = await fetch(demoUrl, {
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          });

          if (!demoRes.ok) {
            throw new Error('All sync methods failed including demo data');
          }

          result = await demoRes.json();
          result.isDemo = true;
        }
      }
    }

    let message = result.message || `Successfully synced ${result.inserted || 0} new releases and updated ${result.updated || 0} existing ones from ${result.source}`;
    
    if (result.isDemo || !apiConfigured) {
      message += ' \n\nNote: API credentials not configured. To sync real game data:\n1. Get Twitch API credentials from https://dev.twitch.tv/console/apps\n2. Get RAWG API key from https://rawg.io/apidocs\n3. Configure them in your Supabase project settings.';
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message,
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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    try {
      console.log('Attempting to load demo data as final fallback');
      const demoUrl = `${supabaseUrl}/functions/v1/seed-demo-releases`;
      const demoRes = await fetch(demoUrl, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (demoRes.ok) {
        const result = await demoRes.json();
        return new Response(
          JSON.stringify({
            success: true,
            ...result,
            message: result.message + ' (Loaded due to API configuration issues)',
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } catch (demoError) {
      console.error('Demo fallback also failed:', demoError);
    }

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