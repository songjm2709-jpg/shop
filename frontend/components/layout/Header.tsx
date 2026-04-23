'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export default function Header() {
  const { user, logout, loadFromStorage } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    if (user) fetchCart()
  }, [user, fetchCart])

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600" onClick={closeMenu}>
          Shop
        </Link>

        {/* 데스크탑 nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900">
            상품
          </Link>

          {user ? (
            <>
              {user.is_admin && (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                  관리자
                </span>
              )}
              <span className="text-sm text-gray-500">{user.name}</span>
              <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
                장바구니
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="text-gray-600 hover:text-gray-900">
                주문내역
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900 text-sm">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                로그인
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                회원가입
              </Link>
            </>
          )}
        </nav>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-4">
          <Link href="/products" className="text-gray-600 hover:text-gray-900" onClick={closeMenu}>
            상품
          </Link>

          {user ? (
            <>
              {user.is_admin && (
                <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded w-fit">
                  관리자
                </span>
              )}
              <span className="text-sm text-gray-500">{user.name}</span>
              <Link href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-gray-900" onClick={closeMenu}>
                장바구니
                {cartCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="text-gray-600 hover:text-gray-900" onClick={closeMenu}>
                주문내역
              </Link>
              <button
                onClick={() => { closeMenu(); handleLogout() }}
                className="text-left text-gray-500 hover:text-gray-900 text-sm"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900" onClick={closeMenu}>
                로그인
              </Link>
              <Link href="/register" className="btn-primary text-sm w-fit" onClick={closeMenu}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
