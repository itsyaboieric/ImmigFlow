'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { APPLICATION_TYPE_LABELS, CASE_STATUS_LABELS, CASE_STATUS_COLORS, formatDate } from '@/lib/utils'

interface CaseDoc {
  id: string
  status: string
  documentType: string
}

interface Case {
  id: string
  title: string
  applicationType: string
  status: string
  clientName?: string
  employerName?: string
  province?: string
  createdAt: string
  updatedAt: string
  documents: CaseDoc[]
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(data => {
        setCases(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const stats = {
    total: cases.length,
    active: cases.filter(c => !['SIGNED_OFF', 'DRAFT'].includes(c.status)).length,
    signedOff: cases.filter(c => c.status === 'SIGNED_OFF').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading cases...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-500 text-sm mt-1">All your active and completed immigration files</p>
        </div>
        <Link
          href="/cases/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + New Case
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Cases', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Signed Off', value: stats.signedOff },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="font-semibold text-gray-900 mb-2">No cases yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Create your first case to start processing immigration files with AI.
          </p>
          <Link
            href="/cases/new"
            className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Create first case
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => {
            const extracted = c.documents.filter(d => d.status === 'EXTRACTED').length
            const total = c.documents.length
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          CASE_STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {CASE_STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{APPLICATION_TYPE_LABELS[c.applicationType] ?? c.applicationType}</span>
                      {c.clientName && <span>· {c.clientName}</span>}
                      {c.employerName && <span>· {c.employerName}</span>}
                      {c.province && <span>· {c.province}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs text-gray-500">
                      {total > 0 ? `${extracted}/${total} docs extracted` : 'No documents'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Updated {formatDate(c.updatedAt)}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
