import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { corsHeaders } from "./_shared/cors.ts";
import { verifyCronSecret, createCronUnauthorizedResponse } from "./_shared/cronAuth.ts";
import { igdbFetch } from "./_shared/igdbClient.ts";
import { buildCoverUrl } from "./_shared/igdbImages.ts";
import { logCronExecution } from "./_shared/cronLogger.ts";

interface IGDBReleaseDate {
  id: number;
  date: number;
  platform?: { name: string };
  region?: number;
  game?: {
    id: number;
    name: string;
    slug: string;
    summary?: string;
    cover?: { image_id: string };
  };
}

const REGION_MAP: Record<number, string> = {
  1: "Europe",
  2: "North America",
  3: "Australia",
  4: "New Zealand",
  5: "Japan",
  6: "China",
  7: "Asia",
  8: "Worldwide",
};

function createSlug(title: string, platform?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);

  if (platform) {
    const platformSlug = platform
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 20);
    return `${base}-${platformSlug}`;
  }

  return base;
}

function transformIGDBReleaseToDatabase(igdbRelease: IGDBReleaseDate, autoPublish: boolean) {
  const game = igdbRelease.game;
  if (!game) {
    throw new Error("Release missing game data");
  }

  const coverUrl = buildCoverUrl(game.cover?.image_id);
  const releaseDate = new Date(igdbRelease.date * 1000).toISOString().split("T")[0];
  const platform = igdbRelease.platform?.name || "Unknown";
  const region = igdbRelease.region ? REGION_MAP[igdbRelease.region] || "Unknown" : "Unknown";
  const slug = createSlug(game.name, platform);

  return {
    title: game.name,
    slug,
    release_date: releaseDate,
    platform,
    region,
    cover_image_url: coverUrl,
    source: "igdb",
    source_id: igdbRelease.id.toString(),
    source_url: `https://www.igdb.com/games/${game.slug}`,
    status: autoPublish ? "published" : "draft",
    updated_at: new Date().toISOString(),
  };
}

async function fetchUpcomingReleases(limit: number): Promise<IGDBReleaseDate[]> {
  const now = Math.floor(Date.now() / 1000);
  const threeMonthsLater = now + (90 * 24 * 60 * 60);

  const query = `
    fields id, date, platform.name, region,
           game.id, game.name, game.slug, game.summary,
           game.cover.image_id;
    where date >= ${now}
      & date < ${threeMonthsLater}
      & game != null
      & platform != null;
    sort date asc;
    limit ${limit};
  `;

  return await igdbFetch("release_dates", query);
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
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    console.log(`[sync-igdb-releases] Starting sync with limit=${limit}, autoPublish=${autoPublish}`);

    const igdbReleases = await fetchUpcomingReleases(limit);

    console.log(`[sync-igdb-releases] Fetched ${igdbReleases.length} releases from IGDB`);

    if (igdbReleases.length === 0) {
      const duration = Date.now() - startTime;

      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-releases",
        status: "success",
        items_processed: 0,
        items_failed: 0,
        duration_ms: duration,
        details: { message: "No releases to sync", limit },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "No releases to sync",
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

    const upsertData = igdbReleases
      .map((release) => {
        try {
          return transformIGDBReleaseToDatabase(release, autoPublish);
        } catch (error) {
          console.error(`[sync-igdb-releases] Failed to transform release ${release.id}:`, error);
          return null;
        }
      })
      .filter((r) => r !== null);

    console.log(`[sync-igdb-releases] Transformed ${upsertData.length} valid releases`);

    if (upsertData.length === 0) {
      const duration = Date.now() - startTime;

      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-releases",
        status: "success",
        items_processed: 0,
        items_failed: igdbReleases.length,
        duration_ms: duration,
        details: { message: "No valid releases to upsert", limit },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "No valid releases to upsert",
          stats: { fetched: igdbReleases.length, upserted: 0, failed: igdbReleases.length },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data, error } = await supabase
      .from("game_releases")
      .upsert(upsertData, {
        onConflict: "slug",
        ignoreDuplicates: false,
      })
      .select("id, title, release_date, platform, status");

    if (error) {
      console.error("[sync-igdb-releases] Upsert error:", error);

      const duration = Date.now() - startTime;

      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-releases",
        status: "failed",
        items_processed: 0,
        items_failed: upsertData.length,
        duration_ms: duration,
        error_message: error.message,
        details: { limit },
      });

      throw error;
    }

    const duration = Date.now() - startTime;
    const upserted = data?.length || 0;
    const failed = igdbReleases.length - upsertData.length;

    console.log(`[sync-igdb-releases] Successfully upserted ${upserted} releases`);
    console.log(`[sync-igdb-releases] Status: ${autoPublish ? "published" : "draft"}`);

    await logCronExecution(supabase, {
      execution_id: executionId,
      job_name: "sync-igdb-releases",
      status: "success",
      items_processed: upserted,
      items_failed: failed,
      duration_ms: duration,
      details: {
        limit,
        autoPublish,
        releases: data?.map(r => ({
          title: r.title,
          release_date: r.release_date,
          platform: r.platform,
          status: r.status,
        })),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${upserted} releases from IGDB`,
        stats: {
          fetched: igdbReleases.length,
          upserted,
          failed,
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
    console.error("[sync-igdb-releases] Error:", error);

    const duration = Date.now() - startTime;

    try {
      await logCronExecution(supabase, {
        execution_id: executionId,
        job_name: "sync-igdb-releases",
        status: "failed",
        items_processed: 0,
        items_failed: 0,
        duration_ms: duration,
        error_message: error instanceof Error ? error.message : "Unknown error",
        details: { error: String(error) },
      });
    } catch (logError) {
      console.error("[sync-igdb-releases] Failed to log error:", logError);
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
