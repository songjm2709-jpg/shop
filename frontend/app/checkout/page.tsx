'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import api from '@/lib/api'
import { Order } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: Record<string, unknown>) => Promise<void>
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const [form, setForm] = useState({
    receiver_name: '',
    receiver_phone: '',
    shipping_address: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchCart()
    if (user) {
      setForm((f) => ({
        ...f,
        receiver_name: user.name,
        receiver_phone: user.phone ?? '',
        shipping_address: user.address ?? '',
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart || cart.items.length === 0) {
      setError('장바구니가 비어있습니다.')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      // 1. 주문 생성
      const { data: order } = await api.post<Order>('/orders', form)

      // 2. 토스페이먼츠 결제창 호출
      const toss = window.TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      await toss.requestPayment('카드', {
        amount: order.total_amount,
        orderId: String(order.id).padStart(6, '0'),
        orderName: cart.items[0].product.name + (cart.items.length > 1 ? ` 외 ${cart.items.length - 1}건` : ''),
        customerName: form.receiver_name,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setError(error.response?.data?.message ?? error.message ?? '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!cart) return <div className="text-center py-20 text-gray-400">로딩 중...</div>

  return (
    <>
      <Script src="https://js.tosspayments.com/v1" />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">주문 / 결제</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-4">배송 정보</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">받는 분</label>
                  <input
                    className="input"
                    value={form.receiver_name}
                    onChange={(e) => setForm({ ...form, receiver_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                  <input
                    className="input"
                    placeholder="010-0000-0000"
                    value={form.receiver_phone}
                    onChange={(e) => setForm({ ...form, receiver_phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배송 주소</label>
                  <input
                    className="input"
                    value={form.shipping_address}
                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={isLoading}>
              {isLoading ? '처리 중...' : `${cart.total.toLocaleString()}원 결제하기`}
            </button>
          </form>

          {/* 주문 요약 */}
          <div className="card h-fit">
            <h2 className="font-semibold mb-4">주문 요약</h2>
            <div className="space-y-2 text-sm mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600 truncate mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    {(item.product.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
              <span>합계</span>
              <span className="text-blue-600">{cart.total.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
