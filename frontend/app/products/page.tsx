'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { Product, PaginatedResponse, Category } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

const SORT_OPTIONS = [
  { value: 'default', label: '기본순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
  { value: 'new', label: '신상품순' },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') ?? '')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedId, setAddedId] = useState<number | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get<PaginatedResponse<Product>>('/products', {
        params: {
          category_id: categoryId || undefined,
          search: search || undefined,
          sort: sort !== 'default' ? sort : undefined,
          page,
        },
      })
      setProducts(data.data)
      setLastPage(data.last_page)
      setTotal(data.total)
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

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchProducts() }, [categoryId, search, sort, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleAddToCart = async (productId: number) => {
    if (!user) { window.location.href = '/login'; return }
    setAddingId(productId)
    try {
      await addItem(productId, 1)
      setAddedId(productId)
      setTimeout(() => setAddedId(null), 1500)
    } finally {
      setAddingId(null)
    }
  }

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'new') return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0)
    return 0
  })

  return (
    <div className="py-8">
      {/* ── 상단: 검색 + 필터 ── */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">전체 상품</h1>
            {!isLoading && (
              <p className="text-xs text-gray-400 mt-0.5">총 {total}개 상품</p>
            )}
          </div>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex gap-2 md:ml-auto">
            <div className="relative">
              <input
                className={`text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-56 focus:outline-none focus:border-gray-400 placeholder:text-gray-400 ${searchInput ? 'pr-16' : 'pr-9'}`}
                placeholder="상품 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="검색어 초기화"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* 정렬 */}
          <select
            className="text-sm border border-gray-200 rounded-full px-4 py-2 bg-white focus:outline-none focus:border-gray-400 text-gray-600 cursor-pointer"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* 활성 검색어 배지 */}
        {search && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">검색결과:</span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-gray-900 text-white pl-3 pr-2 py-1 rounded-full">
              {search}
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
                className="hover:opacity-70 transition-opacity"
                aria-label="검색 초기화"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}

        {/* 카테고리 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => { setCategoryId(''); setPage(1) }}
            className={`shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              categoryId === ''
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategoryId(String(cat.id)); setPage(1) }}
              className={`shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                categoryId === String(cat.id)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 상품 그리드 ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
              <div className="bg-gray-100 aspect-square" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg mb-2">상품이 없습니다.</p>
          <p className="text-gray-300 text-sm">다른 카테고리를 선택하거나 검색어를 변경해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {sorted.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              adding={addingId === product.id}
              added={addedId === product.id}
            />
          ))}
        </div>
      )}

      {/* ── 페이지네이션 ── */}
      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-1 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 transition-colors"
          >
            ‹
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

/* ── 상품 카드 컴포넌트 ── */
function ProductCard({
  product,
  onAddToCart,
  adding,
  added,
}: {
  product: Product
  onAddToCart: (id: number) => void
  adding: boolean
  added: boolean
}) {
  return (
    <div className="group flex flex-col">
      {/* 이미지 영역 */}
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden rounded-2xl bg-gray-50 aspect-square mb-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlaceholder />
          </div>
        )}

        {/* 배지들 (이미지 위에) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.is_new && (
            <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {product.discount_rate > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {product.discount_rate}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              품절
            </span>
          )}
        </div>

        {/* 장바구니 호버 버튼 (데스크탑) */}
        {product.stock > 0 && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product.id) }}
            disabled={adding}
            className="absolute bottom-0 left-0 right-0 bg-gray-900/90 hover:bg-gray-900 text-white text-xs font-semibold py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block"
          >
            {added ? '✓ 담겼습니다' : adding ? '추가 중...' : '장바구니 담기'}
          </button>
        )}
      </Link>

      {/* 텍스트 정보 */}
      <div className="flex-1 flex flex-col">
        {/* 카테고리 */}
        {product.category && (
          <p className="text-[11px] text-gray-400 mb-0.5">{product.category.name}</p>
        )}

        {/* 상품명 */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm text-gray-800 line-clamp-2 leading-snug mb-2 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* 가격 */}
        <div className="flex items-baseline gap-1.5 mb-3">
          {product.discount_rate > 0 && (
            <span className="text-sm font-bold text-orange-500">{product.discount_rate}%</span>
          )}
          <span className="text-base font-bold text-gray-900">
            {product.price.toLocaleString()}원
          </span>
          {product.original_price && (
            <span className="text-xs text-gray-400 line-through">
              {product.original_price.toLocaleString()}원
            </span>
          )}
        </div>

        {/* 재고 부족 표시 */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[11px] text-orange-500 mb-2">잔여 {product.stock}개</p>
        )}

        {/* 장바구니 버튼 (모바일 항상 노출) */}
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={adding || product.stock === 0}
          className={`md:hidden mt-auto w-full text-xs font-semibold py-2.5 rounded-xl transition-colors ${
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : added
              ? 'bg-green-500 text-white'
              : 'bg-gray-900 hover:bg-gray-700 text-white'
          }`}
        >
          {product.stock === 0 ? '품절' : added ? '✓ 담겼습니다' : adding ? '추가 중...' : '장바구니 담기'}
        </button>
      </div>
    </div>
  )
}

function ImagePlaceholder() {
  return (
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
