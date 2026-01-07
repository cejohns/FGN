import { BaseGameProvider, GameData, GameRelease } from './GameProvider';

export class IGDBProvider extends BaseGameProvider {
  name = 'IGDB';
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    super();
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    this.enabled = !!(this.supabaseUrl && this.supabaseAnonKey);

    if (!this.enabled) {
      console.warn('[IGDB] Provider not configured - missing Supabase credentials');
    }
  }

  private async queryIGDB(params: Record<string, string>): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.supabaseUrl}/functions/v1/query-igdb?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      if (result.configured === false) {
        console.warn('[IGDB] API credentials not configured on server');
        this.enabled = false;
      }
      throw new Error(result.error || 'Query failed');
    }

    return result.data;
  }

  async getFeaturedGames(limit: number = 10): Promise<GameData[]> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not enabled');
      return [];
    }

    try {
      const data = await this.queryIGDB({
        type: 'featured',
        limit: limit.toString(),
      });

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[IGDB] getFeaturedGames error:', error);
      return [];
    }
  }

  async getUpcomingReleases(limit: number = 10): Promise<GameRelease[]> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not enabled');
      return [];
    }

    try {
      const data = await this.queryIGDB({
        type: 'upcoming',
        limit: limit.toString(),
      });

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[IGDB] getUpcomingReleases error:', error);
      return [];
    }
  }

  async getGameBySlug(slug: string): Promise<GameData | null> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not enabled');
      return null;
    }

    try {
      const data = await this.queryIGDB({
        type: 'slug',
        slug,
      });

      return data || null;
    } catch (error) {
      console.error('[IGDB] getGameBySlug error:', error);
      return null;
    }
  }

  async getGameById(id: string): Promise<GameData | null> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not enabled');
      return null;
    }

    try {
      const data = await this.queryIGDB({
        type: 'id',
        id,
      });

      return data || null;
    } catch (error) {
      console.error('[IGDB] getGameById error:', error);
      return null;
    }
  }

  async searchGames(query: string, limit: number = 10): Promise<GameData[]> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not enabled');
      return [];
    }

    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const data = await this.queryIGDB({
        type: 'search',
        query: query.trim(),
        limit: limit.toString(),
      });

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('[IGDB] searchGames error:', error);
      return [];
    }
  }
}
