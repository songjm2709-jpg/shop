'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

const NAV_ITEMS = [
  { label: '브랜드', href: '/products' },
  { label: '이벤트', href: '/products', pink: true },
  { label: '쿠폰', href: '/' },
  { label: '특가', href: '/products' },
  { label: '베스트', href: '/products' },
  { label: '소이코인', href: '/products' },
  { label: '매거진', href: '/products' },
]

export default function Header() {
  const router = useRouter()
  const { user, logout, loadFromStorage } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadFromStorage() }, [loadFromStorage])
  useEffect(() => { if (user) fetchCart() }, [user, fetchCart])

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`)
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* 햄버거 버튼 (모바일) */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] shrink-0"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="메뉴"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

          {/* 로고 */}
          <Link href="/" className="text-lg font-bold text-gray-900 shrink-0 tracking-tight">
            Shop
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  item.pink ? 'text-pink-500 hover:text-pink-600' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 검색창 (데스크탑) */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xs ml-auto">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="배송으로 산부 인업 보기"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 pr-9 focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <SearchIcon />
              </button>
            </div>
          </form>

          {/* 우측 아이콘 (데스크탑) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <Link href="/orders" className="text-gray-500 hover:text-gray-900 transition-colors" title="주문내역">
                  <UserIcon />
                </Link>
                <Link href="/cart" className="relative text-gray-500 hover:text-gray-900 transition-colors" title="장바구니">
                  <CartIcon />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors" title="로그인">
                  <UserIcon />
                </Link>
                <Link href="/cart" className="text-gray-500 hover:text-gray-900 transition-colors" title="장바구니">
                  <CartIcon />
                </Link>
                <Link href="/register" className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 우측 아이콘 (모바일) */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <Link href="/cart" className="relative text-gray-500 p-1">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 모바일 사이드 드로어 */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* 드로어 헤더 */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
          <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-gray-700 p-1" aria-label="닫기">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 검색 */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false) }}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="상품을 검색해보세요"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pr-9 focus:outline-none focus:border-gray-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>

        {/* 네비 메뉴 */}
        <nav className="flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between px-5 py-4 border-b border-gray-50 text-sm font-medium transition-colors hover:bg-gray-50
                ${item.pink ? 'text-pink-500' : 'text-gray-800'}`}
            >
              {item.label}
              <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </nav>

        {/* 로그인/유저 영역 */}
        <div className="px-5 py-5 border-t border-gray-100 shrink-0">
          {user ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                안녕하세요, <span className="font-semibold text-gray-800">{user.name}</span>님
              </p>
              <div className="flex gap-3">
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
                >
                  주문내역
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout() }}
                  className="flex-1 text-sm text-gray-400 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center text-sm text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center text-sm font-semibold text-white bg-orange-500 rounded-xl py-2.5 hover:bg-orange-600 transition-colors"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
