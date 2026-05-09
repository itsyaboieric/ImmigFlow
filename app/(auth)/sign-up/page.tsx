'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignUpPage() {
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
    if (form.password !== form.confirm)              { setError('Passwords do not match.'); return }
    if (form.password.length < 8)                    { setError('Password must be at least 8 characters.'); return }
    if (!/[^a-zA-Z]/.test(form.password))            { setError('Password must contain at least one number or special character (e.g. TestPass1).'); return }

    setLoading(true)
    try {
      let res: Response
      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, firmName: form.firmName, password: form.password }),
        })
      } catch {
        setError('Network error. Check your connection and try again.')
        return
      }

      const raw = await res.text()
      let data: { error?: string } = {}
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as { error?: string }
        } catch {
          setError(
            `The server returned an unexpected response (HTTP ${res.status}). Check the terminal for errors or restart the dev server.`
          )
          return
        }
      }

      if (!res.ok) {
        let msg = data.error ?? `Registration failed (${res.status}).`
        if (msg === 'Registration failed. Check your details.') {
          msg =
            'Could not register. That email may already be in use — try signing in — or fix any invalid fields below.'
        }
        setError(msg)
        return
      }

      const emailNorm = form.email.toLowerCase().trim()
      try {
        const signInResult = await signIn('credentials', {
          email: emailNorm,
          password: form.password,
          redirect: false,
        })
        if (!signInResult?.ok || signInResult.error) {
          setError(
            'Your account was created, but automatic sign-in failed. Open Sign in and log in with the same email and password.'
          )
          return
        }
        window.location.href = '/dashboard'
      } catch {
        setError('Your account may have been created. Try signing in manually from the Sign in page.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
                <p className="text-xs text-gray-500 mt-1.5">
                  Use at least 8 characters and include a number or symbol (e.g. <span className="font-mono text-gray-600">SecurePass1</span>).
                </p>
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" required value={form.confirm} onChange={set('confirm')} className={inputClass} placeholder="Repeat your password" />
              </div>

              {error && (
                <div
                  role="alert"
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5 flex items-start gap-2"
                >
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
