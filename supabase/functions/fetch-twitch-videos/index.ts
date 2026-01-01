import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchClip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
  vod_offset: number | null;
}

interface TwitchVideo {
  id: string;
  stream_id: string | null;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: any[] | null;
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
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

function parseDuration(duration: string): string {
  const match = duration.match(/(\d+)h(\d+)m(\d+)s/);
  if (match) {
    const [, hours, minutes, seconds] = match;
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  
  const matchMin = duration.match(/(\d+)m(\d+)s/);
  if (matchMin) {
    const [, minutes, seconds] = matchMin;
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }

  return duration;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

async function getTwitchAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.statusText}`);
  }

  const data: TwitchAuthResponse = await response.json();
  return data.access_token;
}

async function getTopGames(accessToken: string, clientId: string): Promise<TwitchGame[]> {
  const response = await fetch(
    'https://api.twitch.tv/helix/games/top?first=20',
    {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch top games: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function getClipsForGame(
  gameId: string,
  accessToken: string,
  clientId: string
): Promise<TwitchClip[]> {
  const response = await fetch(
    `https://api.twitch.tv/helix/clips?game_id=${gameId}&first=10`,
    {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error(`Failed to fetch clips for game ${gameId}: ${response.statusText}`);
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

async function getVideosForGame(
  gameId: string,
  accessToken: string,
  clientId: string
): Promise<TwitchVideo[]> {
  const response = await fetch(
    `https://api.twitch.tv/helix/videos?game_id=${gameId}&type=archive&first=5`,
    {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error(`Failed to fetch videos for game ${gameId}: ${response.statusText}`);
    return [];
  }

  const data = await response.json();
  return data.data || [];
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
    const clientId = 'rnw61nqz5dhc3qhy3rfiuywunz8nge';
    const clientSecret = 'ib0sq0y0o0h7jpf5qdgkerj3he008z';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const accessToken = await getTwitchAccessToken(clientId, clientSecret);
    const topGames = await getTopGames(accessToken, clientId);

    const results = {
      clips_added: 0,
      videos_added: 0,
      errors: [] as string[],
    };

    for (const game of topGames.slice(0, 5)) {
      const clips = await getClipsForGame(game.id, accessToken, clientId);
      
      for (const clip of clips.slice(0, 3)) {
        const slug = createSlug(`${clip.title}-${clip.id}`);
        
        const { error: existingError, data: existing } = await supabase
          .from('videos')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          continue;
        }

        const { error } = await supabase.from('videos').insert({
          title: clip.title,
          slug,
          description: `${game.name} clip by ${clip.creator_name}`,
          video_url: clip.url,
          thumbnail: clip.thumbnail_url,
          category: 'Clips',
          duration: formatDuration(Math.floor(clip.duration)),
          creator: clip.creator_name,
          published_at: clip.created_at,
          view_count: 0,
          is_featured: false,
        });

        if (error) {
          results.errors.push(`Failed to add clip ${clip.id}: ${error.message}`);
        } else {
          results.clips_added++;
        }
      }

      const videos = await getVideosForGame(game.id, accessToken, clientId);
      
      for (const video of videos.slice(0, 2)) {
        const slug = createSlug(`${video.title}-${video.id}`);
        
        const { error: existingError, data: existing } = await supabase
          .from('videos')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          continue;
        }

        const { error } = await supabase.from('videos').insert({
          title: video.title,
          slug,
          description: video.description || `${game.name} gameplay by ${video.user_name}`,
          video_url: video.url,
          thumbnail: video.thumbnail_url.replace('%{width}', '1280').replace('%{height}', '720'),
          category: 'Gameplay',
          duration: parseDuration(video.duration),
          creator: video.user_name,
          published_at: video.published_at,
          view_count: 0,
          is_featured: false,
        });

        if (error) {
          results.errors.push(`Failed to add video ${video.id}: ${error.message}`);
        } else {
          results.videos_added++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Added ${results.clips_added} clips and ${results.videos_added} videos from Twitch`,
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
    console.error('Error fetching Twitch videos:', error);
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