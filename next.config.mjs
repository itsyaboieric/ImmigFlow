/**
 * Next.js configuration.
 *
 * Security headers applied globally (OWASP ASVS 14.4 — HTTP security headers).
 * Headers follow OWASP Secure Headers Project recommendations.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          /**
           * Content-Security-Policy
           * Restricts resource origins to prevent XSS and data injection.
           * 'unsafe-inline' for scripts is required by Next.js hydration and Tailwind CSS.
           * 'unsafe-eval' is intentionally omitted — Next.js 14 production builds don't need it.
           */
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join('; '),
          },

          /**
           * Strict-Transport-Security — enforces HTTPS for 1 year (OWASP A02).
           * Remove or shorten maxAge if running http-only in local dev.
           */
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },

          /** Prevents MIME-type sniffing — browsers must honour the declared Content-Type. */
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          /** Prevents clickjacking; redundant with CSP frame-ancestors but kept for older browsers. */
          { key: 'X-Frame-Options', value: 'DENY' },

          /** Full URL for same-origin, origin-only for cross-origin requests. */
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          /** Disable browser features this app does not use. */
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },

          /** Reduces DNS prefetching for cross-origin links. */
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
        ],
      },
    ]
  },
}

export default nextConfig
