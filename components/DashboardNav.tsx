'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Props {
  user: { name?: string | null; email: string; firmName?: string | null }
}

export default function DashboardNav({ user }: Props) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">IF</span>
          </div>
          <span className="font-semibold text-gray-900">ImmigFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user.name ?? user.email}</div>
            {user.firmName && (
              <div className="text-xs text-gray-500">{user.firmName}</div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
