/**
 * Zod schemas for all API inputs.
 * Used server-side only. Validates types, lengths, formats, and allowed values.
 *
 * OWASP A03 — injection prevention via strict input validation.
 * OWASP ASVS 5.1.3 — validate all user-supplied data server-side.
 * OWASP ASVS 5.1.4 — reject unexpected fields.
 */

import { z } from 'zod'

// ── Enum allowlists ──────────────────────────────────────────────────────────

export const APPLICATION_TYPES = [
  'LMIA_HIGH_WAGE',
  'LMIA_LOW_WAGE',
  'WORK_PERMIT',
] as const

export const DOCUMENT_TYPES = [
  'PASSPORT',
  'EMPLOYMENT_LETTER',
  'JOB_OFFER',
  'DIPLOMA',
  'PAY_STUB',
  'BUSINESS_REG',
  'OTHER',
] as const

export const PROVINCE_CODES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU',
  'ON', 'PE', 'QC', 'SK', 'YT',
] as const

export const CASE_STATUSES = [
  'DRAFT',
  'DOCUMENTS_PENDING',
  'REVIEW',
  'SIGNED_OFF',
] as const

// ── Reusable field helpers ───────────────────────────────────────────────────

/** Empty string treated as absent (undefined) so optional fields can be cleared. */
function optionalString(max: number) {
  return z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
    z.string().max(max).optional()
  )
}

/**
 * Numeric field that may arrive as a numeric string from an HTML form input.
 * Empty string, null, or undefined → undefined (field omitted).
 */
function optionalInt(min: number, max: number) {
  return z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : Math.trunc(n)
    },
    z.number().int().min(min).max(max).optional()
  )
}

function optionalFloat(min: number, max: number) {
  return z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    },
    z.number().min(min).max(max).optional()
  )
}

// ── Public schemas ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * .strict() rejects any key not listed here (OWASP ASVS 5.1.4).
 */
export const RegisterSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100).trim(),
    // RFC 5321 max local+domain = 254 chars
    email: z.string().email('Invalid email address').max(254).trim(),
    firmName: optionalString(200),
    // Require at least one non-letter character to prevent trivially guessable passwords.
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long')
      .refine(
        (p) => /[^a-zA-Z]/.test(p),
        'Password must contain at least one number or special character'
      ),
  })
  .strict()

/**
 * POST /api/cases
 */
export const CreateCaseSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200).trim(),
    applicationType: z.enum(APPLICATION_TYPES),
    clientName: optionalString(200),
    employerName: optionalString(200),
    // Accept '' (form blank) as absent, otherwise must be a known province code
    province: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      z.enum(PROVINCE_CODES).optional()
    ),
    // NOC codes: 4-digit (pre-2022) or 5-digit (TEER)
    nocCode: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
      z.string().regex(/^\d{4,5}$/, 'NOC code must be 4 or 5 digits').optional()
    ),
    nationality: optionalString(100),
    permitDuration: optionalInt(1, 60),
    offeredSalary: optionalFloat(0, 10_000_000),
    notes: optionalString(2000),
  })
  .strict()

/**
 * PATCH /api/cases/[id]
 * All fields optional; applicationType and userId cannot be changed after creation.
 */
export const UpdateCaseSchema = z
  .object({
    title: z.string().min(1).max(200).trim().optional(),
    status: z.enum(CASE_STATUSES).optional(),
    clientName: optionalString(200),
    employerName: optionalString(200),
    province: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      z.enum(PROVINCE_CODES).optional()
    ),
    nocCode: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : String(v).trim()),
      z.string().regex(/^\d{4,5}$/).optional()
    ),
    nationality: optionalString(100),
    permitDuration: optionalInt(1, 60),
    offeredSalary: optionalFloat(0, 10_000_000),
    notes: optionalString(2000),
  })
  .strict()

/** document type field shared between upload form and extract route */
export const DocumentTypeSchema = z.enum(DOCUMENT_TYPES)

/** Parse a Zod error into a single human-readable string for API responses. */
export function zodErrorMessage(error: z.ZodError): string {
  return error.errors.map(e => e.message).join('. ')
}
