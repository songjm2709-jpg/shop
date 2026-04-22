'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutFailPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') ?? '결제가 취소되었습니다.'

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="card text-center">
        <div className="text-4xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-red-600 mb-2">결제 실패</h1>
        <p className="text-gray-500 mb-6">{message}</p>
        <Link href="/cart" className="btn-primary">장바구니로 돌아가기</Link>
      </div>
    </div>
  )
}
