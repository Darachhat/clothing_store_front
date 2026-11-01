// Web Store Shopping Bag / Cart Store
import { defineStore } from 'pinia'

export interface StoreCartItem {
  variantId: string
  productId: string
  productName: string
  sku: string
  color?: string | null
  size?: string | null
  unitPrice: number
  quantity: number
  maxStock?: number
  imageUrl?: string | null
}

interface StoreCartState {
  items: StoreCartItem[]
}

const STORAGE_KEY = 'store_cart_v1'

export const useStoreCartStore = defineStore('storeCart', {
  state: (): StoreCartState => ({
    items: [],
  }),

  getters: {
    itemCount: (state): number =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state): number =>
      state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    isEmpty: (state): boolean => state.items.length === 0,
  },

  actions: {
    restoreCart() {
      if (import.meta.client) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
              this.items = parsed
            }
          }
        } catch {
          this.items = []
        }
      }
    },

    persistCart() {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      }
    },

    addItem(payload: StoreCartItem) {
      const existing = this.items.find((i) => i.variantId === payload.variantId)
      if (existing) {
        const nextQty = existing.quantity + payload.quantity
        existing.quantity = payload.maxStock
          ? Math.min(nextQty, payload.maxStock)
          : nextQty
      } else {
        this.items.push({ ...payload })
      }
      this.persistCart()
    },

    updateQuantity(variantId: string, quantity: number) {
      const idx = this.items.findIndex((i) => i.variantId === variantId)
      if (idx === -1) return
      if (quantity <= 0) {
        this.items.splice(idx, 1)
      } else {
        const item = this.items[idx]!
        item.quantity = item.maxStock ? Math.min(quantity, item.maxStock) : quantity
      }
      this.persistCart()
    },

    removeItem(variantId: string) {
      this.items = this.items.filter((i) => i.variantId !== variantId)
      this.persistCart()
    },

    clearCart() {
      this.items = []
      this.persistCart()
    },
  },
})

