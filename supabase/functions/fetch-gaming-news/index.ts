import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  category?: string;
  content?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function truncateText(text: string, maxLength: number): string {
  const cleaned = stripHtml(text);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3) + '...';
}

function extractImageFromDescription(description: string): string | null {
  const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

function getDefaultImage(source: string): string {
  const images: { [key: string]: string } = {
    'IGN': 'https://images.pexels.com/photos/7915286/pexels-photo-7915286.jpeg',
    'GameSpot': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    'Polygon': 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg',
    'PC Gamer': 'https://images.pexels.com/photos/2923034/pexels-photo-2923034.jpeg',
    'Kotaku': 'https://images.pexels.com/photos/4009599/pexels-photo-4009599.jpeg',
    'Eurogamer': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    'Destructoid': 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg',
    'Giant Bomb': 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    'Rock Paper Shotgun': 'https://images.pexels.com/photos/2923034/pexels-photo-2923034.jpeg',
    'GamesRadar': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    'VideoGamer': 'https://images.pexels.com/photos/7915286/pexels-photo-7915286.jpeg',
    'VG247': 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg',
    'GamesIndustry.biz': 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg',
    'TheGamer': 'https://images.pexels.com/photos/4009599/pexels-photo-4009599.jpeg',
    'Dexerto': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    'Dot Esports': 'https://images.pexels.com/photos/7915286/pexels-photo-7915286.jpeg',
    'PCGamesN': 'https://images.pexels.com/photos/2923034/pexels-photo-2923034.jpeg',
    'Game Informer': 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg',
    'Shacknews': 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    'TechRadar Gaming': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
  };
  return images[source] || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg';
}

async function parseRSSFeed(url: string, source: string): Promise<RSSItem[]> {
  try {
    console.log(`Fetching RSS feed from ${source}: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FireStarGamingNetwork/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const text = await response.text();
    console.log(`Successfully fetched ${text.length} bytes from ${source}`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');

    if (!doc) {
      throw new Error('Failed to parse XML');
    }

    const items: RSSItem[] = [];
    const itemElements = doc.querySelectorAll('item, entry');
    console.log(`Found ${itemElements.length} items in ${source} feed`);

    for (const item of Array.from(itemElements).slice(0, 10)) {
      const titleEl = item.querySelector('title');
      const linkEl = item.querySelector('link');
      const descEl = item.querySelector('description, summary, content');
      const pubDateEl = item.querySelector('pubDate, published, updated');
      const categoryEl = item.querySelector('category');

      if (titleEl && linkEl) {
        const title = titleEl.textContent?.trim() || '';
        let link = linkEl.textContent?.trim() || '';
        
        if (!link && linkEl.getAttribute('href')) {
          link = linkEl.getAttribute('href') || '';
        }

        const description = descEl?.textContent?.trim() || '';
        const pubDate = pubDateEl?.textContent?.trim() || new Date().toISOString();
        const category = categoryEl?.textContent?.trim() || source;

        const image = extractImageFromDescription(description) || getDefaultImage(source);

        items.push({
          title,
          link,
          description,
          pubDate,
          image,
          category,
          content: description,
        });
      }
    }

    console.log(`Parsed ${items.length} items from ${source}`);
    return items;
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    if (error.name === 'AbortError') {
      console.error(`Request timed out for ${source}`);
    }
    return [];
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      news_articles: 0,
      game_reviews: 0,
      videos: 0,
      gallery_images: 0,
      errors: [] as string[],
    };

    const rssFeeds = [
      { url: 'https://feeds.ign.com/ign/all', source: 'IGN', category: 'IGN News' },
      { url: 'https://www.gamespot.com/feeds/news/', source: 'GameSpot', category: 'GameSpot News' },
      { url: 'https://www.polygon.com/rss/index.xml', source: 'Polygon', category: 'Polygon' },
      { url: 'https://www.pcgamer.com/rss/', source: 'PC Gamer', category: 'PC Gaming' },
      { url: 'https://kotaku.com/rss', source: 'Kotaku', category: 'Kotaku' },
      { url: 'https://www.eurogamer.net/?format=rss', source: 'Eurogamer', category: 'Eurogamer' },
      { url: 'https://www.destructoid.com/feed/', source: 'Destructoid', category: 'Destructoid' },
      { url: 'https://www.giantbomb.com/feeds/news/', source: 'Giant Bomb', category: 'Giant Bomb' },
      { url: 'https://www.rockpapershotgun.com/feed', source: 'Rock Paper Shotgun', category: 'PC Gaming' },
      { url: 'https://www.gamesradar.com/feeds/all/', source: 'GamesRadar', category: 'Gaming News' },
      { url: 'https://www.videogamer.com/feed/', source: 'VideoGamer', category: 'Gaming News' },
      { url: 'https://www.vg247.com/feed', source: 'VG247', category: 'Gaming News' },
      { url: 'https://www.gamesindustry.biz/feed', source: 'GamesIndustry.biz', category: 'Industry News' },
      { url: 'https://www.thegamer.com/feed/', source: 'TheGamer', category: 'Gaming News' },
      { url: 'https://www.dexerto.com/feed/', source: 'Dexerto', category: 'Esports' },
      { url: 'https://dotesports.com/feed', source: 'Dot Esports', category: 'Esports' },
      { url: 'https://www.pcgamesn.com/feed', source: 'PCGamesN', category: 'PC Gaming' },
      { url: 'https://www.gameinformer.com/feeds/thefeed.aspx', source: 'Game Informer', category: 'Gaming News' },
      { url: 'https://www.shacknews.com/feed/rss', source: 'Shacknews', category: 'Gaming News' },
      { url: 'https://www.techradar.com/rss/gaming/news', source: 'TechRadar Gaming', category: 'Gaming News' },
    ];

    console.log(`Starting to process ${rssFeeds.length} RSS feeds`);

    for (const feed of rssFeeds) {
      try {
        console.log(`Processing feed: ${feed.source}`);
        const items = await parseRSSFeed(feed.url, feed.source);
        console.log(`Got ${items.length} items from ${feed.source}`);

        for (const item of items) {
          try {
            const slug = generateSlug(item.title);
            const existingArticle = await supabase
              .from('news_articles')
              .select('id')
              .eq('slug', slug)
              .maybeSingle();

            if (!existingArticle.data) {
              const excerpt = truncateText(item.description, 200);
              const content = truncateText(item.description, 1500);

              const { error: articleError } = await supabase
                .from('news_articles')
                .insert({
                  title: item.title,
                  slug: slug,
                  excerpt: excerpt || `Latest gaming news from ${feed.source}`,
                  content: content || item.description || `Read more about ${item.title} at ${feed.source}. This story is developing and more information will be added as it becomes available.`,
                  featured_image: item.image || getDefaultImage(feed.source),
                  category: feed.category,
                  author: feed.source,
                  published_at: new Date(item.pubDate).toISOString(),
                  view_count: 0,
                  is_featured: results.news_articles < 3,
                });

              if (articleError) {
                results.errors.push(`Article error for ${item.title}: ${articleError.message}`);
              } else {
                results.news_articles++;
                console.log(`Added article: ${item.title}`);
              }
            }
          } catch (error) {
            results.errors.push(`Error processing article ${item.title}: ${error.message}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error fetching ${feed.source}: ${error.message}`);
      }
    }

    const rawgApiKey = Deno.env.get('RAWG_API_KEY');
    if (rawgApiKey) {
      try {
        const baseUrl = 'https://api.rawg.io/api';
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dateStr = sevenDaysAgo.toISOString().split('T')[0];

        const recentGamesUrl = `${baseUrl}/games?key=${rawgApiKey}&dates=${dateStr},${now.toISOString().split('T')[0]}&ordering=-added&page_size=5`;
        const recentGamesResponse = await fetch(recentGamesUrl);

        if (recentGamesResponse.ok) {
          const recentGamesData = await recentGamesResponse.json();

          for (const game of recentGamesData.results || []) {
            try {
              const slug = generateSlug(game.name);
              const existingReview = await supabase
                .from('game_reviews')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

              if (!existingReview.data && game.rating >= 3.5) {
                const { error: reviewError } = await supabase
                  .from('game_reviews')
                  .insert({
                    game_title: game.name,
                    slug: slug,
                    game_cover: game.background_image || getDefaultImage('RAWG'),
                    platform: game.platforms?.map((p: any) => p.platform.name).join(', ') || 'Multi-platform',
                    genre: game.genres?.[0]?.name || 'Adventure',
                    developer: 'Various',
                    publisher: 'Various',
                    release_date: game.released || new Date().toISOString().split('T')[0],
                    rating: Math.min(game.rating * 2, 10),
                    excerpt: `A ${game.genres?.[0]?.name || 'gaming'} experience with ${game.ratings_count} player ratings.`,
                    content: `${game.name} is an engaging ${game.genres?.[0]?.name || 'game'} that has captured the attention of the gaming community. With a solid rating of ${game.rating}/5 based on ${game.ratings_count} player reviews, it demonstrates quality gameplay and design.\n\nAvailable on ${game.platforms?.map((p: any) => p.platform.name).join(', ') || 'multiple platforms'}, this title offers an experience that appeals to a wide range of players.`,
                    reviewer: 'FireStar Reviews',
                    published_at: new Date().toISOString(),
                    view_count: 0,
                    is_featured: results.game_reviews < 3,
                  });

                if (!reviewError) {
                  results.game_reviews++;
                }
              }

              if (game.short_screenshots && game.short_screenshots.length > 1) {
                for (let i = 1; i < Math.min(3, game.short_screenshots.length); i++) {
                  const screenshot = game.short_screenshots[i];
                  const existingImage = await supabase
                    .from('gallery_images')
                    .select('id')
                    .eq('image_url', screenshot.image)
                    .maybeSingle();

                  if (!existingImage.data) {
                    const { error: imageError } = await supabase
                      .from('gallery_images')
                      .insert({
                        title: `${game.name} - Screenshot ${i}`,
                        description: `In-game screenshot from ${game.name}`,
                        image_url: screenshot.image,
                        thumbnail_url: screenshot.image,
                        category: 'Screenshots',
                        game_title: game.name,
                        photographer: 'Game Developer',
                        published_at: new Date().toISOString(),
                        view_count: 0,
                        is_featured: results.gallery_images < 6,
                      });

                    if (!imageError) {
                      results.gallery_images++;
                    }
                  }
                }
              }
            } catch (error) {
              results.errors.push(`Error processing game ${game.name}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        results.errors.push(`RAWG API error: ${error.message}`);
      }
    }

    console.log('Final results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gaming content updated successfully from RSS feeds',
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
    console.error('Error fetching gaming news:', error);
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
