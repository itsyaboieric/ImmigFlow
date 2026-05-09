import { describe, expect, it } from 'vitest'
import { detectMimeType, validateFileContent } from '@/lib/magic-bytes'

// Minimal valid magic-byte prefixes for each supported type.
function makePdf() {
  const b = Buffer.alloc(16)
  b.write('%PDF', 0, 'ascii')
  return b
}
function makeJpeg() {
  const b = Buffer.alloc(16)
  b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff
  return b
}
function makePng() {
  const b = Buffer.alloc(16)
  b[0] = 0x89; b[1] = 0x50; b[2] = 0x4e; b[3] = 0x47
  b[4] = 0x0d; b[5] = 0x0a; b[6] = 0x1a; b[7] = 0x0a
  return b
}
function makeWebp() {
  const b = Buffer.alloc(16)
  b.write('RIFF', 0, 'ascii')
  b.write('WEBP', 8, 'ascii')
  return b
}
function makeExe() {
  const b = Buffer.alloc(16)
  b[0] = 0x4d; b[1] = 0x5a // MZ — Windows PE header
  return b
}

describe('detectMimeType', () => {
  it('detects PDF', () => expect(detectMimeType(makePdf())).toBe('application/pdf'))
  it('detects JPEG', () => expect(detectMimeType(makeJpeg())).toBe('image/jpeg'))
  it('detects PNG', () => expect(detectMimeType(makePng())).toBe('image/png'))
  it('detects WebP', () => expect(detectMimeType(makeWebp())).toBe('image/webp'))
  it('returns null for unknown type', () => expect(detectMimeType(makeExe())).toBeNull())
  it('returns null for empty buffer', () => expect(detectMimeType(Buffer.alloc(0))).toBeNull())
})

describe('validateFileContent', () => {
  it('accepts PDF with matching declared type', () =>
    expect(validateFileContent(makePdf(), 'application/pdf')).toBe(true))

  it('rejects exe disguised as PDF', () =>
    expect(validateFileContent(makeExe(), 'application/pdf')).toBe(false))

  it('rejects JPEG declared as PNG', () =>
    expect(validateFileContent(makeJpeg(), 'image/png')).toBe(false))

  it('accepts PNG with matching declared type', () =>
    expect(validateFileContent(makePng(), 'image/png')).toBe(true))
})
