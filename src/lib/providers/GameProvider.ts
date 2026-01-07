export interface GameData {
  id: string;
  title: string;
  slug: string;
  description: string;
  releaseDate: string | null;
  platforms: string[];
  genres: string[];
  coverImage: string | null;
  screenshots: string[];
  rating?: number;
  developer?: string;
  publisher?: string;
  website?: string;
}

export interface GameRelease {
  id: string;
  title: string;
  slug: string;
  releaseDate: string;
  platforms: string[];
  coverImage: string | null;
  description?: string;
}

export interface GameProvider {
  name: string;
  enabled: boolean;

  getFeaturedGames(limit?: number): Promise<GameData[]>;

  getUpcomingReleases(limit?: number): Promise<GameRelease[]>;

  getGameBySlug(slug: string): Promise<GameData | null>;

  getGameById(id: string): Promise<GameData | null>;

  searchGames(query: string, limit?: number): Promise<GameData[]>;
}

export abstract class BaseGameProvider implements GameProvider {
  abstract name: string;
  enabled: boolean = true;

  abstract getFeaturedGames(limit?: number): Promise<GameData[]>;
  abstract getUpcomingReleases(limit?: number): Promise<GameRelease[]>;
  abstract getGameBySlug(slug: string): Promise<GameData | null>;
  abstract getGameById(id: string): Promise<GameData | null>;
  abstract searchGames(query: string, limit?: number): Promise<GameData[]>;

  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${this.name}] Error in ${context}:`, errorMessage);
    throw new Error(`${this.name} provider error: ${errorMessage}`);
  }
}
