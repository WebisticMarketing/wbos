/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  // ✅ Add this to silence the Turbopack/webpack mismatch error
  turbopack: {},
  
  async rewrites() {
    return [
      {
        source: '/wbos/:slug/:path*',
        destination: '/wbos/sadaat/:path*',
      },
      {
        source: '/wbos/:slug',
        destination: '/wbos/sadaat',
      },
    ];
  },
});

module.exports = nextConfig;