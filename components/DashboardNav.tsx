'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Props {
  user: { name?: string | null; email: string; firmName?: string | null }
}

export default function DashboardNav({ user }: Props) {
  const initials = (user.name ?? user.email)
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white font-bold text-[9px] tracking-tight">IF</span>
          </div>
          <span className="font-semibold text-gray-900 text-[15px] tracking-tight">ImmigFlow</span>
        </Link>

        {/* Right: user + sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Avatar */}
            <div className="w-7 h-7 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-700 text-[10px] font-semibold">{initials}</span>
            </div>
            <div className="text-right leading-tight">
              <div className="text-[13px] font-medium text-gray-900 leading-none">{user.name ?? user.email}</div>
              {user.firmName && (
                <div className="text-[11px] text-gray-400 mt-0.5 leading-none">{user.firmName}</div>
              )}
            </div>
          </div>
          <div className="w-px h-4 bg-gray-200 hidden sm:block" />
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
