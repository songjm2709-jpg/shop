import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">온라인 쇼핑몰</h1>
      <p className="text-gray-500 mb-8">다양한 상품을 만나보세요</p>
      <Link href="/products" className="btn-primary text-lg px-8 py-3">
        쇼핑 시작하기
      </Link>
    </div>
  )
}
