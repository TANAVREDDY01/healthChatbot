/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL
    // Only proxy to external backend if BACKEND_URL is explicitly set
    if (backendUrl) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ]
    }
    // Otherwise, let Next.js API routes handle /api/* natively
    return []
  },
}

module.exports = nextConfig
