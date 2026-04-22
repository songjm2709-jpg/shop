'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Order, PaginatedResponse } from '@/types'
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

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    api.get<PaginatedResponse<Order>>('/orders')
      .then(({ data }) => setOrders(data.data))
      .finally(() => setIsLoading(false))
  }, [user])

  if (isLoading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">주문 내역이 없습니다.</p>
          <Link href="/products" className="btn-primary">쇼핑 시작하기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-semibold">주문 #{order.id}</span>
                    <span className="text-gray-400 text-sm ml-3">
                      {new Date(order.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {order.items?.[0]?.product?.name}
                  {order.items?.length > 1 && ` 외 ${order.items.length - 1}건`}
                </p>

                <p className="font-bold text-blue-600">{order.total_amount.toLocaleString()}원</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
