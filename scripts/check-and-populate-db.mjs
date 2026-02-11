import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyfzxamsobywypoyocwz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database content...\n');

  const tables = [
    'blog_posts',
    'news_articles',
    'game_reviews',
    'game_releases',
    'gallery_images',
    'guides'
  ];

  const results = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false });

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
        results[table] = { error: error.message };
      } else {
        console.log(`✅ ${table}: ${count || 0} rows`);
        results[table] = { count: count || 0, sample: data?.[0] };
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      results[table] = { error: err.message };
    }
  }

  return results;
}

async function populateBlogPosts() {
  console.log('\n📝 Adding sample blog posts...\n');

  const samplePosts = [
    {
      title: 'Welcome to FireStar Gaming Network',
      slug: 'welcome-to-firestar-gaming',
      excerpt: 'Discover the latest gaming news, reviews, and insights from the FireStar Gaming Network community.',
      content: `<h2>Welcome to Our Gaming Community</h2>
      <p>FireStar Gaming Network is your one-stop destination for everything gaming. We bring you the latest news, in-depth reviews, and exclusive insights from the world of video games.</p>

      <h3>What We Offer</h3>
      <ul>
        <li>Breaking gaming news from all major platforms</li>
        <li>Honest, comprehensive game reviews</li>
        <li>Gaming guides and tutorials</li>
        <li>Release calendar for upcoming titles</li>
        <li>Video content and gameplay footage</li>
      </ul>

      <p>Join us on this exciting journey through the gaming universe!</p>`,
      featured_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date().toISOString(),
    },
    {
      title: 'Top 10 Most Anticipated Games of 2026',
      slug: 'top-10-anticipated-games-2026',
      excerpt: 'From epic RPGs to innovative indies, here are the games that have us counting down the days.',
      content: `<h2>The Most Exciting Games Coming in 2026</h2>
      <p>2026 is shaping up to be an incredible year for gaming. Here's our list of the most anticipated titles:</p>

      <h3>1. The Next Big RPG</h3>
      <p>Open world adventure meets cutting-edge storytelling.</p>

      <h3>2. Innovative Multiplayer Experience</h3>
      <p>Revolutionary gameplay mechanics that will change the genre.</p>

      <p>Stay tuned for more updates as release dates approach!</p>`,
      featured_image: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      title: 'Gaming Hardware Guide 2026',
      slug: 'gaming-hardware-guide-2026',
      excerpt: 'Everything you need to know about building or upgrading your gaming setup this year.',
      content: `<h2>Build Your Dream Gaming Setup</h2>
      <p>Whether you're building a new PC or upgrading your console setup, here's what you need to know.</p>

      <h3>PC Gaming</h3>
      <p>The latest GPUs and CPUs offer incredible performance at various price points.</p>

      <h3>Console Gaming</h3>
      <p>Next-gen consoles continue to deliver amazing experiences.</p>

      <h3>Peripherals</h3>
      <p>Don't overlook the importance of a quality monitor, keyboard, and mouse.</p>`,
      featured_image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
      status: 'published',
      published_at: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  for (const post of samplePosts) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select();

    if (error) {
      console.log(`❌ Failed to add "${post.title}": ${error.message}`);
    } else {
      console.log(`✅ Added blog post: "${post.title}"`);
    }
  }
}

async function populateNewsArticles() {
  console.log('\n📰 Adding sample news articles...\n');

  const sampleNews = [
    {
      title: 'Major Game Studio Announces New IP',
      slug: 'major-studio-new-ip-announcement',
      excerpt: 'Industry-leading developer reveals exciting new franchise coming 2027.',
      content: 'Full article content here...',
      cover_image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date().toISOString(),
    },
    {
      title: 'E-Sports Tournament Breaks Viewership Records',
      slug: 'esports-viewership-records',
      excerpt: 'Latest championship event attracts millions of concurrent viewers worldwide.',
      content: 'Full article content here...',
      cover_image: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date(Date.now() - 3600000).toISOString(),
    }
  ];

  for (const article of sampleNews) {
    const { data, error } = await supabase
      .from('news_articles')
      .insert([article])
      .select();

    if (error) {
      console.log(`❌ Failed to add "${article.title}": ${error.message}`);
    } else {
      console.log(`✅ Added news article: "${article.title}"`);
    }
  }
}

async function populateGameReviews() {
  console.log('\n⭐ Adding sample game reviews...\n');

  const sampleReviews = [
    {
      title: 'Epic Adventure Game Review',
      slug: 'epic-adventure-game-review',
      excerpt: 'A stunning journey through fantastical realms with exceptional storytelling.',
      content: 'Full review content here...',
      score: 9.2,
      cover_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date().toISOString(),
    },
    {
      title: 'Multiplayer Shooter Review',
      slug: 'multiplayer-shooter-review',
      excerpt: 'Fast-paced action with innovative mechanics that keep you coming back.',
      content: 'Full review content here...',
      score: 8.5,
      cover_image: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  for (const review of sampleReviews) {
    const { data, error } = await supabase
      .from('game_reviews')
      .insert([review])
      .select();

    if (error) {
      console.log(`❌ Failed to add "${review.title}": ${error.message}`);
    } else {
      console.log(`✅ Added game review: "${review.title}"`);
    }
  }
}

async function main() {
  console.log('🚀 FireStar Gaming Network - Database Check & Population Tool\n');
  console.log('================================================\n');

  const dbStatus = await checkDatabase();

  console.log('\n================================================\n');
  console.log('Would you like to populate empty tables? (yes/no)');
  console.log('Note: This will add sample content to your database.\n');

  const shouldPopulate = true;

  if (shouldPopulate) {
    if (!dbStatus.blog_posts || dbStatus.blog_posts.count === 0) {
      await populateBlogPosts();
    } else {
      console.log('\n📝 Blog posts already exist, skipping...');
    }

    if (!dbStatus.news_articles || dbStatus.news_articles.count === 0) {
      await populateNewsArticles();
    } else {
      console.log('\n📰 News articles already exist, skipping...');
    }

    if (!dbStatus.game_reviews || dbStatus.game_reviews.count === 0) {
      await populateGameReviews();
    } else {
      console.log('\n⭐ Game reviews already exist, skipping...');
    }

    console.log('\n✨ Database population complete!\n');
    console.log('Check your site to see the new content.');
  }
}

main().catch(console.error);
