export interface ChecklistItem {
  id: string
  label: string
  documentType: string
  required: boolean
  notes?: string
}

export function generateChecklist(
  applicationType: string,
  province?: string | null,
  nationality?: string | null
): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: 'passport',
      label: 'Valid Passport',
      documentType: 'PASSPORT',
      required: true,
      notes: 'Must be valid for at least 6 months beyond the permit end date',
    },
  ]

  if (applicationType === 'LMIA_HIGH_WAGE' || applicationType === 'LMIA_LOW_WAGE') {
    items.push(
      {
        id: 'job_offer',
        label: 'Signed Job Offer Letter',
        documentType: 'JOB_OFFER',
        required: true,
        notes: 'Must include position, wage, hours, start date, and NOC code',
      },
      {
        id: 'business_reg',
        label: 'Business Registration Certificate',
        documentType: 'BUSINESS_REG',
        required: true,
        notes: 'Must be registered in Canada and in good standing',
      },
      {
        id: 'pay_stub',
        label: 'Recent Pay Stubs (3 months)',
        documentType: 'PAY_STUB',
        required: true,
        notes: 'To verify current employment and payroll capacity',
      },
      {
        id: 'employment_letter',
        label: 'Employment Reference Letter(s)',
        documentType: 'EMPLOYMENT_LETTER',
        required: applicationType === 'LMIA_HIGH_WAGE',
        notes: 'Covering minimum required work experience for this NOC code',
      }
    )

    if (applicationType === 'LMIA_HIGH_WAGE') {
      items.push({
        id: 'diploma',
        label: 'Educational Credentials',
        documentType: 'DIPLOMA',
        required: false,
        notes: 'Required for regulated professions or senior NOC positions',
      })
    }
  }

  if (applicationType === 'WORK_PERMIT') {
    items.push(
      {
        id: 'job_offer',
        label: 'Job Offer Letter / LMIA Confirmation',
        documentType: 'JOB_OFFER',
        required: true,
        notes: 'Must include LMIA number or LMIA exemption code',
      },
      {
        id: 'employment_letter',
        label: 'Employment Reference Letter(s)',
        documentType: 'EMPLOYMENT_LETTER',
        required: true,
        notes: 'Supporting work history documentation for this NOC',
      }
    )
  }

  if (province === 'BC') {
    items.push({
      id: 'bc_employer_reg',
      label: 'BC Employer Registration (WorkBC)',
      documentType: 'BUSINESS_REG',
      required: true,
      notes: 'BC employers must be registered with WorkBC for LMIA positions',
    })
  }

  const biometricExempt = ['united states', 'usa', 'us citizen', 'american']
  const nat = (nationality ?? '').toLowerCase()
  if (nationality && !biometricExempt.some(e => nat.includes(e))) {
    items.push({
      id: 'biometrics',
      label: 'Biometrics Confirmation',
      documentType: 'OTHER',
      required: false,
      notes: 'Biometrics collection may be required — verify at time of application',
    })
  }

  return items
}

export function getChecklistProgress(
  checklist: ChecklistItem[],
  uploadedDocTypes: string[]
): { completed: number; total: number; percentage: number } {
  const required = checklist.filter(item => item.required)
  const completed = required.filter(item => uploadedDocTypes.includes(item.documentType)).length
  return {
    completed,
    total: required.length,
    percentage: required.length > 0 ? Math.round((completed / required.length) * 100) : 0,
  }
}
