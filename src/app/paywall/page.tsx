'use client'

import { useState } from 'react'
import { createCheckoutSession } from './actions'
import { LogoutButton } from '@/components/LogoutButton'
import { useRouter } from 'next/navigation'

export default function PaywallPage() {
  const [loading, setLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const router = useRouter()

  const handleApplyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setCouponError('')
    
    const formData = new FormData(e.currentTarget)
    const code = formData.get('code')

    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setCouponError(data.error || 'Unknown error')
        setLoading(false)
      } else {
        // Success — redirect to home
        router.push('/')
      }
    } catch (err: any) {
      setCouponError(`Network error: ${err.message}`)
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    const result = await createCheckoutSession()
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 relative px-4">
      <div className="absolute top-8 right-8">
        <LogoutButton />
      </div>
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 mt-12">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl mb-6 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
            <span className="text-white font-bold text-xl font-serif">M</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Unlock MicroManus
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            You need credits to start researching. Get 5 credits for $5.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? 'Processing...' : 'Pay $5.00 via Stripe'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium">
              <span className="bg-white px-4 text-zinc-400">Or use a coupon</span>
            </div>
          </div>

          <form onSubmit={handleApplyCoupon} className="space-y-4">
            <div>
              <label htmlFor="code" className="sr-only">
                Coupon Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="relative block w-full rounded-xl border-0 py-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 bg-zinc-50/50"
                placeholder="Enter coupon code"
              />
            </div>
            {couponError && (
              <p className="text-sm font-medium text-red-500 text-center">{couponError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 transition-all active:scale-95"
            >
              Apply Coupon
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
