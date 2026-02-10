import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function generateSitemapXML(entries: SitemapEntry[], baseUrl: string): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}${entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ""}${entry.priority !== undefined ? `\n    <priority>${entry.priority.toFixed(1)}</priority>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  return xml;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const baseUrl = new URL(req.url).searchParams.get("baseUrl") || "https://yourdomain.com";

    const staticPages: SitemapEntry[] = [
      { loc: "/", changefreq: "daily", priority: 1.0 },
      { loc: "/news", changefreq: "daily", priority: 0.9 },
      { loc: "/reviews", changefreq: "weekly", priority: 0.9 },
      { loc: "/blog", changefreq: "weekly", priority: 0.8 },
      { loc: "/guides", changefreq: "weekly", priority: 0.8 },
      { loc: "/videos", changefreq: "daily", priority: 0.7 },
      { loc: "/gallery", changefreq: "weekly", priority: 0.6 },
      { loc: "/releases", changefreq: "daily", priority: 0.8 },
    ];

    const [newsRes, reviewsRes, blogsRes, guidesRes] = await Promise.all([
      supabase
        .from("news_articles")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase
        .from("game_reviews")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase
        .from("guides")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(500),
    ]);

    const dynamicPages: SitemapEntry[] = [];

    if (newsRes.data) {
      newsRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/news/${item.slug}`,
          lastmod: new Date(item.updated_at).toISOString().split("T")[0],
          changefreq: "weekly",
          priority: 0.7,
        });
      });
    }

    if (reviewsRes.data) {
      reviewsRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/reviews/${item.slug}`,
          lastmod: new Date(item.updated_at).toISOString().split("T")[0],
          changefreq: "monthly",
          priority: 0.8,
        });
      });
    }

    if (blogsRes.data) {
      blogsRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/blog/${item.slug}`,
          lastmod: new Date(item.updated_at).toISOString().split("T")[0],
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    }

    if (guidesRes.data) {
      guidesRes.data.forEach((item) => {
        dynamicPages.push({
          loc: `/guides/${item.slug}`,
          lastmod: new Date(item.updated_at).toISOString().split("T")[0],
          changefreq: "monthly",
          priority: 0.7,
        });
      });
    }

    const allEntries = [...staticPages, ...dynamicPages];
    const sitemapXML = generateSitemapXML(allEntries, baseUrl);

    return new Response(sitemapXML, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
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
