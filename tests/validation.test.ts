import { describe, expect, it } from 'vitest'
import { validateCrossDocuments, type ExtractedDoc } from '@/lib/validation'

function doc(
  overrides: Partial<ExtractedDoc> & Pick<ExtractedDoc, 'type' | 'docId' | 'fileName' | 'data'>
): ExtractedDoc {
  return {
    type: overrides.type,
    data: overrides.data,
    docId: overrides.docId,
    fileName: overrides.fileName,
  }
}

describe('validateCrossDocuments', () => {
  it('detects mismatched applicant names across documents', () => {
    const docs: ExtractedDoc[] = [
      doc({
        type: 'PASSPORT',
        docId: '1',
        fileName: 'p.pdf',
        data: { full_name: 'John Michael Smith', confidence: 0.9 },
      }),
      doc({
        type: 'JOB_OFFER',
        docId: '2',
        fileName: 'o.pdf',
        data: {
          applicant_name: 'Jonathan Z. Differentperson',
          annual_salary: 100000,
          confidence: 0.9,
        },
      }),
    ]

    const errors = validateCrossDocuments(docs, { province: 'ON' })
    expect(errors.some(e => e.id === 'name_mismatch')).toBe(true)
  })

  it('passes when names align', () => {
    const docs: ExtractedDoc[] = [
      doc({
        type: 'PASSPORT',
        docId: '1',
        fileName: 'p.pdf',
        data: { full_name: 'Maria Garcia Lopez', confidence: 0.9 },
      }),
      doc({
        type: 'JOB_OFFER',
        docId: '2',
        fileName: 'o.pdf',
        data: {
          applicant_name: 'Maria G Lopez',
          annual_salary: 100000,
          confidence: 0.9,
        },
      }),
    ]

    const errors = validateCrossDocuments(docs, { province: 'ON', offeredSalary: 100000 })
    expect(errors.filter(e => e.id === 'name_mismatch')).toHaveLength(0)
  })
})
