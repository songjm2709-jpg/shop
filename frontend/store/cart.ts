import { create } from 'zustand'
import { Cart } from '@/types'
import api from '@/lib/api'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get<Cart>('/cart')
      set({ cart: data })
    } finally {
      set({ isLoading: false })
    }
  },

  addItem: async (productId, quantity) => {
    const { data } = await api.post<Cart>('/cart/items', { product_id: productId, quantity })
    set({ cart: data })
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put<Cart>(`/cart/items/${itemId}`, { quantity })
    set({ cart: data })
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete<Cart>(`/cart/items/${itemId}`)
    set({ cart: data })
  },

  clearCart: async () => {
    await api.delete('/cart')
    set({ cart: null })
  },
}))
