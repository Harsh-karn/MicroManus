import { getStats } from './actions'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'

export default async function StatsPage() {
  const stats = await getStats()

  return (
    <div className="min-h-screen p-4 md:p-8 bg-zinc-50 flex justify-center relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <LogoutButton />
      </div>
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-8 md:p-10 h-fit mt-16 md:mt-12">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-zinc-100">
          <Link href="/" className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 hover:bg-zinc-100 rounded-xl">
            <ArrowLeftIcon size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Usage & Cost Stats</h2>
            <p className="text-sm font-medium text-zinc-500 mt-1">Review your token consumption and estimated costs.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Chat Title
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Input Tokens
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Output Tokens
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Cache Tokens
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Cost (USD)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {stats.map((stat) => (
                <tr key={stat.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 truncate max-w-xs">
                    {stat.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-500">
                    {new Date(stat.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-500">
                    {stat.total_input_tokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-500">
                    {stat.total_output_tokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-500">
                    {stat.total_cache_tokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                    ${stat.total_cost.toFixed(6)}
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-zinc-500">
                    No chats found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
