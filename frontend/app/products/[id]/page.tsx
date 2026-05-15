'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Product, Coupon } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

type Tab = '상품설명' | '상품정보' | '리뷰' | 'Q&A'

const DUMMY_REVIEWS = [
  { id: 1,  name: '김*연', rating: 5, date: '2025-04-28', title: '너무 좋아요!', body: '피부에 바르는 순간 촉촉하게 스며들어요. 향도 은은하고 자극 없이 잘 맞아서 재구매 의사 100%입니다. 가족들한테도 추천했어요.', verified: true,  helpful: 24, images: true },
  { id: 2,  name: '이*준', rating: 4, date: '2025-04-21', title: '무난하게 좋은 제품', body: '배송도 빠르고 제품 퀄리티도 기대 이상이었어요. 다만 용량이 조금 더 많았으면 하는 아쉬움이 있습니다. 전반적으로 만족합니다.', verified: true,  helpful: 11, images: false },
  { id: 3,  name: '박*희', rating: 5, date: '2025-04-18', title: '지인 추천받고 샀는데 역시!', body: '친구가 극찬해서 반신반의하며 구매했는데 정말 대박이에요. 아침에 바르면 하루 종일 피부가 촉촉하게 유지됩니다. 앞으로 쭉 쓸 것 같아요.', verified: true,  helpful: 38, images: true },
  { id: 4,  name: '최*수', rating: 3, date: '2025-04-11', title: '보통이에요', body: '가격 대비 평범한 것 같아요. 기대를 너무 높게 했나봐요. 피부 트러블은 없고 무난하게 쓸 수 있는 제품입니다.', verified: false, helpful: 5,  images: false },
  { id: 5,  name: '정*아', rating: 5, date: '2025-04-07', title: '민감성 피부에도 OK', body: '민감성 피부라 제품 고를 때 항상 조심스러웠는데 이건 정말 순해요. 자극도 없고 흡수도 빠르고 최고입니다. 세트로 추가 구매할 예정이에요.', verified: true,  helpful: 47, images: true },
  { id: 6,  name: '강*민', rating: 4, date: '2025-03-30', title: '재구매했어요', body: '처음 써보고 좋아서 두 번째 구매입니다. 꾸준히 쓰니까 피부 톤이 밝아진 것 같아요. 남자도 쓰기 좋은 제품이에요.', verified: true,  helpful: 19, images: false },
  { id: 7,  name: '윤*경', rating: 5, date: '2025-03-22', title: '선물용으로도 완벽', body: '어머니 생신 선물로 구매했는데 포장도 예쁘고 제품도 고급스러워서 너무 만족하셨어요. 나중에 저도 사려고요!', verified: true,  helpful: 33, images: true },
  { id: 8,  name: '임*호', rating: 4, date: '2025-03-15', title: '가성비 좋아요', body: '이 가격에 이 퀄리티면 정말 갑이죠. 다른 브랜드 대비 성분도 좋고 체감 효과도 확실히 있어요. 추천합니다.', verified: true,  helpful: 14, images: false },
  { id: 9,  name: '신*빈', rating: 2, date: '2025-03-08', title: '저한테는 안 맞았어요', body: '사람마다 피부가 다르니까요. 저는 조금 무겁게 느껴져서 아침에 쓰기가 불편했어요. 밤용으로는 괜찮을 것 같아요.', verified: true,  helpful: 8,  images: false },
  { id: 10, name: '한*진', rating: 5, date: '2025-03-01', title: '역대급 보습력', body: '건성 피부인데 이거 바르면 다음날 아침에도 촉촉해요. 환절기에 특히 효과가 좋은 것 같아요. 세트 구성으로 사면 더 저렴하니 세트 추천드려요.', verified: true,  helpful: 56, images: true },
  { id: 11, name: '오*현', rating: 4, date: '2025-02-22', title: '가볍고 촉촉해요', body: '오일리한 제품 싫어하는데 이건 발림성이 너무 가벼워서 좋아요. 남기는 느낌 없이 쫙 흡수되고 촉촉함 오래 유지됩니다.', verified: false, helpful: 21, images: false },
  { id: 12, name: '배*린', rating: 5, date: '2025-02-14', title: '기대 이상이에요', body: '솔직히 광고 보고 기대 안 했는데 써보니까 진짜 달라요. 일주일 쓰고 나서 피부 결이 눈에 띄게 좋아졌어요. 강력 추천합니다!', verified: true,  helpful: 42, images: true },
]

const REVIEW_TOTAL   = DUMMY_REVIEWS.length
const REVIEW_AVG     = +(DUMMY_REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEW_TOTAL).toFixed(1)
const REVIEW_DIST    = [5,4,3,2,1].map(star => ({
  star,
  pct: Math.round(DUMMY_REVIEWS.filter(r => r.rating === star).length / REVIEW_TOTAL * 100),
}))

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState<Tab>('상품설명')
  const [downloaded, setDownloaded] = useState<number[]>([])

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      api.get<Product>(`/products/${id}`),
      api.get<Coupon[]>('/coupons'),
    ]).then(([{ data: prod }, { data: coup }]) => {
      setProduct(prod)
      setCoupons(coup)
      api.get('/products', { params: { category_id: prod.category_id } })
        .then(({ data }: any) =>
          setRelated((data.data ?? []).filter((p: Product) => p.id !== prod.id).slice(0, 4))
        ).catch(() => {})
    }).finally(() => setIsLoading(false))
  }, [id])

  const bestCoupon = coupons.reduce<Coupon | null>((max, c) => (!max || c.amount > max.amount ? c : max), null)
  const couponPrice = product && bestCoupon ? product.price - bestCoupon.amount : null
  const totalPrice = product ? product.price * quantity : 0
  const freeShipping = product ? product.price >= 30000 : false

  const handleCart = async () => {
    if (!user) { router.push('/login'); return }
    setIsAdding(true)
    try {
      await addItem(product!.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally { setIsAdding(false) }
  }

  const handleBuy = async () => {
    if (!user) { router.push('/login'); return }
    setIsAdding(true)
    try { await addItem(product!.id, quantity); router.push('/cart') }
    finally { setIsAdding(false) }
  }

  const downloadCoupon = (couponId: number) =>
    setDownloaded(prev => prev.includes(couponId) ? prev : [...prev, couponId])

  /* ── 로딩 스켈레톤 ── */
  if (isLoading) return (
    <div className="py-8 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-56 mb-6" />
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl">
        <div className="bg-gray-100 rounded-2xl aspect-square" />
        <div className="space-y-4 pt-2">
          {[3, 2, 1, 4, 3, 2].map((w, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${w * 20}%` }} />
          ))}
          <div className="h-28 bg-gray-100 rounded-2xl mt-4" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-24">
      <p className="text-gray-400 mb-3">상품을 찾을 수 없습니다.</p>
      <Link href="/products" className="text-sm text-orange-500 hover:underline">← 목록으로</Link>
    </div>
  )

  return (
    <div className="py-8 pb-20">

      {/* ── 브레드크럼 ── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-gray-700 transition-colors">홈</Link>
        <span>›</span>
        <Link href="/products" className="hover:text-gray-700 transition-colors">전체 상품</Link>
        {product.category && (
          <>
            <span>›</span>
            <Link href={`/products?category_id=${product.category_id}`} className="hover:text-gray-700 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-600 max-w-[180px] truncate">{product.name}</span>
      </nav>

      {/* ── 상단: 이미지 + 정보 ── */}
      <div className="grid md:grid-cols-[480px_1fr] gap-10 max-w-5xl mb-16">

        {/* ── 좌: 이미지 갤러리 ── */}
        <div>
          <div className="bg-gray-50 rounded-2xl aspect-square overflow-hidden border border-gray-100 mb-3 relative group">
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              : <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
            }
            {product.is_new && (
              <span className="absolute top-3 left-3 bg-pink-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">NEW</span>
            )}
            {product.discount_rate > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                {product.discount_rate}% OFF
              </span>
            )}
          </div>
          {/* 썸네일 */}
          {product.image && (
            <div className="flex gap-2">
              {[0, 1].map((i) => (
                <div key={i} className={`w-16 h-16 rounded-xl overflow-hidden bg-gray-50 cursor-pointer border-2 transition-colors ${i === 0 ? 'border-gray-800' : 'border-gray-200 hover:border-gray-400'}`}>
                  <img src={product.image!} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 우: 상품 정보 ── */}
        <div className="flex flex-col">

          {/* 카테고리 + 상품명 */}
          {product.category && (
            <p className="text-xs text-gray-400 mb-1">{product.category.name}</p>
          )}
          <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">{product.name}</h1>

          {/* 별점 */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">{REVIEW_AVG} · 리뷰 {REVIEW_TOTAL}개</span>
          </div>

          {/* 가격 정보 테이블 */}
          <div className="space-y-3 mb-5">

            {/* 정가 / 판매가 */}
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-400 w-16 pt-1 shrink-0">판매가</span>
              <div>
                {product.original_price && (
                  <p className="text-xs text-gray-400 line-through leading-none mb-1">
                    {product.original_price.toLocaleString()}원
                  </p>
                )}
                <div className="flex items-baseline gap-1.5">
                  {product.discount_rate > 0 && (
                    <span className="text-xl font-bold text-red-500">{product.discount_rate}%</span>
                  )}
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 쿠폰 할인가 */}
            {couponPrice !== null && couponPrice > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 shrink-0">쿠폰가</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-orange-500">
                    {couponPrice.toLocaleString()}원
                  </span>
                  <span className="text-xs text-gray-400">최대 쿠폰 적용 시</span>
                </div>
              </div>
            )}

            {/* 배송 */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-16 shrink-0">배송</span>
              {freeShipping
                ? <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">무료배송</span>
                : <span className="text-xs text-gray-700">3,000원 <span className="text-gray-400 ml-1">· 30,000원 이상 무료</span></span>
              }
            </div>

            {/* 적립금 */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-16 shrink-0">적립금</span>
              <span className="text-xs text-gray-700">
                {Math.floor(product.price * 0.01).toLocaleString()}원
                <span className="text-gray-400 ml-1">구매금액의 1%</span>
              </span>
            </div>
          </div>

          {/* ── 쿠폰 ── */}
          {coupons.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 mb-2">사용 가능 쿠폰</p>
              <div className="space-y-2">
                {coupons.slice(0, 2).map((coupon) => {
                  const isDone = downloaded.includes(coupon.id)
                  return (
                    <div key={coupon.id} className="flex items-center gap-3 bg-orange-50 border border-dashed border-orange-200 rounded-xl px-3 py-2.5">
                      {/* 쿠폰 금액 원 */}
                      <div className="w-11 h-11 bg-orange-500 rounded-full flex flex-col items-center justify-center shrink-0 leading-tight">
                        <span className="text-white text-[11px] font-bold">{(coupon.amount / 1000).toFixed(0)}천</span>
                        <span className="text-white text-[10px]">원</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">{coupon.type}</span>
                          <span className="text-[10px] text-gray-400 font-medium">D-{coupon.d_day}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800">추가 {coupon.amount.toLocaleString()}원 할인</p>
                        <p className="text-[10px] text-gray-400 truncate">{coupon.name}</p>
                      </div>
                      <button
                        onClick={() => downloadCoupon(coupon.id)}
                        className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                          isDone
                            ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-default'
                            : 'border-orange-400 text-orange-500 bg-white hover:bg-orange-500 hover:text-white'
                        }`}
                      >
                        {isDone ? '다운완료' : '다운로드'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 mt-auto">
            {/* 수량 */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs text-gray-500 w-16 shrink-0">수량</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-base"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >−</button>
                  <span className="w-11 text-center text-sm font-semibold text-gray-900 border-x border-gray-200 h-9 flex items-center justify-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-base"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  >+</button>
                </div>
                {product.stock <= 5 && (
                  <span className="text-xs text-orange-500 font-medium">잔여 {product.stock}개</span>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-center">
                <span className="text-sm text-gray-500 font-medium">현재 품절된 상품입니다</span>
              </div>
            )}

            {/* 총 금액 */}
            {product.stock > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 mb-4">
                <span className="text-sm text-gray-500">총 상품금액</span>
                <div className="flex items-baseline gap-1">
                  {product.discount_rate > 0 && quantity > 0 && (
                    <span className="text-sm text-red-500 font-semibold">{product.discount_rate}%↓</span>
                  )}
                  <span className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString()}원</span>
                </div>
              </div>
            )}

            {/* CTA 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={handleCart}
                disabled={isAdding || product.stock === 0}
                className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-colors border-2 disabled:opacity-40 ${
                  added
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {product.stock === 0 ? '품절' : added ? '✓ 담겼습니다' : '장바구니 담기'}
              </button>
              <button
                onClick={handleBuy}
                disabled={isAdding || product.stock === 0}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-40"
              >
                {product.stock === 0 ? '품절' : '바로 구매'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 탭 섹션 ── */}
      <div className="max-w-5xl border-t border-gray-200">
        {/* 탭 헤더 */}
        <div className="flex border-b border-gray-200 mb-10">
          {(['상품설명', '상품정보', '리뷰', 'Q&A'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t === '리뷰' ? `리뷰 (${REVIEW_TOTAL})` : t === 'Q&A' ? 'Q&A (0)' : t}
            </button>
          ))}
        </div>

        {/* 상품설명 */}
        {tab === '상품설명' && (
          <div className="max-w-2xl mx-auto">
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed text-center mb-10 max-w-lg mx-auto">
                {product.description}
              </p>
            )}
            {/* 상세 이미지 영역 */}
            <div className={`rounded-3xl aspect-[3/2] flex items-center justify-center overflow-hidden bg-gradient-to-br ${
              product.category?.name === '전자기기' ? 'from-sky-50 to-blue-100' :
              product.category?.name === '의류'    ? 'from-pink-50 to-rose-100' :
              product.category?.name === '식품'    ? 'from-amber-50 to-orange-100' :
                                                     'from-teal-50 to-emerald-100'
            } mb-8`}>
              {product.image
                ? <img src={product.image} alt={product.name} className="h-[80%] object-contain" />
                : <span className="text-gray-300">상세 이미지</span>
              }
            </div>
            {/* 하이라이트 카드 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-2xl mb-2">{product.category?.name === '전자기기' ? '🎧' : product.category?.name === '의류' ? '👕' : product.category?.name === '식품' ? '☕' : '🛍️'}</p>
                <p className="text-xs text-gray-500 mb-1">카테고리</p>
                <p className="text-sm font-semibold text-gray-800">{product.category?.name ?? '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-2xl mb-2">{product.stock > 10 ? '✅' : product.stock > 0 ? '⚠️' : '❌'}</p>
                <p className="text-xs text-gray-500 mb-1">재고 현황</p>
                <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 상품정보 */}
        {tab === '상품정보' && (
          <div className="max-w-2xl">
            <table className="w-full text-sm">
              <tbody>
                {([
                  ['상품명',  product.name],
                  ['카테고리', product.category?.name ?? '—'],
                  ['판매가',  `${product.price.toLocaleString()}원`],
                  ['정가',    product.original_price ? `${product.original_price.toLocaleString()}원` : '—'],
                  ['할인율',  product.discount_rate > 0 ? `${product.discount_rate}%` : '—'],
                  ['재고',    product.stock > 0 ? `${product.stock}개` : '품절'],
                  ['배송',    product.price >= 30000 ? '무료배송' : '3,000원 (30,000원 이상 무료)'],
                  ['적립금',  `${Math.floor(product.price * 0.01).toLocaleString()}원 (구매금액의 1%)`],
                ] as [string, string][]).map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100 last:border-0">
                    <td className="py-3.5 pl-4 pr-8 text-xs font-semibold text-gray-500 bg-gray-50/80 w-28 align-top">{label}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 리뷰 */}
        {tab === '리뷰' && (
          <ReviewSection user={user} onLogin={() => router.push('/login')} />
        )}

        {/* Q&A */}
        {tab === 'Q&A' && (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl max-w-lg">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-gray-500 text-sm mb-4">등록된 Q&A가 없습니다.</p>
            <button
              onClick={() => !user && router.push('/login')}
              className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {user ? '문의 작성하기' : '로그인 후 문의하기'}
            </button>
          </div>
        )}
      </div>

      {/* ── 관련 상품 ── */}
      {related.length > 0 && (
        <div className="mt-16 max-w-5xl">
          <h3 className="text-base font-bold text-gray-900 mb-4">같은 카테고리 상품</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 aspect-square overflow-hidden">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="text-gray-300 text-sm">이미지 없음</span></div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">{p.name}</p>
                    <div className="flex items-baseline gap-1">
                      {p.discount_rate > 0 && <span className="text-xs text-red-500 font-bold">{p.discount_rate}%</span>}
                      <span className="text-sm font-bold text-gray-900">{p.price.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 별점 SVG ── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`${cls} ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/* ── 리뷰 섹션 ── */
function ReviewSection({ user, onLogin }: { user: any; onLogin: () => void }) {
  const [visibleCount, setVisibleCount] = useState(5)
  const [helpfulClicked, setHelpfulClicked] = useState<number[]>([])

  const toggleHelpful = (id: number) =>
    setHelpfulClicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div>
      {/* 별점 요약 */}
      <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-2xl mb-8 max-w-lg">
        <div className="text-center shrink-0">
          <p className="text-5xl font-bold text-gray-900">{REVIEW_AVG}</p>
          <div className="flex justify-center gap-0.5 mt-1.5">
            <Stars rating={Math.round(REVIEW_AVG)} size="md" />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{REVIEW_TOTAL}개 리뷰</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {REVIEW_DIST.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-7 shrink-0">{star}점</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="divide-y divide-gray-100">
        {DUMMY_REVIEWS.slice(0, visibleCount).map((review) => {
          const helped = helpfulClicked.includes(review.id)
          return (
            <div key={review.id} className="py-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-sm font-semibold text-gray-600">
                  {review.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-800">{review.name}</span>
                    {review.verified && (
                      <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-1.5 py-0.5 rounded-full font-medium">구매 확인</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>

              {review.title && (
                <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>
              )}
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.body}</p>

              {review.images && (
                <div className="flex gap-2 mb-3">
                  {[1, 2].map(i => (
                    <div key={i} className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => toggleHelpful(review.id)}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  helped
                    ? 'border-orange-300 text-orange-500 bg-orange-50'
                    : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                }`}
              >
                👍 도움이 돼요 {review.helpful + (helped ? 1 : 0)}
              </button>
            </div>
          )
        })}
      </div>

      {/* 더보기 / 리뷰 쓰기 */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        {visibleCount < REVIEW_TOTAL && (
          <button
            onClick={() => setVisibleCount(c => Math.min(c + 5, REVIEW_TOTAL))}
            className="w-full sm:w-auto px-8 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            리뷰 더보기 ({visibleCount}/{REVIEW_TOTAL})
          </button>
        )}
        <button
          onClick={() => !user && onLogin()}
          className="w-full sm:w-auto px-8 py-3 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {user ? '리뷰 작성하기' : '로그인 후 리뷰 작성하기'}
        </button>
      </div>
    </div>
  )
}
