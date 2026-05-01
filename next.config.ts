import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Allow all origins in development
  allowedDevOrigins: [
    // Allow all ngrok domains
    'https://*.ngrok-free.app',
    'https://*.ngrok.io',
    'https://*.ngrok.com',
    // Local development
    'http://localhost:*',
    'http://127.0.0.1:*',
  ],
}

export default nextConfig
