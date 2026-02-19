"use strict";(()=>{var e={};e.id=717,e.ids=[717],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},125:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>y,requestAsyncStorage:()=>m,routeModule:()=>c,serverHooks:()=>h,staticGenerationAsyncStorage:()=>g});var a={};r.r(a),r.d(a,{GET:()=>d,revalidate:()=>n});var s=r(9303),o=r(8716),i=r(670),l=r(5655);let n=3600;async function u(){let e=(0,l.f)(),[t,r,a,s]=await Promise.all([e.from("blog_posts").select("slug, updated_at").eq("status","published"),e.from("news_articles").select("slug, updated_at").eq("status","published"),e.from("game_reviews").select("slug, updated_at").eq("status","published"),e.from("guides").select("slug, updated_at").eq("status","published")]);return{blogPosts:t.data||[],newsArticles:r.data||[],reviews:a.data||[],guides:s.data||[]}}function p(e){return new Date(e).toISOString()}async function d(){let e="https://www.firestargn.com",{blogPosts:t,newsArticles:r,reviews:a,guides:s}=await u();return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[{url:"",priority:"1.0",changefreq:"daily"},{url:"/blog",priority:"0.9",changefreq:"daily"}].map(t=>`
  <url>
    <loc>${e}${t.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${t.changefreq}</changefreq>
    <priority>${t.priority}</priority>
  </url>`).join("")}
  ${t.map(t=>`
  <url>
    <loc>${e}/blog/${t.slug}</loc>
    <lastmod>${p(t.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
  ${r.map(t=>`
  <url>
    <loc>${e}/news/${t.slug}</loc>
    <lastmod>${p(t.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
  ${a.map(t=>`
  <url>
    <loc>${e}/reviews/${t.slug}</loc>
    <lastmod>${p(t.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
  ${s.map(t=>`
  <url>
    <loc>${e}/guides/${t.slug}</loc>
    <lastmod>${p(t.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
</urlset>`,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, s-maxage=3600"}})}let c=new s.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"route",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"J:\\Bloomtech\\LigerTech\\FGN\\app\\sitemap.xml\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:m,staticGenerationAsyncStorage:g,serverHooks:h}=c,f="/sitemap.xml/route";function y(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:g})}},9303:(e,t,r)=>{e.exports=r(517)},5655:(e,t,r)=>{r.d(t,{f:()=>s});var a=r(7857);function s(){let e="https://YOURPROJECT.supabase.co",t="YOUR_ANON_KEY";if(!e||!t)throw Error("Missing Supabase environment variables");return(0,a.eI)(e,t,{auth:{persistSession:!1}})}}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,857],()=>r(125));module.exports=a})();