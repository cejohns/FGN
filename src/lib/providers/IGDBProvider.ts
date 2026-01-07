import { BaseGameProvider, GameData, GameRelease } from './GameProvider';

export class IGDBProvider extends BaseGameProvider {
  name = 'IGDB';
  private apiUrl: string;
  private clientId: string;
  private accessToken: string;

  constructor(config?: { apiUrl?: string; clientId?: string; accessToken?: string }) {
    super();
    this.apiUrl = config?.apiUrl || 'https://api.igdb.com/v4';
    this.clientId = config?.clientId || '';
    this.accessToken = config?.accessToken || '';
    this.enabled = !!(this.clientId && this.accessToken);
  }

  async getFeaturedGames(limit: number = 10): Promise<GameData[]> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not configured');
      return [];
    }

    try {
      return [];
    } catch (error) {
      this.handleError(error, 'getFeaturedGames');
    }
  }

  async getUpcomingReleases(limit: number = 10): Promise<GameRelease[]> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not configured');
      return [];
    }

    try {
      return [];
    } catch (error) {
      this.handleError(error, 'getUpcomingReleases');
    }
  }

  async getGameBySlug(slug: string): Promise<GameData | null> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not configured');
      return null;
    }

    try {
      return null;
    } catch (error) {
      this.handleError(error, 'getGameBySlug');
    }
  }

  async getGameById(id: string): Promise<GameData | null> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not configured');
      return null;
    }

    try {
      return null;
    } catch (error) {
      this.handleError(error, 'getGameById');
    }
  }

  async searchGames(query: string, limit: number = 10): Promise<GameData[]> {
    if (!this.enabled) {
      console.warn('[IGDB] Provider not configured');
      return [];
    }

    try {
      return [];
    } catch (error) {
      this.handleError(error, 'searchGames');
    }
  }
}
