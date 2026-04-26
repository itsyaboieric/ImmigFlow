import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'ImmigFlow — AI back-office for immigration consultants',
  description:
    'ImmigFlow reads client documents, fills government forms, and assembles LMIA and work permit application packages — so RCICs can handle twice the caseload.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
