import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  /**
   * Proxy all /api/* requests to the Express backend.
   * This keeps all frontend fetch() calls using /api/... unchanged,
   * while the actual server logic lives in the backend folder.
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
