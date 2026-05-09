/**
 * Fixed-window rate limiter (single-process, in-memory).
 *
 * Limitations and upgrade path:
 *   - State is lost on process restart and not shared across Node workers.
 *   - For multi-instance deployments replace the Map store with a Redis / Upstash adapter.
 *
 * OWASP ASVS 4.0 §4.1.5 — throttle brute-force and resource-exhaustion attacks.
 * OWASP A04 Insecure Design — rate limits are a fundamental defence-in-depth layer.
 */

import { NextRequest, NextResponse } from 'next/server'

type Bucket = { count: number; resetAt: number }

export interface LimitResult {
  ok: boolean
  retryAfterMs: number
}

function createLimiter(options: { windowMs: number; max: number }) {
  const store = new Map<string, Bucket>()
  const { windowMs, max } = options

  return {
    check(key: string): LimitResult {
      const now = Date.now()
      let b = store.get(key)
      if (!b || now >= b.resetAt) {
        b = { count: 1, resetAt: now + windowMs }
        store.set(key, b)
        return { ok: true, retryAfterMs: 0 }
      }
      if (b.count < max) {
        b.count += 1
        return { ok: true, retryAfterMs: 0 }
      }
      return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) }
    },
  }
}

// ── Named limiters — tune these values for production load ──────────────────

/** Registration: 5 attempts per IP per 60 s. */
export const registerIpLimiter = createLimiter({ windowMs: 60_000, max: 5 })

/**
 * Login: 10 attempts per IP per 5 min; 5 per email address per 5 min.
 * Two axes prevent both distributed and targeted brute-force attacks.
 */
export const loginIpLimiter = createLimiter({ windowMs: 5 * 60_000, max: 10 })
export const loginEmailLimiter = createLimiter({ windowMs: 5 * 60_000, max: 5 })

/**
 * File upload: 20 files per user per minute.
 * Primary guard against disk exhaustion.
 */
export const uploadLimiter = createLimiter({ windowMs: 60_000, max: 20 })

/**
 * AI extraction: 10 calls per user per minute.
 * Each call hits the Anthropic API — strict cap prevents cost explosion.
 */
export const extractLimiter = createLimiter({ windowMs: 60_000, max: 10 })

/** General authenticated write operations (create/update/delete). */
export const writeLimiter = createLimiter({ windowMs: 60_000, max: 60 })

/** Validate endpoint: 30 per user per minute. */
export const validateLimiter = createLimiter({ windowMs: 60_000, max: 30 })

/** Sign-off: 5 per user per minute — prevents race conditions. */
export const signoffLimiter = createLimiter({ windowMs: 60_000, max: 5 })

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the best-available client IP from a NextRequest.
 * When deployed behind a trusted reverse proxy (Vercel, Nginx, etc.), X-Forwarded-For
 * is the standard header; X-Real-IP is a common fallback.
 * Falls back to 'local' for bare localhost development.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim()
    if (ip) return ip
  }
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'local'
}

/**
 * Returns a 429 Too Many Requests response with standard Retry-After and
 * X-RateLimit-Reset headers so clients can back off gracefully.
 */
export function rateLimitResponse(retryAfterMs: number): NextResponse {
  const retrySec = Math.max(1, Math.ceil(retryAfterMs / 1000))
  const resetEpoch = Math.ceil((Date.now() + retryAfterMs) / 1000)
  return NextResponse.json(
    { error: 'Too many requests. Please wait before retrying.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retrySec),
        'X-RateLimit-Reset': String(resetEpoch),
      },
    }
  )
}

// Keep the old export name so existing imports in register/route.ts still compile.
export const registerLimiter = registerIpLimiter
