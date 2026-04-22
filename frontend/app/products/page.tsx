'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Product, PaginatedResponse, Category } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export default function ProductsPage() {
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [addingId, setAddingId] = useState<number | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get<PaginatedResponse<Product>>('/products', {
        params: { category_id: categoryId || undefined, search: search || undefined, page },
      })
      setProducts(data.data)
      setLastPage(data.last_page)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await api.get<{ data: Category[] }>('/categories')
      setCategories(data.data ?? data)
    } catch {}
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [categoryId, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setAddingId(productId)
    try {
      await addItem(productId, 1)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">상품 목록</h1>

      {/* 검색 & 필터 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="input w-64"
            placeholder="상품 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary">검색</button>
        </form>

        <select
          className="input w-40"
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* 상품 그리드 */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">상품이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card p-4 flex flex-col">
              <Link href={`/products/${product.id}`}>
                <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-3">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-gray-400 text-sm">이미지 없음</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-blue-600 font-bold mb-1">{product.price.toLocaleString()}원</p>
                <p className="text-xs text-gray-400 mb-3">재고: {product.stock}개</p>
              </Link>
              <button
                className="btn-primary w-full text-sm mt-auto"
                onClick={() => handleAddToCart(product.id)}
                disabled={addingId === product.id || product.stock === 0}
              >
                {product.stock === 0 ? '품절' : addingId === product.id ? '추가 중...' : '장바구니 담기'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={p === page ? 'btn-primary' : 'btn-secondary'}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
