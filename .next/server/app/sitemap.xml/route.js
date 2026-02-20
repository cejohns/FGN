"use strict";(()=>{var e={};e.id=717,e.ids=[717],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},125:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>w,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>y,staticGenerationAsyncStorage:()=>h});var o={};t.r(o),t.d(o,{GET:()=>d,dynamic:()=>n,fetchCache:()=>u});var s=t(9303),i=t(8716),a=t(670),l=t(7857);let n="force-dynamic",u="force-no-store";async function p(){try{let e=function(){let e="https://dyfzxamsobywypoyocwz.supabase.co",r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Znp4YW1zb2J5d3lwb3lvY3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODg4MTYsImV4cCI6MjA3NTY2NDgxNn0.ax_tgvpWH0GRfSXTNcqnX5gVXnfiGjH8AweuOuVbrvw";return e&&r?(0,l.eI)(e,r,{auth:{persistSession:!1,autoRefreshToken:!1}}):(console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"),null)}();if(!e)return{blogPosts:[],newsArticles:[],reviews:[],guides:[]};let[r,t,o,s]=await Promise.all([e.from("blog_posts").select("slug, updated_at").eq("status","published"),e.from("news_articles").select("slug, updated_at").eq("status","published"),e.from("game_reviews").select("slug, updated_at").eq("status","published"),e.from("guides").select("slug, updated_at").eq("status","published")]);return r.error&&console.error("sitemap blog_posts error:",r.error),t.error&&console.error("sitemap news_articles error:",t.error),o.error&&console.error("sitemap game_reviews error:",o.error),s.error&&console.error("sitemap guides error:",s.error),{blogPosts:r.data||[],newsArticles:t.data||[],reviews:o.data||[],guides:s.data||[]}}catch(e){return console.error("sitemap getAllPublishedContent failed:",e),{blogPosts:[],newsArticles:[],reviews:[],guides:[]}}}function c(e){let r=new Date(e);return Number.isNaN(r.getTime())?new Date().toISOString():r.toISOString()}async function d(){let e="https://www.firestargn.com",{blogPosts:r,newsArticles:t,reviews:o,guides:s}=await p(),i=new Date().toISOString();return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[{url:"",priority:"1.0",changefreq:"daily"},{url:"/blog",priority:"0.9",changefreq:"daily"},{url:"/news",priority:"0.9",changefreq:"daily"},{url:"/reviews",priority:"0.8",changefreq:"weekly"},{url:"/guides",priority:"0.8",changefreq:"weekly"},{url:"/releases",priority:"0.7",changefreq:"weekly"},{url:"/gallery",priority:"0.6",changefreq:"weekly"},{url:"/videos",priority:"0.6",changefreq:"weekly"}].map(r=>`
  <url>
    <loc>${e}${r.url}</loc>
    <lastmod>${i}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("")}
  ${r.map(r=>`
  <url>
    <loc>${e}/blog/${r.slug}</loc>
    <lastmod>${c(r.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
  ${t.map(r=>`
  <url>
    <loc>${e}/news/${r.slug}</loc>
    <lastmod>${c(r.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
  ${o.map(r=>`
  <url>
    <loc>${e}/reviews/${r.slug}</loc>
    <lastmod>${c(r.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
  ${s.map(r=>`
  <url>
    <loc>${e}/guides/${r.slug}</loc>
    <lastmod>${c(r.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
</urlset>`,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"}})}let m=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"route",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"J:\\Bloomtech\\LigerTech\\FGN\\app\\sitemap.xml\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:g,staticGenerationAsyncStorage:h,serverHooks:y}=m,w="/sitemap.xml/route";function f(){return(0,a.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:h})}},9303:(e,r,t)=>{e.exports=t(517)}};var r=require("../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[948,857],()=>t(125));module.exports=o})();