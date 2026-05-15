'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Product, Coupon } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

/* ── 배너 데이터 (5개) ── */
const BANNERS = [
  {
    id: 1,
    bg: 'from-amber-50 to-yellow-100',
    accent: 'bg-amber-200',
    tag: '수분 케어',
    tagColor: 'bg-amber-100 text-amber-800',
    title: '오늘 달라지는\n피부 컨디션',
    sub: '인텐시브 3중 집중 루틴',
  },
  {
    id: 2,
    bg: 'from-pink-50 to-rose-100',
    accent: 'bg-rose-200',
    tag: '브라이트닝',
    tagColor: 'bg-rose-100 text-rose-700',
    title: '직접끊은 털고,\n믿음을 채우자',
    sub: '브라이트닝 케어후',
  },
  {
    id: 3,
    bg: 'from-emerald-50 to-teal-100',
    accent: 'bg-teal-200',
    tag: '닥터 크림',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '모터스쳇 닥터 크림\n자리만 말지 마세요.',
    sub: '진정 & 보습 동시에',
  },
  {
    id: 4,
    bg: 'from-violet-50 to-purple-100',
    accent: 'bg-purple-200',
    tag: '선케어',
    tagColor: 'bg-violet-100 text-violet-700',
    title: '자외선 걱정 없는\n매일의 선케어',
    sub: 'SPF 50+ 데일리 선크림',
  },
  {
    id: 5,
    bg: 'from-sky-50 to-blue-100',
    accent: 'bg-blue-200',
    tag: '나이트 케어',
    tagColor: 'bg-sky-100 text-sky-700',
    title: '자는 동안\n피부가 달라진다',
    sub: '리페어링 나이트 크림',
  },
]

/* ── 광고 팝업 배너 데이터 ── */
const POPUP_ADS = [
  {
    id: 1,
    bg: 'from-pink-50 to-rose-100',
    accent: 'bg-rose-300',
    tag: '🌸 봄 특가',
    tagColor: 'bg-rose-100 text-rose-700',
    title: '봄맞이 특가\n최대 50% 할인',
    sub: '오늘만 진행되는 특별 이벤트',
    href: '/products',
    cta: '지금 바로 보기',
  },
  {
    id: 2,
    bg: 'from-amber-50 to-yellow-100',
    accent: 'bg-amber-300',
    tag: '⚡ 타임딜',
    tagColor: 'bg-amber-100 text-amber-800',
    title: '24시간 한정\n인기 세럼 특가',
    sub: '재고 소진 시 자동 종료',
    href: '/products',
    cta: '특가 확인하기',
  },
  {
    id: 3,
    bg: 'from-violet-50 to-purple-100',
    accent: 'bg-purple-300',
    tag: '🎁 신규 회원',
    tagColor: 'bg-violet-100 text-violet-700',
    title: '첫 구매 시\n5,000원 할인 쿠폰',
    sub: '신규 회원 전용 혜택',
    href: '/products',
    cta: '쿠폰 받기',
  },
]

const POPUP_STORAGE_KEY = 'popup_hidden_until'

function PopupAd() {
  const [visible, setVisible] = useState(false)
  const [adIdx, setAdIdx] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  useEffect(() => {
    const hiddenUntil = localStorage.getItem(POPUP_STORAGE_KEY)
    if (hiddenUntil && new Date(hiddenUntil) > new Date()) return
    setVisible(true)
  }, [])

  const close = () => setVisible(false)

  const hideToday = () => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    localStorage.setItem(POPUP_STORAGE_KEY, end.toISOString())
    setVisible(false)
  }

  const slide = (dir: 'left' | 'right') => {
    if (sliding) return
    setDirection(dir)
    setSliding(true)
    setTimeout(() => {
      setAdIdx(i =>
        dir === 'right'
          ? (i + 1) % POPUP_ADS.length
          : (i - 1 + POPUP_ADS.length) % POPUP_ADS.length
      )
      setSliding(false)
    }, 260)
  }

  if (!visible) return null

  const ad = POPUP_ADS[adIdx]

  return (
    <div className="fixed bottom-6 left-6 z-50 w-64 rounded-2xl shadow-2xl overflow-hidden">
      {/* 배너 슬라이드 영역 */}
      <div className="relative overflow-hidden">
        <div
          className={`relative bg-gradient-to-br ${ad.bg} p-5 transition-transform duration-[260ms] ease-in-out
            ${sliding
              ? direction === 'right' ? '-translate-x-full' : 'translate-x-full'
              : 'translate-x-0'
            }`}
        >
          {/* 장식 원 */}
          <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-30 ${ad.accent}`} />
          <div className={`absolute right-2 -bottom-8 w-20 h-20 rounded-full opacity-20 ${ad.accent}`} />

          {/* 태그 */}
          <span className={`relative z-10 inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${ad.tagColor}`}>
            {ad.tag}
          </span>

          {/* 제목 */}
          <h3 className="relative z-10 text-sm font-bold text-gray-900 leading-snug whitespace-pre-line mb-1">
            {ad.title}
          </h3>
          <p className="relative z-10 text-xs text-gray-500 mb-4">{ad.sub}</p>

          {/* CTA 버튼 */}
          <Link
            href={ad.href}
            className="relative z-10 inline-block bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            {ad.cta}
          </Link>

          {/* 슬라이드 화살표 */}
          <button
            onClick={() => slide('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 shadow z-20 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => slide('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 shadow z-20 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* 도트 */}
      <div className="flex justify-center items-center gap-1.5 py-2 bg-white">
        {POPUP_ADS.map((_, i) => (
          <button
            key={i}
            onClick={() => setAdIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === adIdx ? 'w-4 bg-gray-700' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* 오늘 그만 보기 / 닫기 */}
      <div className="flex border-t border-gray-100 bg-white">
        <button
          onClick={hideToday}
          className="flex-1 text-xs text-gray-400 hover:text-gray-600 py-3 border-r border-gray-100 transition-colors"
        >
          오늘 그만 보기
        </button>
        <button
          onClick={close}
          className="flex-1 text-xs text-gray-500 hover:text-gray-700 py-3 font-medium transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

/* ── 카테고리 숏컷 ── */
const SHORTCUTS = [
  { name: '겟잇뷰티',   icon: <TrophyIcon />,  href: '/products' },
  { name: '올영세일',   icon: <BagIcon />,      href: '/products' },
  { name: '베스트셀러', icon: <StarIcon />,      href: '/products' },
  { name: '사은품',     icon: <GiftIcon />,      href: '/products' },
  { name: '브랜드위크', icon: <TagIcon />,       href: '/products' },
  { name: '네이버페이', icon: <CardIcon />,      href: '/products' },
  { name: '이벤트',     icon: <EventIcon />,     href: '/products' },
  { name: '추천세트',   icon: <SparkIcon />,     href: '/products' },
]

/* ── 카운트다운 훅 ── */
function useCountdown(ms: number) {
  const [end] = useState(() => Date.now() + ms)
  const calc = useCallback(() => {
    const diff = Math.max(0, end - Date.now())
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) }
  }, [end])
  const [time, setTime] = useState(calc)
  useEffect(() => { const id = setInterval(() => setTime(calc()), 1000); return () => clearInterval(id) }, [calc])
  return time
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ══════════════════════════════════════════════════════════════════
   배너 캐러셀
   · 중앙 3개 활성화, 양옆 60% 노출
   · 슬라이드폭 = containerWidth / 4.2
   · 무한 루프 (clone 방식)
════════════════════════════════════════════════════════════════════ */
const GAP = 12 // px
const N = BANNERS.length  // 5
// extended: [last, b0, b1, b2, b3, b4, b0, b1]
const EXTENDED = [BANNERS[N - 1], ...BANNERS, BANNERS[0], BANNERS[1]]
const REAL_START = 1  // index of b0 in extended

const MOBILE_PEEK = 28 // 모바일에서 양옆 노출 px

function BannerCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(0)                    // container width (px)
  const [isMobile, setIsMobile] = useState(false)
  const [idx, setIdx] = useState(REAL_START)         // track index
  const [animated, setAnimated] = useState(true)
  const resetting = useRef(false)

  /* 컨테이너 너비·모바일 여부 감지 */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      setCw(w)
      setIsMobile(w < 768)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 모바일: 1개 중앙 + 양옆 peek  /  데스크탑: 3개 + 양옆 peek
  const sw = cw
    ? isMobile
      ? cw - 2 * MOBILE_PEEK - GAP        // 1개 꽉 차게 + 양옆 각 peek
      : (cw - GAP * 4) / 4.2              // 기존 데스크탑 비율
    : 0
  const peek = isMobile ? MOBILE_PEEK : sw * 0.6
  const offset = sw ? peek - idx * (sw + GAP) : 0

  const realIdx = ((idx - REAL_START) % N + N) % N  // 0..N-1

  /* 무한 루프: 트랜지션 끝나면 clone 구간에서 real 구간으로 순간이동 */
  const handleEnd = useCallback(() => {
    if (resetting.current) return
    if (idx < REAL_START) {
      resetting.current = true
      setAnimated(false)
      setIdx(idx + N)
    } else if (idx >= REAL_START + N) {
      resetting.current = true
      setAnimated(false)
      setIdx(idx - N)
    }
  }, [idx])

  useEffect(() => {
    if (!animated && resetting.current) {
      const t = setTimeout(() => { setAnimated(true); resetting.current = false }, 30)
      return () => clearTimeout(t)
    }
  }, [animated])

  const prev = () => setIdx(i => i - 1)
  const next = () => setIdx(i => i + 1)
  const goTo = (i: number) => setIdx(REAL_START + i)

  return (
    <div ref={containerRef} className="relative overflow-hidden mt-4 mb-6">
      {/* 트랙 */}
      <div
        className="flex"
        style={{
          gap: `${GAP}px`,
          transform: `translateX(${offset}px)`,
          transition: animated ? 'transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          willChange: 'transform',
        }}
        onTransitionEnd={handleEnd}
      >
        {EXTENDED.map((b, i) => {
          const isActive = isMobile ? i === idx : (i >= idx && i <= idx + 2)
          return (
            <div
              key={`${b.id}-${i}`}
              style={{ width: sw ? `${sw}px` : 'calc((100% - 48px) / 4.2)', flexShrink: 0 }}
              className={`relative bg-gradient-to-br ${b.bg} rounded-2xl overflow-hidden
                h-52 md:h-64 flex flex-col justify-between p-5
                transition-all duration-500
                ${isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
            >
              {/* 장식 원 */}
              <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-30 ${b.accent}`} />
              <div className={`absolute right-4 -bottom-10 w-28 h-28 rounded-full opacity-20 ${b.accent}`} />
              {/* 콘텐츠 */}
              <span className={`relative z-10 inline-block self-start text-[11px] font-semibold px-2.5 py-1 rounded-full ${b.tagColor}`}>
                {b.tag}
              </span>
              <div className="relative z-10">
                <h2 className="text-base font-bold text-gray-900 leading-snug whitespace-pre-line mb-1">
                  {b.title}
                </h2>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 좌우 화살표 */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-600 text-xl leading-none transition-colors z-10"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-600 text-xl leading-none transition-colors z-10"
      >
        ›
      </button>

      {/* 도트 */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === realIdx ? 'w-5 bg-gray-700' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════ HOME ════════════════════════════ */
export default function Home() {
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [bestProducts, setBestProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [addingId, setAddingId] = useState<number | null>(null)
  const countdown = useCountdown(8 * 3600_000 + 47 * 60_000 + 32_000)

  useEffect(() => {
    api.get<Coupon[]>('/coupons').then(({ data }) => setCoupons(data)).catch(() => {})
    api.get('/products', { params: { page: 1 } }).then(({ data }: any) => {
      const all: Product[] = data.data ?? []
      setBestProducts(all.slice(0, 4))
      setNewProducts(all.slice(0, 2))
    }).catch(() => {})
  }, [])

  const handleCart = async (productId: number) => {
    if (!user) { window.location.href = '/login'; return }
    setAddingId(productId)
    try { await addItem(productId, 1) } finally { setAddingId(null) }
  }

  return (
    <div className="pb-12">

      {/* ── 광고 팝업 ── */}
      <PopupAd />

      {/* ── 멀티 슬라이드 배너 캐러셀 ── */}
      <BannerCarousel />

      {/* ── 카테고리 숏컷 ── */}
      <div className="flex items-center justify-center gap-5 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {SHORTCUTS.map((s) => (
          <Link key={s.name} href={s.href} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-100 transition-colors">
              {s.icon}
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{s.name}</span>
          </Link>
        ))}
      </div>

      {/* ── 타임딜 + 신상품 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="inline-block bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">진행 中</span>
            <p className="text-white text-sm font-semibold mb-1 leading-snug">브라이트닝 카밍<br />소세 세럼 이벤트</p>
            <p className="text-slate-400 text-xs">트라올 후래피성에 더워 이벤트</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-2">마감까지 남은 시간</p>
            <div className="flex items-center gap-1">
              {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((v, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-white text-slate-900 text-sm font-bold w-9 py-1 rounded text-center tabular-nums">{v}</span>
                  {i < 2 && <span className="text-slate-400 font-bold text-sm">:</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {newProducts.length === 0
          ? [0, 1].map((i) => <div key={i} className="bg-gray-50 rounded-2xl animate-pulse min-h-[220px]" />)
          : newProducts.slice(0, 2).map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <Link href={`/products/${product.id}`} className="block group">
                  <div className="bg-gray-50 aspect-[4/3] flex items-center justify-center overflow-hidden">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <span className="text-gray-300 text-sm">이미지 없음</span>}
                  </div>
                  <div className="p-3 pb-2">
                    <span className="inline-block bg-pink-50 text-pink-500 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 w-fit">NEW</span>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-1">{product.name}</p>
                    <p className="text-base font-bold text-gray-900">{product.price.toLocaleString()}원</p>
                  </div>
                </Link>
                <div className="px-3 pb-3 mt-auto">
                  <button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-40"
                    onClick={() => handleCart(product.id)}
                    disabled={addingId === product.id || product.stock === 0}
                  >
                    {product.stock === 0 ? '품절' : addingId === product.id ? '추가 중...' : '장바구니 담기'}
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* ── 이벤트 쿠폰 ── */}
      {coupons.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="이벤트 쿠폰" href="/" />
          <div className="grid grid-cols-2 gap-3">
            {coupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />)}
          </div>
        </section>
      )}

      {/* ── 베스트 상품 ── */}
      <section className="mb-10">
        <SectionHeader title="베스트 상품" href="/products" />
        {bestProducts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="bg-gray-50 rounded-2xl animate-pulse h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestProducts.map((product, idx) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 aspect-square flex items-center justify-center overflow-hidden relative">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <span className="text-gray-300 text-sm">이미지 없음</span>}
                    <span className="absolute top-2 left-2 bg-white/90 text-orange-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="badge-category text-[10px] mb-1 inline-block">{product.category?.name || '상품'}</span>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 mb-1 leading-snug">{product.name}</p>
                    <p className="text-sm font-bold text-gray-900">{product.price.toLocaleString()}원</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="text-center">
        <Link href="/products" className="inline-block border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 text-sm font-medium px-8 py-3 rounded-xl transition-colors">
          전체 상품 보기
        </Link>
      </div>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <Link href={href} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">전체보기 &gt;</Link>
    </div>
  )
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">{coupon.type}</span>
        <span className="text-xs text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">D-{coupon.d_day}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight mb-2">추가 {coupon.amount.toLocaleString()}원</p>
      <Link href={coupon.category ? `/products?category_id=${coupon.category.id}` : '/products'}
        className="inline-flex items-center w-fit text-xs font-semibold px-3 py-1.5 rounded-full mb-3 bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
        사용 가능 상품 &gt;
      </Link>
      <p className="text-sm text-gray-600 leading-snug mb-4 flex-1">{coupon.name}</p>
      <div className="pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400 mb-0.5">• 이벤트 상품 사용가능</p>
        <p className="text-xs text-gray-400">{coupon.start_date} ~ {coupon.end_date}</p>
      </div>
    </div>
  )
}

/* ── SVG 아이콘들 ── */
function TrophyIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg> }
function BagIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> }
function StarIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> }
function GiftIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> }
function TagIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg> }
function CardIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg> }
function EventIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> }
function SparkIcon() { return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg> }
