import { GameProvider, GameData, GameRelease } from './GameProvider';
import { IGDBProvider } from './IGDBProvider';
import { RAWGProvider } from './RAWGProvider';

export class ProviderManager {
  private providers: GameProvider[] = [];
  private primaryProvider: GameProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const igdbProvider = new IGDBProvider();
    const rawgProvider = new RAWGProvider();

    if (igdbProvider.enabled) {
      this.providers.push(igdbProvider);
      if (!this.primaryProvider) {
        this.primaryProvider = igdbProvider;
      }
    }

    if (rawgProvider.enabled) {
      this.providers.push(rawgProvider);
      if (!this.primaryProvider) {
        this.primaryProvider = rawgProvider;
      }
    }

    if (this.providers.length === 0) {
      console.warn('[ProviderManager] No game data providers are configured');
    }
  }

  async getFeaturedGames(limit: number = 10): Promise<GameData[]> {
    for (const provider of this.providers) {
      try {
        const games = await provider.getFeaturedGames(limit);
        if (games.length > 0) {
          return games;
        }
      } catch (error) {
        console.error(`[ProviderManager] Failed to get featured games from ${provider.name}:`, error);
      }
    }
    return [];
  }

  async getUpcomingReleases(limit: number = 10): Promise<GameRelease[]> {
    for (const provider of this.providers) {
      try {
        const releases = await provider.getUpcomingReleases(limit);
        if (releases.length > 0) {
          return releases;
        }
      } catch (error) {
        console.error(`[ProviderManager] Failed to get releases from ${provider.name}:`, error);
      }
    }
    return [];
  }

  async getGameBySlug(slug: string): Promise<GameData | null> {
    for (const provider of this.providers) {
      try {
        const game = await provider.getGameBySlug(slug);
        if (game) {
          return game;
        }
      } catch (error) {
        console.error(`[ProviderManager] Failed to get game by slug from ${provider.name}:`, error);
      }
    }
    return null;
  }

  async getGameById(id: string): Promise<GameData | null> {
    for (const provider of this.providers) {
      try {
        const game = await provider.getGameById(id);
        if (game) {
          return game;
        }
      } catch (error) {
        console.error(`[ProviderManager] Failed to get game by id from ${provider.name}:`, error);
      }
    }
    return null;
  }

  async searchGames(query: string, limit: number = 10): Promise<GameData[]> {
    for (const provider of this.providers) {
      try {
        const games = await provider.searchGames(query, limit);
        if (games.length > 0) {
          return games;
        }
      } catch (error) {
        console.error(`[ProviderManager] Failed to search games from ${provider.name}:`, error);
      }
    }
    return [];
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  getPrimaryProvider(): string | null {
    return this.primaryProvider?.name || null;
  }
}

export const providerManager = new ProviderManager();
