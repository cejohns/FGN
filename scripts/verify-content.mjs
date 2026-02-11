import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyfzxamsobywypoyocwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyContent() {
  console.log('🔍 Verifying Content Structure\n');

  const { data: blogs, error: blogError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, status, published_at')
    .eq('status', 'published');

  console.log(`\n📝 Blog Posts (${blogs?.length || 0} published):`);
  blogs?.forEach((blog, i) => {
    console.log(`\n${i + 1}. ${blog.title}`);
    console.log(`   Slug: ${blog.slug}`);
    console.log(`   Excerpt: ${blog.excerpt ? 'Yes ✓' : 'Missing ✗'}`);
    console.log(`   Image: ${blog.featured_image ? 'Yes ✓' : 'Missing ✗'}`);
    console.log(`   Status: ${blog.status}`);
  });

  if (blogError) {
    console.error('Blog Error:', blogError);
  }

  const { data: news, error: newsError } = await supabase
    .from('news_articles')
    .select('id, title, slug, excerpt, featured_image, status, is_featured, published_at')
    .eq('status', 'published');

  console.log(`\n\n📰 News Articles (${news?.length || 0} published):`);
  news?.forEach((article, i) => {
    console.log(`\n${i + 1}. ${article.title}`);
    console.log(`   Featured: ${article.is_featured ? 'Yes ✓' : 'No'}`);
    console.log(`   Image: ${article.featured_image ? 'Yes ✓' : 'Missing ✗'}`);
  });

  if (newsError) {
    console.error('News Error:', newsError);
  }

  const { data: reviews, error: reviewError } = await supabase
    .from('game_reviews')
    .select('id, title, slug, excerpt, game_cover, score, status, is_featured, published_at')
    .eq('status', 'published');

  console.log(`\n\n⭐ Game Reviews (${reviews?.length || 0} published):`);
  reviews?.forEach((review, i) => {
    console.log(`\n${i + 1}. ${review.title}`);
    console.log(`   Score: ${review.score || 'N/A'}`);
    console.log(`   Featured: ${review.is_featured ? 'Yes ✓' : 'No'}`);
    console.log(`   Image: ${review.game_cover ? 'Yes ✓' : 'Missing ✗'}`);
  });

  if (reviewError) {
    console.error('Review Error:', reviewError);
  }

  console.log('\n\n✅ Verification complete!\n');
}

verifyContent().catch(console.error);
