/**
 * Claude API wrapper for document extraction.
 *
 * Security notes:
 *   - ANTHROPIC_API_KEY is read from env at call time (never bundled client-side).
 *   - documentType is validated against a strict allowlist before use (OWASP A03).
 *   - Only server-side code should import this module.
 */

import Anthropic from '@anthropic-ai/sdk'
import { parseModelJsonObject } from './parse-json-block'
import { env } from './env'
import { DOCUMENT_TYPES } from './schemas'

// The Anthropic client is instantiated lazily so startup env validation runs first.
// API key is sourced from lib/env.ts which rejects placeholder values.
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

const EXTRACTION_PROMPTS: Record<string, string> = {
  PASSPORT: `Extract all fields from this passport. Return ONLY a valid JSON object with these exact keys:
{
  "full_name": "full legal name as printed",
  "surname": "surname/family name",
  "given_names": "given names",
  "date_of_birth": "YYYY-MM-DD",
  "passport_number": "exact passport number",
  "expiry_date": "YYYY-MM-DD",
  "issue_date": "YYYY-MM-DD or null",
  "issuing_country": "country name",
  "nationality": "nationality",
  "sex": "M or F",
  "place_of_birth": "city, country or null",
  "confidence": 0.95
}`,

  EMPLOYMENT_LETTER: `Extract all fields from this employment letter or reference letter. Return ONLY a valid JSON object:
{
  "employer_name": "company name",
  "employee_name": "employee full name",
  "job_title": "job title",
  "noc_code": "NOC code or null",
  "employment_start_date": "YYYY-MM-DD or null",
  "employment_end_date": "YYYY-MM-DD or null",
  "is_ongoing": true,
  "work_location_city": "city",
  "work_location_province": "province abbreviation",
  "annual_salary": 0,
  "hourly_rate": null,
  "hours_per_week": 40,
  "letter_date": "YYYY-MM-DD or null",
  "signatory_name": "signer name or null",
  "signatory_title": "signer title or null",
  "confidence": 0.95
}`,

  JOB_OFFER: `Extract all fields from this job offer letter. Return ONLY a valid JSON object:
{
  "employer_name": "company name",
  "applicant_name": "applicant full name",
  "job_title": "job title",
  "noc_code": "NOC code or null",
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "is_permanent": false,
  "work_location_city": "city",
  "work_location_province": "province abbreviation",
  "annual_salary": 0,
  "hourly_rate": null,
  "hours_per_week": 40,
  "offer_date": "YYYY-MM-DD or null",
  "confidence": 0.95
}`,

  DIPLOMA: `Extract all fields from this diploma or educational certificate. Return ONLY a valid JSON object:
{
  "institution_name": "school or university name",
  "graduate_name": "graduate full name",
  "credential_type": "Bachelor's Degree or Master's Degree or Diploma etc.",
  "credential_name": "official credential title",
  "field_of_study": "major or field",
  "graduation_date": "YYYY-MM-DD or YYYY-MM",
  "confidence": 0.95
}`,

  PAY_STUB: `Extract all fields from this pay stub. Return ONLY a valid JSON object:
{
  "employer_name": "employer name",
  "employee_name": "employee name",
  "pay_period_start": "YYYY-MM-DD or null",
  "pay_period_end": "YYYY-MM-DD or null",
  "gross_pay": 0,
  "net_pay": 0,
  "hourly_rate": null,
  "hours_worked": null,
  "ytd_gross": null,
  "confidence": 0.95
}`,

  BUSINESS_REG: `Extract all fields from this business registration or certificate. Return ONLY a valid JSON object:
{
  "business_name": "registered business name",
  "registration_number": "registration number",
  "registration_date": "YYYY-MM-DD or null",
  "jurisdiction": "province or federal",
  "business_type": "corporation or partnership etc.",
  "registered_address": "address or null",
  "confidence": 0.95
}`,

  OTHER: `Extract relevant information from this document. Return ONLY a valid JSON object:
{
  "document_title": "document type or title",
  "key_parties": [],
  "key_dates": {},
  "key_information": {},
  "confidence": 0.7
}`,
}

export interface ExtractionResult {
  data: Record<string, unknown>
  confidence: number
}

export async function extractDocumentData(
  fileBuffer: Buffer,
  mimeType: string,
  documentType: string
): Promise<ExtractionResult> {
  // Allowlist documentType — reject any value not in the known set (OWASP A03).
  // Falls back to OTHER for types not individually tuned, but never uses arbitrary input as a prompt key.
  const safeType = (DOCUMENT_TYPES as readonly string[]).includes(documentType)
    ? documentType
    : 'OTHER'

  const base64Data = fileBuffer.toString('base64')
  const prompt = EXTRACTION_PROMPTS[safeType] ?? EXTRACTION_PROMPTS.OTHER

  const isPdf = mimeType === 'application/pdf'
  const isImage = mimeType.startsWith('image/')

  if (!isPdf && !isImage) {
    throw new Error(`Unsupported file type: ${mimeType}`)
  }

  type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  const fileBlock = isPdf
    ? ({
        type: 'document' as const,
        source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64Data },
      } as Anthropic.DocumentBlockParam)
    : ({
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mimeType as ImageMediaType, data: base64Data },
      } as Anthropic.ImageBlockParam)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          fileBlock,
          { type: 'text', text: prompt + '\n\nReturn ONLY the JSON object, no other text.' },
        ],
      },
    ],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

  const parsed = parseModelJsonObject(rawText)
  if (parsed) {
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.85
    return { data: parsed, confidence }
  }
  return {
    data: { raw_text: rawText.trim().slice(0, 8000), parse_error: true },
    confidence: 0.0,
  }
}
