import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyCronSecret, createCronUnauthorizedResponse } from "../_shared/cronAuth.ts";
import { igdbFetch } from "../_shared/igdbClient.ts";
import { buildCoverUrl, buildScreenshotUrl } from "../_shared/igdbImages.ts";
import { logCronExecution } from "../_shared/cronLogger.ts";

interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  cover?: { image_id: string };
  screenshots?: Array<{ image_id: string }>;
  first_release_date?: number;
  rating?: number;
  rating_count?: number;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ name: string }>;
  involved_companies?: Array<{
    company: { name: string };
    developer: boolean;
    publisher: boolean;
  }>;
}

function transformIGDBToDatabase(igdbGame: IGDBGame, autoPublish: boolean) {
  const studios: string[] = [];

  if (igdbGame.involved_companies) {
    const developers = igdbGame.involved_companies
      .filter((ic) => ic.developer)
      .map((ic) => ic.company.name);
    const publishers = igdbGame.involved_companies
      .filter((ic) => ic.publisher)
      .map((ic) => ic.company.name);

    studios.push(...developers, ...publishers);
  }

  const coverUrl = buildCoverUrl(igdbGame.cover?.image_id);
  const screenshotUrls = (igdbGame.screenshots || []).map((s) =>
    buildScreenshotUrl(s.image_id)
  );

  const releaseDate = igdbGame.first_release_date
    ? new Date(igdbGame.first_release_date * 1000).toISOString().split("T")[0]
    : null;

  const rating = igdbGame.rating ? igdbGame.rating / 10 : null;

  return {
    igdb_id: igdbGame.id,
    name: igdbGame.name,
    slug: igdbGame.slug,
    summary: igdbGame.summary || null,
    storyline: igdbGame.storyline || null,
    cover_url: coverUrl,
    screenshot_urls: screenshotUrls.length > 0 ? screenshotUrls : null,
    first_release_date: releaseDate,
    rating: rating,
    rating_count: igdbGame.rating_count || null,
    genres: igdbGame.genres?.map((g) => g.name) || null,
    platforms: igdbGame.platforms?.map((p) => p.name) || null,
    studios: studios.length > 0 ? studios : null,
    status: autoPublish ? "published" : "draft",
    is_featured: false,
    published_at: autoPublish ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

async function fetchFeaturedGames(limit: number): Promise<IGDBGame[]> {
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsAgo = now - (180 * 24 * 60 * 60);

  const query = `
    fields id, name, slug, summary, storyline,
           cover.image_id, screenshots.image_id,
           rating, rating_count, first_release_date,
           genres.name, platforms.name,
           involved_companies.company.name,
           involved_companies.developer,
           involved_companies.publisher;
    where first_release_date >= ${sixMonthsAgo}
      & rating >= 75
      & rating_count >= 10;
    sort rating desc;
    limit ${limit};
  `;

  return await igdbFetch("games", query);
}

Deno.serve(async (req: Request) => {
  const executionId = crypto.randomUUID();
  const startTime = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const authResult = verifyCronSecret(req);
  if (!authResult.authorized) {
    return createCronUnauthorizedResponse(req, authResult.error);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const autoPublish = Deno.env.get("AUTO_PUBLISH_IGDB") === "true";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    console.log(`[sync-igdb-games] Starting sync with limit=${limit}, autoPublish=${autoPublish}`);

    const igdbGames = await fetchFeaturedGames(limit);

    console.log(`[sync-igdb-games] Fetched ${igdbGames.length} games from IGDB`);

    if (igdbGames.length === 0) {
      const duration = Date.now() - startTime;

      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-games",
        status: "success",
        items_processed: 0,
        items_failed: 0,
        duration_ms: duration,
        details: { message: "No games to sync", limit },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "No games to sync",
          stats: { fetched: 0, upserted: 0, failed: 0 },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const upsertData = igdbGames.map((game) => transformIGDBToDatabase(game, autoPublish));

    const { data, error } = await supabase
      .from("games")
      .upsert(upsertData, {
        onConflict: "igdb_id",
        ignoreDuplicates: false,
      })
      .select("id, igdb_id, name, status");

    if (error) {
      console.error("[sync-igdb-games] Upsert error:", error);

      const duration = Date.now() - startTime;

      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-games",
        status: "failed",
        items_processed: 0,
        items_failed: igdbGames.length,
        duration_ms: duration,
        error_message: error.message,
        details: { limit },
      });

      throw error;
    }

    const duration = Date.now() - startTime;
    const upserted = data?.length || 0;

    console.log(`[sync-igdb-games] Successfully upserted ${upserted} games`);
    console.log(`[sync-igdb-games] Status: ${autoPublish ? "published" : "draft"}`);

    await logCronExecution(supabase, {
      execution_id: executionId,
      job_name: "sync-igdb-games",
      status: "success",
      items_processed: upserted,
      items_failed: 0,
      duration_ms: duration,
      details: {
        limit,
        autoPublish,
        games: data?.map(g => ({ igdb_id: g.igdb_id, name: g.name, status: g.status })),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${upserted} games from IGDB`,
        stats: {
          fetched: igdbGames.length,
          upserted,
          failed: 0,
          autoPublish,
        },
        executionId,
        duration: `${duration}ms`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[sync-igdb-games] Error:", error);

    const duration = Date.now() - startTime;

    try {
      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-games",
        status: "failed",
        items_processed: 0,
        items_failed: 0,
        duration_ms: duration,
        error_message: error instanceof Error ? error.message : "Unknown error",
        details: { error: String(error) },
      });
    } catch (logError) {
      console.error("[sync-igdb-games] Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionId,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
