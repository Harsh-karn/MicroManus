'use client'

export function LogoutButton() {
  return (
    <button 
      onClick={async () => {
        const { signOut } = await import('@/app/(chat)/actions')
        await signOut()
      }} 
      className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
    >
      Log Out
    </button>
  )
}
