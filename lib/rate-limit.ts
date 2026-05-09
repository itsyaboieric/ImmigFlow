/**
 * Single-process fixed-window rate limits (per key). For horizontal scale, replace with Redis/Upstash.
 */

type Bucket = { count: number; resetAt: number }

export function createSlidingLimiter(options: {
  windowMs: number
  max: number
}) {
  const store = new Map<string, Bucket>()
  const { windowMs, max } = options

  return {
    check(key: string): { ok: true } | { ok: false; retryAfterMs: number } {
      const now = Date.now()
      let b = store.get(key)
      if (!b || now >= b.resetAt) {
        b = { count: 1, resetAt: now + windowMs }
        store.set(key, b)
        return { ok: true }
      }
      if (b.count < max) {
        b.count += 1
        return { ok: true }
      }
      return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) }
    },
  }
}

export const registerLimiter = createSlidingLimiter({
  windowMs: 60 * 1000,
  max: 5,
})
