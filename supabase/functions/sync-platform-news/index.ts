import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

const PLAYSTATION_FEED = 'https://blog.playstation.com/feed';
const XBOX_FEED = 'https://news.xbox.com/en-us/feed/';
const NINTENDO_FEED = Deno.env.get('NINTENDO_FEED_URL') || '';

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  'content:encoded'?: string;
  enclosure?: { url?: string };
  'media:content'?: { $?: { url?: string } };
}

interface NewsPost {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  image_url: string | null;
  source: 'playstation' | 'xbox' | 'nintendo';
  source_url: string;
  platform: 'ps' | 'xbox' | 'nintendo';
  type: 'game-update' | 'studio-announcement';
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

function classifyTypeFromTitle(title: string): 'game-update' | 'studio-announcement' {
  const lower = title.toLowerCase();
  if (lower.includes('patch') || lower.includes('update') || lower.includes('hotfix') || lower.includes('version')) {
    return 'game-update';
  }
  return 'studio-announcement';
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function mapRssItemToNewsPost(
  item: RSSItem,
  options: { source: 'playstation' | 'xbox' | 'nintendo'; platform: 'ps' | 'xbox' | 'nintendo' }
): NewsPost | null {
  if (!item.title || !item.link) {
    return null;
  }

  const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
  
  let imageUrl: string | null = null;
  if (item.enclosure?.url) {
    imageUrl = item.enclosure.url;
  } else if (item['media:content']?.$?.url) {
    imageUrl = item['media:content'].$.url;
  }

  const body = item['content:encoded'] || item.content || item.contentSnippet || '';
  
  let excerpt = item.contentSnippet || stripHtmlTags(body);
  if (excerpt.length > 260) {
    excerpt = excerpt.substring(0, 257) + '...';
  }

  return {
    title: item.title,
    slug: toSlug(item.title),
    body,
    excerpt,
    image_url: imageUrl,
    source: options.source,
    source_url: item.link,
    platform: options.platform,
    type: classifyTypeFromTitle(item.title),
    published_at: publishedAt,
    auto_generated: true,
  };
}

async function fetchRssFeed(feedUrl: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xml = await response.text();
    const items: RSSItem[] = [];

    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    for (const match of itemMatches) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/);
      const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([^<]+)<\/pubDate>/);
      const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
      const descriptionMatch = itemXml.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>|<description>([^<]+)<\/description>/);
      const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"/);

      const item: RSSItem = {
        title: titleMatch ? (titleMatch[1] || titleMatch[2]) : undefined,
        link: linkMatch ? linkMatch[1] : undefined,
        pubDate: pubDateMatch ? pubDateMatch[1] : undefined,
        isoDate: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : undefined,
        'content:encoded': contentMatch ? contentMatch[1] : undefined,
        contentSnippet: descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2]) : undefined,
        enclosure: enclosureMatch ? { url: enclosureMatch[1] } : undefined,
      };

      if (item.title && item.link) {
        items.push(item);
      }
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
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

async function importPlatformNews(
  supabase: any,
  feedUrl: string,
  options: { source: 'playstation' | 'xbox' | 'nintendo'; platform: 'ps' | 'xbox' | 'nintendo' }
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  try {
    const items = await fetchRssFeed(feedUrl);
    
    for (const item of items) {
      const newsPost = mapRssItemToNewsPost(item, options);
      if (!newsPost) {
        skipped++;
        continue;
      }

      const result = await saveNewsPostIfNew(supabase, newsPost);
      if (result.created) {
        inserted++;
      } else {
        skipped++;
      }
    }
  } catch (error) {
    console.error(`Error importing ${options.source} news:`, error);
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

  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return createUnauthorizedResponse(authResult.error);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = await Promise.all([
      importPlatformNews(supabase, PLAYSTATION_FEED, { source: 'playstation', platform: 'ps' }),
      importPlatformNews(supabase, XBOX_FEED, { source: 'xbox', platform: 'xbox' }),
      NINTENDO_FEED ? importPlatformNews(supabase, NINTENDO_FEED, { source: 'nintendo', platform: 'nintendo' }) : Promise.resolve({ inserted: 0, skipped: 0 }),
    ]);

    return new Response(
      JSON.stringify({
        ok: true,
        imported: {
          playstation: results[0],
          xbox: results[1],
          nintendo: results[2],
        },
        message: `Synced ${results[0].inserted + results[1].inserted + results[2].inserted} new posts`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error syncing platform news:', error);
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