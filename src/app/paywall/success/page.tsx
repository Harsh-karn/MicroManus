'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaywallSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after a few seconds
    const timeout = setTimeout(() => {
      router.push('/')
    }, 3000)
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="rounded-xl bg-white p-8 text-center shadow-xl">
        <h2 className="text-3xl font-extrabold text-green-600">Payment Successful!</h2>
        <p className="mt-4 text-gray-600">You now have 5 credits.</p>
        <p className="mt-2 text-sm text-gray-500">Redirecting to chat...</p>
      </div>
    </div>
  )
}
