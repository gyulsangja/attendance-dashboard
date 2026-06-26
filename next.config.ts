import type { NextConfig } from 'next';

const backendApiOrigin = process.env.BACKEND_API_ORIGIN ?? 'http://192.168.0.191:8080';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${backendApiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
