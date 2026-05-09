/**
 * Server-side environment validation.
 * Imported by API routes and server-only lib files.
 * Fails loudly at startup so misconfigured deployments never silently serve traffic.
 *
 * OWASP ASVS 2.10.1 — integration secrets must not be hardcoded.
 * OWASP ASVS 14.2.1 — verify all components have up-to-date configuration.
 */

// Values that indicate the app was deployed without proper configuration.
const PLACEHOLDERS = new Set([
  'your-anthropic-api-key-here',
  'replace-with-a-random-32-char-secret',
  'changeme',
  'secret',
  'placeholder',
  'todo',
])

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}. Set it in .env.local.`)
  }
  if (PLACEHOLDERS.has(value)) {
    throw new Error(
      `[env] ${key} is set to a placeholder value. Replace it with a real secret before running.`
    )
  }
  return value
}

// ── Required for the app to function at all ──────────────────────────────────
const NEXTAUTH_SECRET = requireEnv('NEXTAUTH_SECRET')
const NEXTAUTH_URL = requireEnv('NEXTAUTH_URL')
const DATABASE_URL = requireEnv('DATABASE_URL')

if (NEXTAUTH_SECRET.length < 32) {
  throw new Error('[env] NEXTAUTH_SECRET must be at least 32 characters.')
}

// ── Required for AI extraction; app boots without it but extraction will fail ─
const rawAnthropicKey = process.env.ANTHROPIC_API_KEY ?? ''
if (!rawAnthropicKey || PLACEHOLDERS.has(rawAnthropicKey)) {
  // Warn instead of throw so the app can run without AI (useful for local UI dev).
  console.warn(
    '[env] ANTHROPIC_API_KEY is missing or a placeholder. ' +
      'AI document extraction will not work until a real key is set in .env.local.'
  )
}
const ANTHROPIC_API_KEY = rawAnthropicKey

export const env = {
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  DATABASE_URL,
  ANTHROPIC_API_KEY,
} as const
