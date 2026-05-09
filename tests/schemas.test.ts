import { describe, expect, it } from 'vitest'
import { RegisterSchema, CreateCaseSchema, UpdateCaseSchema, DocumentTypeSchema } from '@/lib/schemas'

describe('RegisterSchema', () => {
  const valid = { name: 'Jane Doe', email: 'jane@firm.ca', password: 'securePass1' }

  it('accepts a valid payload', () => expect(RegisterSchema.safeParse(valid).success).toBe(true))

  it('rejects password shorter than 8 chars', () =>
    expect(RegisterSchema.safeParse({ ...valid, password: 'abc123' }).success).toBe(false))

  it('rejects password with no non-letter character', () =>
    expect(RegisterSchema.safeParse({ ...valid, password: 'abcdefgh' }).success).toBe(false))

  it('rejects invalid email', () =>
    expect(RegisterSchema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false))

  it('rejects unexpected extra fields (.strict)', () =>
    expect(RegisterSchema.safeParse({ ...valid, role: 'admin' }).success).toBe(false))

  it('rejects name longer than 100 chars', () =>
    expect(RegisterSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false))
})

describe('CreateCaseSchema', () => {
  const valid = { title: 'Smith / ABC Corp', applicationType: 'LMIA_HIGH_WAGE' }

  it('accepts minimal valid case', () => expect(CreateCaseSchema.safeParse(valid).success).toBe(true))

  it('rejects unknown applicationType', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, applicationType: 'INVALID' }).success).toBe(false))

  it('rejects invalid province code', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, province: 'XX' }).success).toBe(false))

  it('accepts valid province code', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, province: 'ON' }).success).toBe(true))

  it('treats empty province as absent', () => {
    const r = CreateCaseSchema.safeParse({ ...valid, province: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.province).toBeUndefined()
  })

  it('rejects permitDuration above 60', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, permitDuration: 61 }).success).toBe(false))

  it('coerces string permitDuration to number', () => {
    const r = CreateCaseSchema.safeParse({ ...valid, permitDuration: '24' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.permitDuration).toBe(24)
  })

  it('treats empty string permitDuration as absent', () => {
    const r = CreateCaseSchema.safeParse({ ...valid, permitDuration: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.permitDuration).toBeUndefined()
  })

  it('rejects invalid NOC code format', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, nocCode: 'AB123' }).success).toBe(false))

  it('accepts 5-digit NOC code', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, nocCode: '21232' }).success).toBe(true))

  it('rejects unexpected extra fields', () =>
    expect(CreateCaseSchema.safeParse({ ...valid, userId: 'hacked' }).success).toBe(false))
})

describe('DocumentTypeSchema', () => {
  it('accepts known types', () => {
    expect(DocumentTypeSchema.safeParse('PASSPORT').success).toBe(true)
    expect(DocumentTypeSchema.safeParse('JOB_OFFER').success).toBe(true)
  })
  it('rejects unknown types', () => {
    expect(DocumentTypeSchema.safeParse('EVIL_PROMPT').success).toBe(false)
    expect(DocumentTypeSchema.safeParse('').success).toBe(false)
  })
})
