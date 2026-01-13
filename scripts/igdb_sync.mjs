import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in scripts/.env')
}
if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
  throw new Error('Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET in scripts/.env')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function getTwitchToken() {
  const params = new URLSearchParams({
    client_id: IGDB_CLIENT_ID,
    client_secret: IGDB_CLIENT_SECRET,
    grant_type: 'client_credentials',
  })

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: params,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twitch token error: ${res.status} ${text}`)
  }

  const json = await res.json()
  return json.access_token
}

async function igdbQuery(token, endpoint, body) {
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`IGDB ${endpoint} error: ${res.status} ${text}`)
  }

  return res.json()
}

function igdbCoverUrl(cover) {
  // IGDB returns "image_id". We can build a CDN URL.
  // t_cover_big is a good default.
  if (!cover?.image_id) return null
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`
}

async function main() {
  const token = await getTwitchToken()

  // Pull popular recent games (adjust however you want)
  const games = await igdbQuery(
    token,
    'games',
    `
fields id, name, slug, summary, storyline, first_release_date, rating, rating_count,
       cover.image_id,
       genres.name,
       platforms.name,
       involved_companies.company.name;
where rating_count > 50 & first_release_date != null;
sort rating desc;
limit 25;
`.trim()
  )

  const rows = games.map(g => ({
    igdb_id: g.id,
    name: g.name,
    slug: g.slug ?? null,
    summary: g.summary ?? null,
    storyline: g.storyline ?? null,
    cover_url: igdbCoverUrl(g.cover),
    first_release_date: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
    rating: g.rating ?? null,
    rating_count: g.rating_count ?? null,
    genres: Array.isArray(g.genres) ? g.genres.map(x => x.name).filter(Boolean) : [],
    platforms: Array.isArray(g.platforms) ? g.platforms.map(x => x.name).filter(Boolean) : [],
    studios: Array.isArray(g.involved_companies)
      ? g.involved_companies.map(x => x.company?.name).filter(Boolean)
      : [],
    status: 'draft', // keep draft until you approve in admin
  }))

  const { error } = await supabase
    .from('games')
    .upsert(rows, { onConflict: 'igdb_id' })

  if (error) throw error

  console.log(`✅ Upserted ${rows.length} games into public.games (draft)`)
  console.log('Next: mark some rows as published to show on the site.')
}

main().catch((e) => {
  console.error('❌', e)
  process.exit(1)
})
