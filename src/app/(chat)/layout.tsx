import { Sidebar } from '@/components/Sidebar'
import { getThreads } from './actions'

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const threads = await getThreads()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar threads={threads} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}
