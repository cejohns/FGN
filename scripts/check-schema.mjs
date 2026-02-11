import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyfzxamsobywypoyocwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Actual Data Structures\n');

  const { data: blogs } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);

  console.log('📝 Blog Post Sample:');
  console.log(JSON.stringify(blogs?.[0], null, 2));

  const { data: news } = await supabase
    .from('news_articles')
    .select('*')
    .limit(1);

  console.log('\n📰 News Article Sample:');
  console.log(JSON.stringify(news?.[0], null, 2));

  const { data: reviews } = await supabase
    .from('game_reviews')
    .select('*')
    .limit(1);

  console.log('\n⭐ Game Review Sample:');
  console.log(JSON.stringify(reviews?.[0], null, 2));
}

checkSchema().catch(console.error);
