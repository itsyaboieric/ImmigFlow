import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { loadCaseDetailView } from '@/lib/server/load-case-detail'
import CaseDetailClient from '@/components/cases/CaseDetailClient'

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/sign-in')

  const initialCase = await loadCaseDetailView(params.id, session.user.id)
  if (!initialCase) notFound()

  return <CaseDetailClient initialCase={initialCase} />
}
