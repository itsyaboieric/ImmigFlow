'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PROVINCES } from '@/lib/utils'

const APPLICATION_TYPES = [
  {
    value: 'LMIA_HIGH_WAGE',
    label: 'LMIA — High Wage Position',
    desc: 'For positions at or above the provincial median hourly wage. Typically NOC TEER 0–3.',
  },
  {
    value: 'LMIA_LOW_WAGE',
    label: 'LMIA — Low Wage Position',
    desc: 'For positions below the provincial median hourly wage. Typically NOC TEER 4–5.',
  },
  {
    value: 'WORK_PERMIT',
    label: 'Employer-Specific Work Permit',
    desc: 'Work permit tied to a specific employer, using a valid LMIA or exemption.',
  },
]

export default function NewCasePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    applicationType: '',
    title: '',
    clientName: '',
    nationality: '',
    employerName: '',
    province: '',
    nocCode: '',
    permitDuration: '',
    offeredSalary: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setError('')
    if (!form.title) {
      setError('Please provide a case title.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? 'Failed to create case.')
    } else {
      router.push(`/cases/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Cases
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-medium">New Case</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step >= s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Application Type' : 'Case Details'}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Select Application Type</h2>
            <p className="text-gray-500 text-sm mb-6">
              This determines the document checklist and validation rules for this case.
            </p>

            <div className="space-y-3">
              {APPLICATION_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => set('applicationType', type.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    form.applicationType === type.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{type.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => form.applicationType && setStep(2)}
              disabled={!form.applicationType}
              className="mt-6 w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Case Details</h2>
            <p className="text-gray-500 text-sm mb-6">
              These details shape the document checklist and enable precise validation checks.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g., Smith / ABC Corp — LMIA 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={e => set('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Nationality</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={e => set('nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="India, Philippines, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
                  <input
                    type="text"
                    value={form.employerName}
                    onChange={e => set('employerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="ABC Corporation Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <select
                    value={form.province}
                    onChange={e => set('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map(p => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NOC Code</label>
                  <input
                    type="text"
                    value={form.nocCode}
                    onChange={e => set('nocCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. 21232"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permit Duration (months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.permitDuration}
                    onChange={e => set('permitDuration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offered Salary (CAD/yr)</label>
                  <input
                    type="number"
                    value={form.offeredSalary}
                    onChange={e => set('offeredSalary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="65000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (internal)</label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Any relevant context for this case..."
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
