'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Product } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    api.get<Product>(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return }
    setIsAdding(true)
    try {
      await addItem(product!.id, quantity)
      router.push('/cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) return <div className="text-center py-20 text-gray-400">로딩 중...</div>
  if (!product) return <div className="text-center py-20 text-gray-400">상품을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
        ← 뒤로
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-xl" />
          ) : (
            <span className="text-gray-400">이미지 없음</span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-blue-600 mb-2">{product.category?.name}</p>
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-4">{product.price.toLocaleString()}원</p>

          {product.description && (
            <p className="text-gray-500 text-sm mb-6">{product.description}</p>
          )}

          <p className="text-sm text-gray-400 mb-4">
            재고: {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium">수량</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  className="px-3 py-1 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >-</button>
                <span className="px-4 py-1 font-medium">{quantity}</span>
                <button
                  className="px-3 py-1 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >+</button>
              </div>
            </div>
          )}

          <button
            className="btn-primary w-full py-3 text-base"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
          >
            {product.stock === 0 ? '품절' : isAdding ? '추가 중...' : '장바구니 담기'}
          </button>
        </div>
      </div>
    </div>
  )
}
