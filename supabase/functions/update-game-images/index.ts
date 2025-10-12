import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface IGDBImage {
  id: number;
  url: string;
  image_id: string;
}

interface IGDBGame {
  id: number;
  name: string;
  cover?: IGDBImage;
  screenshots?: IGDBImage[];
  artworks?: IGDBImage[];
}

async function getIGDBAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );

    if (!response.ok) {
      console.error('Failed to get IGDB access token:', response.status);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting IGDB access token:', error);
    return null;
  }
}

async function searchGameOnIGDB(
  gameName: string,
  accessToken: string,
  clientId: string
): Promise<IGDBGame | null> {
  try {
    const query = `
      search "${gameName}";
      fields name, cover.url, cover.image_id, screenshots.url, screenshots.image_id, artworks.url, artworks.image_id;
      limit 1;
    `;

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    });

    if (!response.ok) {
      console.error('IGDB API error:', response.status, await response.text());
      return null;
    }

    const games = await response.json();
    return games.length > 0 ? games[0] : null;
  } catch (error) {
    console.error('Error searching game on IGDB:', error);
    return null;
  }
}

function getImageUrl(image: IGDBImage | undefined, size: string = 't_screenshot_big'): string | null {
  if (!image?.url) return null;
  return `https:${image.url.replace('t_thumb', size)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const igdbClientId = Deno.env.get('IGDB_CLIENT_ID');
    const igdbClientSecret = Deno.env.get('IGDB_CLIENT_SECRET');

    if (!igdbClientId || !igdbClientSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'IGDB API credentials not configured. Please add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.',
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Getting IGDB access token...');
    const accessToken = await getIGDBAccessToken(igdbClientId, igdbClientSecret);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to authenticate with IGDB API',
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

    const results = {
      reviews_updated: 0,
      news_updated: 0,
      gallery_updated: 0,
      videos_updated: 0,
      blogs_updated: 0,
      errors: [] as string[],
    };

    const { data: reviews } = await supabase
      .from('game_reviews')
      .select('id, game_title');

    if (reviews) {
      for (const review of reviews) {
        try {
          const gameData = await searchGameOnIGDB(review.game_title, accessToken, igdbClientId);
          if (gameData?.cover) {
            const coverUrl = getImageUrl(gameData.cover, 't_cover_big');
            if (coverUrl) {
              await supabase
                .from('game_reviews')
                .update({ game_cover: coverUrl })
                .eq('id', review.id);
              results.reviews_updated++;
            }
          }
        } catch (error) {
          results.errors.push(`Error updating review ${review.game_title}: ${error.message}`);
        }
      }
    }

    const { data: news } = await supabase
      .from('news_articles')
      .select('id, title');

    if (news) {
      for (const article of news) {
        try {
          const gameTitle = article.title
            .replace(/Hot Deal:/i, '')
            .replace(/\d+%\sOff.*/i, '')
            .replace(/Price Drop.*/i, '')
            .replace(/DLC.*/i, '')
            .trim();
          
          const gameData = await searchGameOnIGDB(gameTitle, accessToken, igdbClientId);
          if (gameData?.cover) {
            const coverUrl = getImageUrl(gameData.cover, 't_screenshot_big');
            if (coverUrl) {
              await supabase
                .from('news_articles')
                .update({ featured_image: coverUrl })
                .eq('id', article.id);
              results.news_updated++;
            }
          }
        } catch (error) {
          results.errors.push(`Error updating news ${article.title}: ${error.message}`);
        }
      }
    }

    const { data: gallery } = await supabase
      .from('gallery_images')
      .select('id, title');

    if (gallery) {
      for (const image of gallery) {
        try {
          const gameTitle = image.title.replace(/\s(Landscape|Battle|Sky|Castle|Match|Space Station|Night City|Remake).*/i, '').trim();
          
          const gameData = await searchGameOnIGDB(gameTitle, accessToken, igdbClientId);
          if (gameData?.screenshots && gameData.screenshots.length > 0) {
            const screenshotUrl = getImageUrl(gameData.screenshots[0], 't_screenshot_big');
            const thumbnailUrl = getImageUrl(gameData.screenshots[0], 't_screenshot_med');
            
            if (screenshotUrl && thumbnailUrl) {
              await supabase
                .from('gallery_images')
                .update({ 
                  image_url: screenshotUrl,
                  thumbnail_url: thumbnailUrl
                })
                .eq('id', image.id);
              results.gallery_updated++;
            }
          } else if (gameData?.cover) {
            const coverUrl = getImageUrl(gameData.cover, 't_screenshot_big');
            const thumbnailUrl = getImageUrl(gameData.cover, 't_screenshot_med');
            if (coverUrl && thumbnailUrl) {
              await supabase
                .from('gallery_images')
                .update({ 
                  image_url: coverUrl,
                  thumbnail_url: thumbnailUrl
                })
                .eq('id', image.id);
              results.gallery_updated++;
            }
          }
        } catch (error) {
          results.errors.push(`Error updating gallery ${image.title}: ${error.message}`);
        }
      }
    }

    const { data: videos } = await supabase
      .from('videos')
      .select('id, title');

    if (videos) {
      for (const video of videos) {
        try {
          const gameTitle = video.title
            .replace(/Gaming News.*/i, '')
            .replace(/Character Build Guide/i, '')
            .replace(/Boss Tips.*/i, '')
            .replace(/Review Discussion/i, '')
            .replace(/Speculation/i, '')
            .replace(/Campaign Walkthrough.*/i, '')
            .trim();
          
          if (gameTitle) {
            const gameData = await searchGameOnIGDB(gameTitle, accessToken, igdbClientId);
            if (gameData?.screenshots && gameData.screenshots.length > 0) {
              const thumbnailUrl = getImageUrl(gameData.screenshots[0], 't_screenshot_med');
              if (thumbnailUrl) {
                await supabase
                  .from('videos')
                  .update({ thumbnail: thumbnailUrl })
                  .eq('id', video.id);
                results.videos_updated++;
              }
            } else if (gameData?.cover) {
              const coverUrl = getImageUrl(gameData.cover, 't_screenshot_med');
              if (coverUrl) {
                await supabase
                  .from('videos')
                  .update({ thumbnail: coverUrl })
                  .eq('id', video.id);
                results.videos_updated++;
              }
            }
          }
        } catch (error) {
          results.errors.push(`Error updating video ${video.title}: ${error.message}`);
        }
      }
    }

    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('id, title');

    if (blogs) {
      for (const blog of blogs) {
        const imageUrl = 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800';
        await supabase
          .from('blog_posts')
          .update({ featured_image: imageUrl })
          .eq('id', blog.id);
        results.blogs_updated++;
      }
    }

    console.log('Image update results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Game images updated successfully',
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
    console.error('Error in update-game-images function:', error);
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
