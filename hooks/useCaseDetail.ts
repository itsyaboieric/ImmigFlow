'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CaseDetailView } from '@/components/cases/types'

export function useCaseDetail(caseId: string, initialCase: CaseDetailView) {
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseDetailView>(initialCase)

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cases/${caseId}`)
    if (res.ok) {
      const data = (await res.json()) as CaseDetailView
      setCaseData(data)
    } else if (res.status === 404) {
      router.push('/dashboard')
    }
  }, [caseId, router])

  return { caseData, setCaseData, refresh }
}
