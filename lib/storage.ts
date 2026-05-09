/**
 * Local-filesystem upload storage.
 * All file I/O is centralised here so swapping to S3/R2/GCS in production
 * only requires changing this module.
 *
 * Security notes:
 *   - sanitizeFileNameSegment prevents path traversal (CWE-22).
 *   - saveUploadedFile only permits extensions in ALLOWED_EXTENSIONS (allowlist over blocklist).
 *   - File names are never taken verbatim from user input; they are generated server-side.
 */

import { mkdirSync, writeFileSync, readFileSync, unlinkSync, rmSync, existsSync } from 'fs'
import { join, extname } from 'path'

/** Hard cap enforced server-side before hitting the Anthropic API. Keep in sync with UI hint. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB

// ── Extension allowlist (OWASP A03 / CWE-434) ────────────────────────────────
// Only the file types whose magic bytes we validate. Reject everything else.
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp'])

export function uploadsRoot(): string {
  return join(process.cwd(), 'uploads')
}

export function uploadsCaseDir(caseId: string): string {
  return join(uploadsRoot(), sanitizeFileNameSegment(caseId))
}

/**
 * Writes `buffer` to the case upload directory.
 * The stored file name is generated server-side (timestamp + random slug) so
 * the original name from the client is never used in a path.
 * Throws if `ext` is not in ALLOWED_EXTENSIONS.
 */
export function saveUploadedFile(caseId: string, buffer: Buffer, ext: string): string {
  // Normalise and allowlist the extension
  const normalizedExt = ('.' + ext.replace(/[^\w]/g, '')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(normalizedExt)) {
    throw new Error(`File extension '${normalizedExt}' is not permitted.`)
  }

  mkdirSync(uploadsCaseDir(caseId), { recursive: true })
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${normalizedExt}`
  writeFileSync(join(uploadsCaseDir(caseId), fileName), buffer)
  return fileName
}

/** Reads an uploaded file. Sanitizes the file name to prevent path traversal. */
export function readUploadedFile(caseId: string, fileName: string): Buffer {
  return readFileSync(join(uploadsCaseDir(caseId), sanitizeFileNameSegment(fileName)))
}

/** Deletes a single uploaded file. Sanitizes paths; silently ignores missing files. */
export function deleteUploadedFile(caseId: string, fileName: string): void {
  try {
    unlinkSync(join(uploadsCaseDir(caseId), sanitizeFileNameSegment(fileName)))
  } catch {
    // File may already be gone — not an error condition
  }
}

/** Removes the entire case upload directory (called on case deletion). */
export function removeCaseUploadDirectory(caseId: string): void {
  const dir = uploadsCaseDir(caseId)
  try {
    if (existsSync(dir)) rmSync(dir, { recursive: true })
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Guards against path traversal (CWE-22):
 *   - Rejects segments containing `..`, `/`, or `\`.
 *   - Rejects empty segments.
 * This is a defence-in-depth layer; file names are already generated server-side.
 */
function sanitizeFileNameSegment(name: string): string {
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('Invalid file path segment.')
  }
  return name
}
