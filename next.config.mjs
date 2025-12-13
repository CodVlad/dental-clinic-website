/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  turbopack: {
    // Explicitly set project root to avoid multi-lockfile root inference warnings
    root: new URL('.', import.meta.url).pathname,
  },
};

export default nextConfig;
