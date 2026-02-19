/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.igdb.com",
      "media.rawg.io",
      "i.ytimg.com",
      "images.pexels.com",
      "static-cdn.jtvnw.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
