/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizare pentru production
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'www.trustfamilydental.com',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
      },
      {
        protocol: 'https',
        hostname: 'w7.pngwing.com',
      },
      {
        protocol: 'https',
        hostname: 'e7.pngegg.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true, // Previne problemele de optimizare pe unele platforme
  },
  
  // Configurare pentru production
  reactStrictMode: true,
  
  // Previne erorile legate de redirect-status-code.js
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
