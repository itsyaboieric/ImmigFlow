export interface ExtractedDoc {
  type: string
  data: Record<string, unknown>
  docId: string
  fileName: string
}

export interface ValidationError {
  id: string
  severity: 'error' | 'warning'
  field: string
  message: string
  documents: string[]
  resolution?: string
}

export interface FormFieldValue {
  value: string
  source: string
  confidence: number
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(val: unknown): Date | null {
  if (!val || typeof val !== 'string') return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function nameOverlap(a: string, b: string): number {
  const aParts = normalizeName(a).split(' ').filter(p => p.length > 1)
  const bParts = normalizeName(b).split(' ').filter(p => p.length > 1)
  const common = aParts.filter(p => bParts.some(bp => bp.includes(p) || p.includes(bp)))
  return common.length / Math.max(aParts.length, bParts.length, 1)
}

export function validateCrossDocuments(
  docs: ExtractedDoc[],
  caseInfo: {
    province?: string | null
    permitDuration?: number | null
    offeredSalary?: number | null
  }
): ValidationError[] {
  const errors: ValidationError[] = []

  // Collect names per document
  const namesByDoc: { docId: string; fileName: string; name: string }[] = []
  for (const doc of docs) {
    const nameKey =
      doc.type === 'PASSPORT'
        ? 'full_name'
        : doc.type === 'DIPLOMA'
        ? 'graduate_name'
        : doc.type === 'JOB_OFFER'
        ? 'applicant_name'
        : 'employee_name'
    const name = doc.data[nameKey]
    if (name && typeof name === 'string' && name.trim().length > 2) {
      namesByDoc.push({ docId: doc.docId, fileName: doc.fileName, name: name.trim() })
    }
  }

  // Check name consistency across all docs
  if (namesByDoc.length >= 2) {
    const base = namesByDoc[0]
    const mismatches = namesByDoc.slice(1).filter(d => nameOverlap(base.name, d.name) < 0.5)
    if (mismatches.length > 0) {
      errors.push({
        id: 'name_mismatch',
        severity: 'error',
        field: 'Applicant Name',
        message: `Name inconsistency across documents: ${namesByDoc
          .map(d => `"${d.name}" (${d.fileName})`)
          .join(' vs ')}`,
        documents: namesByDoc.map(d => d.docId),
        resolution:
          'Ensure all documents use the exact legal name as it appears on the passport.',
      })
    }
  }

  // Passport expiry checks
  const passport = docs.find(d => d.type === 'PASSPORT')
  if (passport) {
    const expiry = parseDate(passport.data.expiry_date as string)
    const today = new Date()

    if (expiry) {
      if (expiry <= today) {
        errors.push({
          id: 'passport_expired',
          severity: 'error',
          field: 'Passport Expiry',
          message: `Passport expired on ${passport.data.expiry_date}. A valid passport is required for all applications.`,
          documents: [passport.docId],
          resolution: 'Client must renew passport before this application can proceed.',
        })
      } else if (caseInfo.permitDuration) {
        const permitEnd = new Date()
        permitEnd.setMonth(permitEnd.getMonth() + caseInfo.permitDuration)
        const required = new Date(permitEnd)
        required.setMonth(required.getMonth() + 6)

        if (expiry < required) {
          errors.push({
            id: 'passport_expiry_too_soon',
            severity: 'error',
            field: 'Passport Expiry',
            message: `Passport expires ${passport.data.expiry_date}, but must remain valid until at least ${
              required.toISOString().split('T')[0]
            } (permit end + 6 months).`,
            documents: [passport.docId],
            resolution: 'Client must renew passport or reduce permit duration.',
          })
        }
      } else {
        // Warn if expiry within 12 months
        const oneYear = new Date()
        oneYear.setFullYear(oneYear.getFullYear() + 1)
        if (expiry <= oneYear) {
          errors.push({
            id: 'passport_expiry_soon',
            severity: 'warning',
            field: 'Passport Expiry',
            message: `Passport expires ${passport.data.expiry_date} — within 12 months. Confirm this covers the full permit period plus 6 months.`,
            documents: [passport.docId],
            resolution: 'Enter permit duration in the case to run a precise expiry check.',
          })
        }
      }
    }
  }

  // Wage check (simplified ESDC floor rates)
  // Uses extracted annual_salary from offer doc; falls back to caseInfo.offeredSalary entered manually
  const offerDoc = docs.find(d => d.type === 'JOB_OFFER' || d.type === 'EMPLOYMENT_LETTER')
  if (caseInfo.province) {
    const minAnnual: Record<string, number> = {
      ON: 17.2 * 40 * 52,
      BC: 17.4 * 40 * 52,
      AB: 15.0 * 40 * 52,
      QC: 15.25 * 40 * 52,
      SK: 14.0 * 40 * 52,
      MB: 15.3 * 40 * 52,
      NS: 15.0 * 40 * 52,
      NB: 14.75 * 40 * 52,
    }
    const floor = minAnnual[caseInfo.province] ?? 14.0 * 40 * 52
    const salary = (offerDoc?.data.annual_salary as number) || caseInfo.offeredSalary || 0
    const salarySource = offerDoc ? offerDoc.fileName : 'case details'
    const docIds = offerDoc ? [offerDoc.docId] : []

    if (salary > 0 && salary < floor) {
      errors.push({
        id: 'wage_below_floor',
        severity: 'error',
        field: 'Offered Wage',
        message: `Offered salary ($${salary.toLocaleString()}/yr from ${salarySource}) may be below minimum wage for ${
          caseInfo.province
        } (~$${Math.round(floor).toLocaleString()}/yr). ESDC requires the offered wage to meet or exceed the prevailing wage for the NOC code.`,
        documents: docIds,
        resolution:
          'Verify the offered wage against the ESDC Job Bank Wage Data for this NOC code and province.',
      })
    }
  }

  // Multiple employment letters warning
  const empDocs = docs.filter(d => d.type === 'EMPLOYMENT_LETTER')
  if (empDocs.length > 1) {
    errors.push({
      id: 'multiple_employment_letters',
      severity: 'warning',
      field: 'Employment History',
      message: `${empDocs.length} employment letters provided. Verify dates are sequential with no unexplained gaps.`,
      documents: empDocs.map(d => d.docId),
      resolution:
        'Confirm employment periods together cover the minimum required experience for this NOC code.',
    })
  }

  return errors
}

export function generateFormFieldMapping(
  docs: ExtractedDoc[]
): Record<string, FormFieldValue> {
  const mapping: Record<string, FormFieldValue> = {}

  const set = (
    label: string,
    value: unknown,
    fileName: string,
    confidence: number
  ) => {
    if (value && String(value).trim()) {
      mapping[label] = {
        value: String(value).trim(),
        source: fileName,
        confidence,
      }
    }
  }

  const passport = docs.find(d => d.type === 'PASSPORT')
  if (passport) {
    const c = (passport.data.confidence as number) ?? 0.9
    set('Family Name', passport.data.surname, passport.fileName, c)
    set('Given Name(s)', passport.data.given_names, passport.fileName, c)
    set('Date of Birth', passport.data.date_of_birth, passport.fileName, c)
    set('Passport Number', passport.data.passport_number, passport.fileName, c)
    set('Passport Expiry Date', passport.data.expiry_date, passport.fileName, c)
    set('Country of Citizenship', passport.data.issuing_country, passport.fileName, c)
    set('Nationality', passport.data.nationality, passport.fileName, c)
    set('Sex', passport.data.sex, passport.fileName, c)
    set('Place of Birth', passport.data.place_of_birth, passport.fileName, c)
  }

  const offer = docs.find(d => d.type === 'JOB_OFFER') ?? docs.find(d => d.type === 'EMPLOYMENT_LETTER')
  if (offer) {
    const c = (offer.data.confidence as number) ?? 0.88
    set('Employer Name', offer.data.employer_name, offer.fileName, c)
    set('Job Title / Position', offer.data.job_title, offer.fileName, c)
    set('NOC Code', offer.data.noc_code, offer.fileName, c)
    set('Work Location (City)', offer.data.work_location_city, offer.fileName, c)
    set('Work Location (Province)', offer.data.work_location_province, offer.fileName, c)
    const salary = offer.data.annual_salary
    if (salary && Number(salary) > 0) {
      set('Offered Annual Salary (CAD)', `$${Number(salary).toLocaleString()}`, offer.fileName, c)
    }
    set('Employment Start Date', offer.data.start_date ?? offer.data.employment_start_date, offer.fileName, c)
    set('Employment End Date', offer.data.end_date ?? offer.data.employment_end_date, offer.fileName, c)
  }

  const diploma = docs.find(d => d.type === 'DIPLOMA')
  if (diploma) {
    const c = (diploma.data.confidence as number) ?? 0.9
    set('Educational Institution', diploma.data.institution_name, diploma.fileName, c)
    set('Highest Credential', diploma.data.credential_name, diploma.fileName, c)
    set('Field of Study', diploma.data.field_of_study, diploma.fileName, c)
    set('Graduation Date', diploma.data.graduation_date, diploma.fileName, c)
  }

  return mapping
}
