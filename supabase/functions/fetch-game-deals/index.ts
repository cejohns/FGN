import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CheapSharkDeal {
  title: string;
  dealID: string;
  storeID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore: string;
  steamRatingPercent: string;
  steamRatingCount: string;
  thumb: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

function getDefaultImage(): string {
  return 'https://images.pexels.com/photos/2923034/pexels-photo-2923034.jpeg';
}

function getStoreName(storeID: string): string {
  const stores: { [key: string]: string } = {
    '1': 'Steam',
    '2': 'GamersGate',
    '3': 'GreenManGaming',
    '7': 'GOG',
    '8': 'Origin',
    '11': 'Humble Store',
    '13': 'Uplay',
    '15': 'Fanatical',
    '25': 'Epic Games Store',
    '27': 'Gamesplanet',
    '28': 'Gamesload',
    '29': 'PlayStation Store',
    '30': 'Microsoft Store',
  };
  return stores[storeID] || 'Online Store';
}

async function fetchTopDeals(): Promise<CheapSharkDeal[]> {
  try {
    console.log('Fetching top deals from CheapShark...');
    const response = await fetch(
      'https://www.cheapshark.com/api/1.0/deals?sortBy=Savings&desc=1&pageSize=15&metacritic=70'
    );

    if (!response.ok) {
      console.error('CheapShark API error:', response.status);
      return [];
    }

    const deals = await response.json();
    console.log(`Fetched ${deals.length} deals from CheapShark`);
    return deals;
  } catch (error) {
    console.error('Error fetching CheapShark deals:', error);
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

    const deals = await fetchTopDeals();

    const results = {
      news_articles: 0,
      errors: [] as string[],
    };

    for (const deal of deals) {
      try {
        const savingsPercent = Math.round(parseFloat(deal.savings));
        if (savingsPercent < 50) continue;

        const storeName = getStoreName(deal.storeID);
        const slug = generateSlug(`${deal.title} deal ${storeName}`);

        const existingArticle = await supabase
          .from('news_articles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!existingArticle.data) {
          const thumbnailUrl = deal.thumb || getDefaultImage();
          const salePrice = parseFloat(deal.salePrice).toFixed(2);
          const normalPrice = parseFloat(deal.normalPrice).toFixed(2);

          const title = `Hot Deal: ${deal.title} ${savingsPercent}% Off at ${storeName}`;
          const excerpt = `Save ${savingsPercent}% on ${deal.title}! Now only $${salePrice} (was $${normalPrice}) at ${storeName}.`;
          
          let content = `${deal.title} is currently on sale at ${storeName} with a massive ${savingsPercent}% discount!\n\n`;
          content += `**Deal Details:**\n`;
          content += `- Sale Price: $${salePrice}\n`;
          content += `- Regular Price: $${normalPrice}\n`;
          content += `- You Save: $${(parseFloat(normalPrice) - parseFloat(salePrice)).toFixed(2)} (${savingsPercent}%)\n`;
          content += `- Store: ${storeName}\n\n`;
          
          if (deal.metacriticScore && parseInt(deal.metacriticScore) > 0) {
            content += `This title has a Metacritic score of ${deal.metacriticScore}/100. `;
          }
          
          if (deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0) {
            content += `Steam users have given it a ${deal.steamRatingPercent}% positive rating based on ${deal.steamRatingCount} reviews.`;
          }
          
          content += `\n\nDon't miss out on this incredible deal! Prices may change at any time.`;

          const { error: articleError } = await supabase
            .from('news_articles')
            .insert({
              title: title,
              slug: slug,
              excerpt: excerpt,
              content: content,
              featured_image: thumbnailUrl,
              category: 'Game Deals',
              author: 'CheapShark',
              published_at: new Date().toISOString(),
              view_count: 0,
              is_featured: results.news_articles < 3,
            });

          if (articleError) {
            results.errors.push(`Error adding deal for ${deal.title}: ${articleError.message}`);
          } else {
            results.news_articles++;
            console.log(`Added deal: ${deal.title} at ${storeName}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error processing deal ${deal.title}: ${error.message}`);
      }
    }

    console.log('CheapShark fetch results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Game deals fetched successfully',
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
    console.error('Error in CheapShark fetch function:', error);
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
