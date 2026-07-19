import { Sidebar } from '@/components/Sidebar'
import { getThreads, getCredits } from './actions'

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const threads = await getThreads()
  const credits = await getCredits()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar threads={threads} credits={credits} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}
