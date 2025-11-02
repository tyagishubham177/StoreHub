/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:3000']
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      }
    ]
  }
};

export default nextConfig;
