'use client'

import { useState } from 'react'
import { applyCoupon, createCheckoutSession } from './actions'
import { LogoutButton } from '@/components/LogoutButton'

export default function PaywallPage() {
  const [loading, setLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const handleApplyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setCouponError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await applyCoupon(formData)
    
    if (result?.error) {
      setCouponError(result.error)
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 relative">
      <div className="absolute top-8 right-8">
        <LogoutButton />
      </div>
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-xl mt-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Unlock MicroManus
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You need credits to start researching. Get 5 credits for $5.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay $5.00 via Stripe'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or use a coupon</span>
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
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Enter coupon code"
              />
            </div>
            {couponError && (
              <p className="text-sm text-red-600">{couponError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Apply Coupon
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
