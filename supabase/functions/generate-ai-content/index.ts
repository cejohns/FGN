import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

interface ContentRequest {
  type: 'news' | 'review' | 'blog' | 'video' | 'gallery';
  topic?: string;
  count?: number;
}

async function generateWithOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://firestar-gaming.com',
      'X-Title': 'FireStar Gaming Network',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${response.statusText}. Details: ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from OpenRouter API');
  }

  return data.choices[0].message.content;
}

function parseJsonResponse(text: string): any {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(text);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!openRouterKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenRouter API key not configured. This feature requires an OpenRouter API key for AI content generation.',
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

    const requestBody: ContentRequest = await req.json();
    const { type, topic, count = 1 } = requestBody;

    const results = {
      created: 0,
      type: type,
      items: [] as any[],
      errors: [] as string[],
    };

    for (let i = 0; i < count; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        let prompt = '';
        let content: any = null;

        switch (type) {
          case 'news':
            prompt = `Create a gaming news article${topic ? ` about ${topic}` : ''} in JSON format:
{
  "title": "catchy news headline",
  "excerpt": "2-3 sentence summary (150-200 chars)",
  "content": "full article content (500-800 words with proper paragraphs)",
  "category": "Game Updates|Industry News|Esports|Hardware|Game Releases",
  "featured_image": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
}
Make it engaging, factual-sounding, and timely. Use proper paragraphs separated by \\n\\n.`;
            break;

          case 'review':
            prompt = `Create a game review${topic ? ` for ${topic}` : ''} in JSON format:
{
  "game_title": "game name",
  "platform": "PC|PlayStation|Xbox|Switch|Multi-Platform",
  "genre": "Action|RPG|Strategy|Shooter|Adventure|etc",
  "developer": "developer name",
  "publisher": "publisher name",
  "release_date": "YYYY-MM-DD",
  "rating": "7.5-9.5",
  "excerpt": "2-3 sentence summary (150-200 chars)",
  "content": "detailed review (600-1000 words covering gameplay, graphics, story, pros/cons)",
  "game_cover": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
}
Be detailed and balanced. Use proper paragraphs.`;
            break;

          case 'blog':
            prompt = `Create a gaming blog post${topic ? ` about ${topic}` : ''} in JSON format:
{
  "title": "engaging blog title",
  "excerpt": "2-3 sentence summary (150-200 chars)",
  "content": "blog post content (400-700 words, personal/editorial style)",
  "category": "Opinion|Guide|List|Discussion|Culture",
  "featured_image": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
}
Make it conversational and engaging. Use proper paragraphs.`;
            break;

          case 'video':
            prompt = `Create a gaming video entry${topic ? ` about ${topic}` : ''} in JSON format:
{
  "title": "video title",
  "description": "detailed description (200-300 chars)",
  "category": "Gameplay|Tutorial|Review|News|Trailer|Stream Highlights",
  "duration": "MM:SS format",
  "thumbnail": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
  "video_url": "https://example.com/video-placeholder"
}
Make it appealing and descriptive.`;
            break;

          case 'gallery':
            prompt = `Create a gaming gallery image entry${topic ? ` about ${topic}` : ''} in JSON format:
{
  "title": "image title",
  "description": "detailed description (100-200 chars)",
  "category": "Screenshots|Concept Art|Fan Art|Cosplay|Hardware",
  "game_title": "related game name if applicable",
  "image_url": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
  "thumbnail_url": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
}
Be descriptive and engaging.`;
            break;
        }

        const aiResponse = await generateWithOpenRouter(prompt, openRouterKey);
        content = parseJsonResponse(aiResponse);

        let insertResult;
        switch (type) {
          case 'news':
            insertResult = await supabase.from('news_articles').insert({
              title: content.title,
              slug: createSlug(content.title),
              excerpt: content.excerpt,
              content: content.content,
              featured_image: content.featured_image,
              category: content.category,
              author: 'FireStar AI Editorial',
              published_at: null,
              view_count: 0,
              is_featured: false,
              status: 'draft',
            });
            break;

          case 'review':
            insertResult = await supabase.from('game_reviews').insert({
              game_title: content.game_title,
              slug: createSlug(content.game_title + '-review'),
              game_cover: content.game_cover,
              platform: content.platform,
              genre: content.genre,
              developer: content.developer,
              publisher: content.publisher,
              release_date: content.release_date,
              rating: content.rating,
              excerpt: content.excerpt,
              content: content.content,
              reviewer: 'FireStar AI Editorial',
              published_at: null,
              view_count: 0,
              is_featured: false,
              status: 'draft',
            });
            break;

          case 'blog':
            insertResult = await supabase.from('blog_posts').insert({
              title: content.title,
              slug: createSlug(content.title),
              excerpt: content.excerpt,
              content: content.content,
              featured_image: content.featured_image,
              category: content.category,
              author: 'FireStar Team',
              published_at: null,
              view_count: 0,
              is_featured: false,
              status: 'draft',
            });
            break;

          case 'video':
            insertResult = await supabase.from('videos').insert({
              title: content.title,
              slug: createSlug(content.title),
              description: content.description,
              video_url: content.video_url,
              thumbnail: content.thumbnail,
              category: content.category,
              duration: content.duration,
              creator: 'FireStar Gaming',
              published_at: null,
              view_count: 0,
              is_featured: false,
              status: 'draft',
            });
            break;

          case 'gallery':
            insertResult = await supabase.from('gallery_images').insert({
              title: content.title,
              slug: createSlug(content.title),
              description: content.description,
              image_url: content.image_url,
              thumbnail_url: content.thumbnail_url,
              category: content.category,
              game_title: content.game_title || null,
              photographer: 'FireStar Gaming',
              published_at: null,
              view_count: 0,
              is_featured: false,
              status: 'draft',
            });
            break;
        }

        if (insertResult?.error) {
          results.errors.push(`Failed to insert ${type}: ${insertResult.error.message}`);
        } else {
          results.created++;
          results.items.push(content);
        }
      } catch (error) {
        results.errors.push(`Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${results.created} ${type}(s) successfully`,
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
    console.error('Error generating AI content:', error);
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