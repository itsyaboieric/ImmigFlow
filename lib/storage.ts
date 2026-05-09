import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  rmSync,
  existsSync,
} from 'fs'
import { join } from 'path'

/** Local filesystem uploads; swap implementations for production object storage (S3, R2, etc.). */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB — keep in sync with case UI hint

export function uploadsRoot(): string {
  return join(process.cwd(), 'uploads')
}

export function uploadsCaseDir(caseId: string): string {
  return join(uploadsRoot(), caseId)
}

export function saveUploadedFile(caseId: string, buffer: Buffer, ext: string): string {
  mkdirSync(uploadsCaseDir(caseId), { recursive: true })
  const safeExt = ext.replace(/[^\w.-]/g, '') || 'bin'
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${safeExt}`
  writeFileSync(join(uploadsCaseDir(caseId), fileName), buffer)
  return fileName
}

export function readUploadedFile(caseId: string, fileName: string): Buffer {
  const baseName = sanitizeFileNameSegment(fileName)
  return readFileSync(join(uploadsCaseDir(caseId), baseName))
}

export function deleteUploadedFile(caseId: string, fileName: string): void {
  try {
    const baseName = sanitizeFileNameSegment(fileName)
    unlinkSync(join(uploadsCaseDir(caseId), baseName))
  } catch {
    // File missing — ignore
  }
}

export function removeCaseUploadDirectory(caseId: string): void {
  const dir = uploadsCaseDir(caseId)
  try {
    if (existsSync(dir)) rmSync(dir, { recursive: true })
  } catch {
    // Best-effort cleanup
  }
}

function sanitizeFileNameSegment(name: string): string {
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('Invalid file name.')
  }
  return name
}
