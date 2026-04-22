'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchCart()
  }, [user])

  if (isLoading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">장바구니가 비어있습니다.</p>
        <Link href="/products" className="btn-primary">쇼핑 계속하기</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">장바구니</h1>

      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div key={item.id} className="card flex items-center gap-4">
            <div className="bg-gray-100 rounded-lg w-20 h-20 flex-shrink-0 flex items-center justify-center">
              {item.product.image ? (
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-400 text-xs">이미지 없음</span>
              )}
            </div>

            <div className="flex-1">
              <Link href={`/products/${item.product.id}`} className="font-medium hover:text-blue-600">
                {item.product.name}
              </Link>
              <p className="text-blue-600 font-bold">{item.product.price.toLocaleString()}원</p>
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                className="px-3 py-1 hover:bg-gray-100"
                onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
              >-</button>
              <span className="px-4 py-1 font-medium">{item.quantity}</span>
              <button
                className="px-3 py-1 hover:bg-gray-100"
                onClick={() => updateItem(item.id, Math.min(item.product.stock, item.quantity + 1))}
              >+</button>
            </div>

            <p className="font-bold w-28 text-right">
              {(item.product.price * item.quantity).toLocaleString()}원
            </p>

            <button
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>총 금액</span>
          <span className="text-blue-600">{cart.total.toLocaleString()}원</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full text-center block py-3 text-base">
          주문하기
        </Link>
      </div>
    </div>
  )
}
