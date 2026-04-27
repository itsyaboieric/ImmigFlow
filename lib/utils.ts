export const APPLICATION_TYPE_LABELS: Record<string, string> = {
  LMIA_HIGH_WAGE: 'LMIA — High Wage Position',
  LMIA_LOW_WAGE: 'LMIA — Low Wage Position',
  WORK_PERMIT: 'Employer-Specific Work Permit',
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PASSPORT: 'Passport',
  EMPLOYMENT_LETTER: 'Employment Reference Letter',
  JOB_OFFER: 'Job Offer Letter',
  DIPLOMA: 'Diploma / Degree / Certificate',
  PAY_STUB: 'Pay Stub',
  BUSINESS_REG: 'Business Registration',
  OTHER: 'Other Document',
}

export const CASE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  DOCUMENTS_PENDING: 'Documents Pending',
  REVIEW: 'Ready for Review',
  SIGNED_OFF: 'Signed Off',
}

export const CASE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  DOCUMENTS_PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEW: 'bg-indigo-100 text-indigo-800',
  SIGNED_OFF: 'bg-green-100 text-green-800',
}

export const DOC_STATUS_COLORS: Record<string, string> = {
  UPLOADED: 'bg-gray-100 text-gray-600',
  PROCESSING: 'bg-blue-100 text-blue-700',
  EXTRACTED: 'bg-green-100 text-green-700',
  ERROR: 'bg-red-100 text-red-700',
}

export const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
]

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-700'
  if (confidence >= 0.75) return 'text-yellow-700'
  return 'text-red-600'
}

export function confidenceBg(confidence: number): string {
  if (confidence >= 0.9) return 'bg-green-50 border-green-200'
  if (confidence >= 0.75) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}
