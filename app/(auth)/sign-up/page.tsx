'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', firmName: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, firmName: form.firmName, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Registration failed.'); setLoading(false); return }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-gray-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-[9px]">IF</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">ImmigFlow</span>
        </Link>
        <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          Sign in →
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1.5">Start processing immigration files with AI</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Your Name</label>
                <input type="text" required value={form.name} onChange={set('name')} className={inputClass} placeholder="Jane Smith, RCIC" />
              </div>
              <div>
                <label className={labelClass}>Firm Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={form.firmName} onChange={set('firmName')} className={inputClass} placeholder="Smith Immigration Consulting" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" required value={form.email} onChange={set('email')} className={inputClass} placeholder="you@yourfirm.ca" />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" required value={form.password} onChange={set('password')} className={inputClass} placeholder="At least 8 characters" />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" required value={form.confirm} onChange={set('confirm')} className={inputClass} placeholder="Repeat your password" />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                    <circle cx="7" cy="7" r="6.5" stroke="#ef4444"/>
                    <path d="M7 4v3.5M7 9.5v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-brand-600 hover:text-brand-700 font-medium">Sign in</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4 px-4 leading-relaxed">
            ImmigFlow does not provide immigration advice. All AI outputs require
            review and sign-off by a licensed RCIC before submission to IRCC.
          </p>
        </div>
      </div>
    </div>
  )
}
