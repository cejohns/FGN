import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface YouTubeChannel {
  id: string;
  label: string;
  platform: 'ps' | 'xbox' | 'nintendo' | 'other';
}

const YT_CHANNELS: YouTubeChannel[] = [
  {
    id: 'UC-2Y8dQb0S6DtpxNgAKoJKA',
    label: 'PlayStation',
    platform: 'ps',
  },
  {
    id: 'UCjBp_7RuDBUYbd1LegWEJ8g',
    label: 'Xbox',
    platform: 'xbox',
  },
  {
    id: 'UCGIY_O-8vW4rfX98KlMkvRg',
    label: 'Nintendo',
    platform: 'nintendo',
  },
];

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface NewsPost {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  image_url: string | null;
  source: string;
  source_url: string;
  platform: 'ps' | 'xbox' | 'nintendo' | 'other';
  type: 'studio-announcement';
  published_at: string;
  auto_generated: boolean;
}

function toSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return slug || crypto.randomUUID();
}

function createExcerpt(description: string): string {
  let excerpt = description.replace(/\n/g, ' ').trim();
  if (excerpt.length > 260) {
    excerpt = excerpt.substring(0, 257) + '...';
  }
  return excerpt;
}

function mapYouTubeVideoToNewsPost(
  video: YouTubeVideo,
  channel: YouTubeChannel
): NewsPost {
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
  
  const imageUrl = 
    video.snippet.thumbnails.high?.url ||
    video.snippet.thumbnails.medium?.url ||
    video.snippet.thumbnails.default?.url ||
    null;

  const body = `<div class="youtube-video">
  <h2>${video.snippet.title}</h2>
  <p>${video.snippet.description}</p>
  <p><a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>
</div>`;

  return {
    title: video.snippet.title,
    slug: toSlug(video.snippet.title),
    body,
    excerpt: createExcerpt(video.snippet.description),
    image_url: imageUrl,
    source: channel.label.toLowerCase(),
    source_url: videoUrl,
    platform: channel.platform,
    type: 'studio-announcement',
    published_at: video.snippet.publishedAt,
    auto_generated: true,
  };
}

async function fetchChannelVideos(
  apiKey: string,
  channelId: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&type=video&maxResults=${maxResults}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    throw error;
  }
}

async function saveNewsPostIfNew(
  supabase: any,
  post: NewsPost
): Promise<{ created: boolean; post: any }> {
  const { data: existing } = await supabase
    .from('news_posts')
    .select('*')
    .eq('source_url', post.source_url)
    .maybeSingle();

  if (existing) {
    return { created: false, post: existing };
  }

  const { data: created, error } = await supabase
    .from('news_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { created: true, post: created };
}

async function importChannelVideos(
  supabase: any,
  apiKey: string,
  channel: YouTubeChannel,
  maxResults: number = 10
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  try {
    const videos = await fetchChannelVideos(apiKey, channel.id, maxResults);
    
    for (const video of videos) {
      const newsPost = mapYouTubeVideoToNewsPost(video, channel);
      
      const result = await saveNewsPostIfNew(supabase, newsPost);
      if (result.created) {
        inserted++;
      } else {
        skipped++;
      }
    }
  } catch (error) {
    console.error(`Error importing videos from ${channel.label}:`, error);
  }

  return { inserted, skipped };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'YOUTUBE_API_KEY environment variable is not set',
          message: 'Please configure your YouTube Data API v3 key in the environment variables',
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const maxResults = body.maxResults || 10;

    const results = await Promise.all(
      YT_CHANNELS.map((channel) =>
        importChannelVideos(supabase, youtubeApiKey, channel, maxResults)
      )
    );

    const imported: Record<string, { inserted: number; skipped: number }> = {};
    YT_CHANNELS.forEach((channel, index) => {
      imported[channel.label.toLowerCase()] = results[index];
    });

    const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);

    return new Response(
      JSON.stringify({
        ok: true,
        imported,
        message: `Synced ${totalInserted} new videos from YouTube channels`,
        totalChannels: YT_CHANNELS.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error syncing YouTube news:', error);
    return new Response(
      JSON.stringify({
        ok: false,
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