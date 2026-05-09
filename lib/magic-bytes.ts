/**
 * File type detection by magic bytes (file content), not by client-declared MIME type.
 *
 * OWASP A03 / CWE-434 — the client's File.type field is user-controlled and trivially spoofed.
 * Always verify the actual bytes before accepting an upload.
 */

// Map from MIME type to the byte signatures that identify it.
// Each entry is a list of checks; ALL must match (logical AND) for the type to be confirmed.
const SIGNATURES: Record<string, Array<{ offset: number; bytes: readonly number[] }>> = {
  'application/pdf': [
    { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  ],
  'image/jpeg': [
    { offset: 0, bytes: [0xff, 0xd8, 0xff] }, // JFIF / EXIF header start
  ],
  'image/png': [
    { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }, // ‰PNG\r\n\x1a\n
  ],
  'image/webp': [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  ],
}

/** Minimum bytes needed to check all signatures (WebP needs 12). */
const MIN_BYTES = 12

/**
 * Returns the detected MIME type for the given buffer, or null if unknown / unsupported.
 * Only covers the types the app actually accepts.
 */
export function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < MIN_BYTES) return null

  for (const [mimeType, checks] of Object.entries(SIGNATURES)) {
    const matches = checks.every(({ offset, bytes }) =>
      bytes.every((byte, i) => buffer[offset + i] === byte)
    )
    if (matches) return mimeType
  }
  return null
}

/**
 * Verifies that the buffer's actual type matches the client-declared MIME type.
 * Returns true only when both agree and the type is in our allowlist.
 */
export function validateFileContent(buffer: Buffer, declaredMimeType: string): boolean {
  const detected = detectMimeType(buffer)
  return detected !== null && detected === declaredMimeType
}
