import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyAdminAuth, createUnauthorizedResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

const demoGames = [
  {
    title: 'Cyberpunk 2077: Phantom Liberty',
    slug: 'cyberpunk-2077-phantom-liberty',
    description: 'Phantom Liberty is a thrilling spy-thriller expansion for the open-world action-adventure RPG Cyberpunk 2077. Return as cyber-enhanced mercenary V and embark on a high-stakes mission of espionage and intrigue to save the NUS President.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6r3j.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc9mav.jpg',
    genre: 'Action, RPG, Adventure',
    platform: 'PC, PlayStation 5, Xbox Series X|S',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    release_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    price: '$59.99',
    preorder_link: 'https://www.cyberpunk.net',
    rating_expected: 'M',
    features: ['Open World', 'Story Rich', 'Choices Matter', 'Cyberpunk', 'First-Person'],
    is_featured: true,
  },
  {
    title: 'Hollow Knight: Silksong',
    slug: 'hollow-knight-silksong',
    description: 'Discover a haunting new kingdom, encounter strange new creatures and master deadly new combat styles in the sequel to the award-winning action-adventure, Hollow Knight.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc7qk3.jpg',
    genre: 'Action, Adventure, Platformer',
    platform: 'PC, Nintendo Switch, PlayStation 5, Xbox Series X|S',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    release_date: new Date(Date.now() + 22 * 86400000).toISOString().split('T')[0],
    price: '$29.99',
    preorder_link: 'https://www.hollowknightsilksong.com',
    rating_expected: 'E10+',
    features: ['Metroidvania', '2D', 'Atmospheric', 'Challenging', 'Hand-drawn'],
    is_featured: true,
  },
  {
    title: 'Grand Theft Auto VI',
    slug: 'grand-theft-auto-vi',
    description: 'The next chapter in the legendary Grand Theft Auto franchise. Explore a vast and diverse open world with unprecedented detail and immersion.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co87wx.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scq1km.jpg',
    genre: 'Action, Adventure, Open World',
    platform: 'PlayStation 5, Xbox Series X|S',
    developer: 'Rockstar North',
    publisher: 'Rockstar Games',
    release_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    price: '$69.99',
    preorder_link: 'https://www.rockstargames.com',
    rating_expected: 'M',
    features: ['Open World', 'Multiplayer', 'Crime', 'Third Person', 'Story Rich'],
    is_featured: true,
  },
  {
    title: 'The Legend of Zelda: Tears of the Kingdom DLC',
    slug: 'zelda-tears-kingdom-dlc',
    description: 'Expand your adventure in Hyrule with new quests, challenges, and mysteries to uncover in this massive expansion.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scsr5t.jpg',
    genre: 'Action, Adventure, RPG',
    platform: 'Nintendo Switch',
    developer: 'Nintendo',
    publisher: 'Nintendo',
    release_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    price: '$19.99',
    preorder_link: 'https://www.nintendo.com',
    rating_expected: 'E10+',
    features: ['Open World', 'Puzzle', 'Exploration', 'Fantasy', 'Single Player'],
    is_featured: false,
  },
  {
    title: 'Final Fantasy VII Rebirth',
    slug: 'final-fantasy-vii-rebirth',
    description: 'The second installment in the Final Fantasy VII Remake trilogy continues the epic story with expanded gameplay and breathtaking visuals.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7jla.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scwewd.jpg',
    genre: 'RPG, Action',
    platform: 'PlayStation 5',
    developer: 'Square Enix',
    publisher: 'Square Enix',
    release_date: new Date(Date.now() + 38 * 86400000).toISOString().split('T')[0],
    price: '$69.99',
    preorder_link: 'https://www.square-enix.com',
    rating_expected: 'T',
    features: ['JRPG', 'Story Rich', 'Combat', 'Character Action', 'Fantasy'],
    is_featured: true,
  },
  {
    title: 'Starfield: Shattered Space',
    slug: 'starfield-shattered-space',
    description: 'Journey to a mysterious new region of space in this story expansion for Starfield. Uncover dark secrets and face new threats in the first major expansion.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w6k.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scrknp.jpg',
    genre: 'RPG, Adventure, Sci-Fi',
    platform: 'PC, Xbox Series X|S',
    developer: 'Bethesda Game Studios',
    publisher: 'Bethesda Softworks',
    release_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    price: '$29.99',
    preorder_link: 'https://bethesda.net',
    rating_expected: 'M',
    features: ['Space', 'Open World', 'Exploration', 'Sci-Fi', 'RPG'],
    is_featured: false,
  },
  {
    title: 'Persona 6',
    slug: 'persona-6',
    description: 'The next entry in the beloved Persona series brings a new story, new characters, and refined social simulation and dungeon-crawling gameplay.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc6z9u.jpg',
    genre: 'RPG, Social Sim',
    platform: 'PlayStation 5, PC',
    developer: 'Atlus',
    publisher: 'Sega',
    release_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    price: '$69.99',
    preorder_link: 'https://www.atlus.com',
    rating_expected: 'M',
    features: ['JRPG', 'Turn-Based', 'Anime', 'Story Rich', 'Social Sim'],
    is_featured: true,
  },
  {
    title: 'Hades II',
    slug: 'hades-ii',
    description: 'Battle beyond the Underworld using dark sorcery as you take on the Titan of Time in this sequel to the award-winning rogue-like dungeon crawler.',
    cover_image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7bmb.jpg',
    banner_image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scvxp1.jpg',
    genre: 'Action, Roguelike, Indie',
    platform: 'PC, Nintendo Switch',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    release_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    price: '$29.99',
    preorder_link: 'https://www.supergiantgames.com',
    rating_expected: 'T',
    features: ['Roguelike', 'Fast-Paced', 'Greek Mythology', 'Replayable', 'Indie'],
    is_featured: false,
  },
];

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

    let inserted = 0;
    let updated = 0;

    for (const game of demoGames) {
      const { data: existing } = await supabase
        .from('game_releases')
        .select('id')
        .eq('slug', game.slug)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('game_releases')
          .update(game)
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('game_releases')
          .insert(game);
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: 'demo',
        fetched: demoGames.length,
        inserted,
        updated,
        message: `Loaded ${inserted} demo games. These are placeholder games to demonstrate the UI. Configure TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, and RAWG_API_KEY to sync real data.`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error seeding demo releases:', error);
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