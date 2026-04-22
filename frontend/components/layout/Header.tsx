'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export default function Header() {
  const { user, logout, loadFromStorage } = useAuthStore()
  const { cart, fetchCart } = useCartStore()

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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Shop
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900">
            상품
          </Link>

          {user ? (
            <>
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
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
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
      </div>
    </header>
  )
}
