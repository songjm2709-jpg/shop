'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Order } from '@/types'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      router.push('/')
      return
    }

    api.post('/payments/confirm', {
      payment_key: paymentKey,
      order_id: Number(orderId),
      amount: Number(amount),
    })
      .then(({ data }) => setOrder(data.order))
      .catch((err) => setError(err.response?.data?.message ?? '결제 확인 중 오류가 발생했습니다.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="text-center py-20 text-gray-400">결제 확인 중...</div>

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="card">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">결제 실패</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/cart" className="btn-primary">장바구니로 돌아가기</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="card text-center mb-6">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">결제 완료</h1>
        <p className="text-gray-500">주문이 정상적으로 접수되었습니다.</p>
      </div>

      {order && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">주문 상세</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-500">
              <span>주문 번호</span><span className="font-medium text-gray-900">#{order.id}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>받는 분</span><span className="font-medium text-gray-900">{order.receiver_name}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>배송지</span><span className="font-medium text-gray-900">{order.shipping_address}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>결제 수단</span><span className="font-medium text-gray-900">{order.payment?.method}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                <span className="font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
            <span>총 결제 금액</span>
            <span className="text-blue-600">{order.total_amount.toLocaleString()}원</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/orders" className="btn-secondary flex-1 text-center py-3">주문 내역 보기</Link>
        <Link href="/products" className="btn-primary flex-1 text-center py-3">계속 쇼핑하기</Link>
      </div>
    </div>
  )
}
