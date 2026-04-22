'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Order } from '@/types'
import { useAuthStore } from '@/store/auth'

const STATUS_LABEL: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    api.get<Order>(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .finally(() => setIsLoading(false))
  }, [id, user])

  if (isLoading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>
  if (!order) return <div className="text-center py-20 text-gray-400">주문을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mb-6">
        ← 뒤로
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">주문 #{order.id}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h2 className="font-semibold mb-3">배송 정보</h2>
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>받는 분</span><span className="text-gray-900 font-medium">{order.receiver_name}</span>
            </div>
            <div className="flex justify-between">
              <span>연락처</span><span className="text-gray-900 font-medium">{order.receiver_phone}</span>
            </div>
            <div className="flex justify-between">
              <span>배송지</span><span className="text-gray-900 font-medium">{order.shipping_address}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">주문 상품</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-lg w-14 h-14 flex-shrink-0 flex items-center justify-center">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-gray-400 text-xs">없음</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-gray-500 text-xs">{item.price.toLocaleString()}원 × {item.quantity}개</p>
                </div>
                <p className="font-bold">{(item.price * item.quantity).toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </div>

        {order.payment && (
          <div className="card">
            <h2 className="font-semibold mb-3">결제 정보</h2>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>결제 수단</span><span className="text-gray-900 font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span>결제 상태</span>
                <span className="text-gray-900 font-medium">
                  {order.payment.status === 'done' ? '결제 완료' : order.payment.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="card flex justify-between items-center">
          <span className="font-semibold">총 결제 금액</span>
          <span className="text-xl font-bold text-blue-600">{order.total_amount.toLocaleString()}원</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/orders" className="btn-secondary flex-1 text-center py-3">주문 목록</Link>
        <Link href="/products" className="btn-primary flex-1 text-center py-3">쇼핑 계속하기</Link>
      </div>
    </div>
  )
}
