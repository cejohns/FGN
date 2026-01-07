const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_API_URL = 'https://api.igdb.com/v4';

interface TokenCache {
  value: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.value;
  }

  const clientId = Deno.env.get('IGDB_CLIENT_ID') || Deno.env.get('TWITCH_CLIENT_ID');
  const clientSecret = Deno.env.get('IGDB_CLIENT_SECRET') || Deno.env.get('TWITCH_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('IGDB/Twitch credentials not configured. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET (or TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET)');
  }

  const tokenUrl = `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const response = await fetch(tokenUrl, { method: 'POST' });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  tokenCache = {
    value: data.access_token,
    expiresAt: now + (data.expires_in * 1000),
  };

  console.log('[IGDB] Access token obtained and cached');
  return tokenCache.value;
}

export async function igdbFetch(endpoint: string, query: string): Promise<any[]> {
  const token = await getAccessToken();
  const clientId = Deno.env.get('IGDB_CLIENT_ID') || Deno.env.get('TWITCH_CLIENT_ID');

  if (!clientId) {
    throw new Error('IGDB_CLIENT_ID or TWITCH_CLIENT_ID not configured');
  }

  const response = await fetch(`${IGDB_API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body: query,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IGDB API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

export function clearTokenCache(): void {
  tokenCache = null;
  console.log('[IGDB] Token cache cleared');
}

export function isTokenCached(): boolean {
  if (!tokenCache) return false;
  return tokenCache.expiresAt > Date.now() + 60000;
}
