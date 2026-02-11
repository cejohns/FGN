import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyfzxamsobywypoyocwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function showExistingContent() {
  console.log('📚 Existing Content:\n');

  const { data: blogs } = await supabase
    .from('blog_posts')
    .select('title, slug, status, published_at')
    .order('created_at', { ascending: false });

  console.log('Blog Posts:');
  blogs?.forEach(b => console.log(`  - ${b.title} (${b.status}) - ${b.slug}`));

  const { data: news } = await supabase
    .from('news_articles')
    .select('title, slug, status')
    .order('created_at', { ascending: false });

  console.log('\nNews Articles:');
  news?.forEach(n => console.log(`  - ${n.title} (${n.status})`));

  const { data: reviews } = await supabase
    .from('game_reviews')
    .select('title, slug, status, score')
    .order('created_at', { ascending: false });

  console.log('\nGame Reviews:');
  reviews?.forEach(r => console.log(`  - ${r.title} (${r.status}) - Score: ${r.score}`));

  return { blogs, news, reviews };
}

async function addMoreContent() {
  console.log('\n\n➕ Adding more content...\n');

  const moreBlogPosts = [
    {
      title: 'The Evolution of Open World Games',
      slug: 'evolution-of-open-world-games',
      excerpt: 'From early sandboxes to massive living worlds, see how open world games have transformed over the decades.',
      content: `<h2>The Journey of Open World Gaming</h2>
      <p>Open world games have come a long way since their humble beginnings. Let's explore this fascinating evolution.</p>

      <h3>The Early Days</h3>
      <p>Games like Elite and The Legend of Zelda pioneered the concept of exploring vast, interconnected spaces.</p>

      <h3>The Modern Era</h3>
      <p>Today's open worlds are living, breathing ecosystems with dynamic weather, NPC schedules, and countless secrets to discover.</p>

      <h3>What's Next?</h3>
      <p>With advances in AI and procedural generation, the future of open world gaming looks incredibly exciting.</p>`,
      featured_image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
      status: 'published',
      published_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      title: 'Indie Game Spotlight: Hidden Gems of 2026',
      slug: 'indie-game-spotlight-2026',
      excerpt: 'Discover amazing indie games that deserve your attention this year.',
      content: `<h2>Celebrating Independent Game Development</h2>
      <p>The indie scene continues to produce some of the most innovative and memorable gaming experiences.</p>

      <h3>Why Indie Games Matter</h3>
      <p>Independent developers often take creative risks that larger studios can't, resulting in unique gameplay experiences.</p>

      <h3>Our Top Picks</h3>
      <p>From puzzle platformers to narrative adventures, these indie titles showcase the best of independent game development.</p>`,
      featured_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      status: 'published',
      published_at: new Date(Date.now() - 345600000).toISOString(),
    }
  ];

  const moreNews = [
    {
      title: 'Next-Gen Console Sales Continue Strong Momentum',
      slug: 'next-gen-console-sales-strong',
      excerpt: 'Latest quarterly reports show sustained demand for current generation gaming hardware.',
      content: '<p>The gaming hardware market continues to thrive with strong sales across all platforms.</p>',
      cover_image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
      status: 'published',
      is_featured: false,
      published_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      title: 'Popular Franchise Gets Surprise Sequel Announcement',
      slug: 'surprise-sequel-announcement',
      excerpt: 'Beloved series returns with a new chapter after years of fan anticipation.',
      content: '<p>Fans celebrate as the long-awaited sequel is officially confirmed.</p>',
      cover_image: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg',
      status: 'published',
      is_featured: true,
      published_at: new Date(Date.now() - 14400000).toISOString(),
    }
  ];

  const moreReviews = [
    {
      title: 'Puzzle Adventure Masterpiece Review',
      slug: 'puzzle-adventure-masterpiece-review',
      excerpt: 'A mind-bending journey that challenges your perception and rewards curiosity.',
      content: '<p>This game delivers an unforgettable puzzle-solving experience with beautiful art direction.</p>',
      score: 8.8,
      cover_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      status: 'published',
      is_featured: false,
      published_at: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  for (const post of moreBlogPosts) {
    const { error } = await supabase.from('blog_posts').insert([post]);
    if (error) {
      console.log(`❌ Blog: ${error.message}`);
    } else {
      console.log(`✅ Added blog: "${post.title}"`);
    }
  }

  for (const article of moreNews) {
    const { error } = await supabase.from('news_articles').insert([article]);
    if (error) {
      console.log(`❌ News: ${error.message}`);
    } else {
      console.log(`✅ Added news: "${article.title}"`);
    }
  }

  for (const review of moreReviews) {
    const { error } = await supabase.from('game_reviews').insert([review]);
    if (error) {
      console.log(`❌ Review: ${error.message}`);
    } else {
      console.log(`✅ Added review: "${review.title}"`);
    }
  }
}

async function main() {
  await showExistingContent();
  await addMoreContent();
  console.log('\n✨ Content restoration complete!\n');
}

main().catch(console.error);
