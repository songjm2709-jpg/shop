export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  is_admin: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  category_id: number
  name: string
  description: string | null
  price: number
  stock: number
  image: string | null
  category?: Category
}

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  quantity: number
  product: Product
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product: Product
}

export interface Payment {
  id: number
  order_id: number
  payment_key: string | null
  method: string | null
  status: 'pending' | 'done' | 'failed' | 'cancelled'
  amount: number
}

export interface Order {
  id: number
  user_id: number
  total_amount: number
  status: 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled'
  receiver_name: string
  receiver_phone: string
  shipping_address: string
  items: OrderItem[]
  payment: Payment | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AuthResponse {
  user: User
  token: string
}
