/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredBy: false, // Remove X-Powered-By header (security best practice)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'DeepBlue Health',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },

  // ── Security Headers ─────────────────────────────────────────────
  // Production-grade HTTP security headers to protect against
  // XSS, clickjacking, MIME sniffing, and other common attacks.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking — only allow embedding from same origin
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enable DNS prefetching for performance
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Control referrer information sent with requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions Policy — restrict access to sensitive browser APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self), bluetooth=(self)',
          },
          // Strict Transport Security — force HTTPS (1 year, include subdomains)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy — restrict resource loading
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com https://api.anthropic.com",
              "media-src 'self'",
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
      // Cache static assets aggressively for performance
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect common health-check paths to our API
      { source: '/healthz', destination: '/api/health', permanent: false },
      { source: '/health', destination: '/api/health', permanent: false },
    ];
  },
}

module.exports = nextConfig
