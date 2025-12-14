/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Netlify - using static export since we don't have SSR/API routes
  // @netlify/plugin-nextjs will automatically handle middleware if needed
  output: 'export',
  
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
    unoptimized: true, // Required for static export
  },
  
  // Production configuration
  reactStrictMode: true,
  
  // Prevents errors related to redirect-status-code.js
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
