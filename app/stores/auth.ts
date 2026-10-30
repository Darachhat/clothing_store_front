// Web Store customer auth store
import { defineStore } from 'pinia'

interface Customer {
  id: string
  username: string
  email: string
  full_name: string
}

interface StoreAuthState {
  customer: Customer | null
  accessToken: string | null
  refreshToken: string | null
}

export const useStoreAuthStore = defineStore('storeAuth', {
  state: (): StoreAuthState => ({
    customer: null,
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.customer,
    currentCustomer: (state) => state.customer,
  },

  actions: {
    async login(username: string, password: string) {
      const authApi = useStoreAuthApi()
      const data = await authApi.login<{
        access_token: string
        refresh_token: string
        user: Customer
      }>(username, password)
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token
      this.customer = data.user
      if (process.client) {
        localStorage.setItem('store_access_token', data.access_token)
        localStorage.setItem('store_refresh_token', data.refresh_token)
      }
    },

    async register(body: { username: string; email: string; full_name: string; password: string }) {
      const authApi = useStoreAuthApi()
      return authApi.register(body)
    },

    logout() {
      this.customer = null
      this.accessToken = null
      this.refreshToken = null
      if (process.client) {
        localStorage.removeItem('store_access_token')
        localStorage.removeItem('store_refresh_token')
      }
    },

    restoreSession() {
      if (process.client) {
        const token = localStorage.getItem('store_access_token')
        const refresh = localStorage.getItem('store_refresh_token')
        if (token) this.accessToken = token
        if (refresh) this.refreshToken = refresh
      }
    },

    async fetchCurrentCustomer() {
      if (!this.accessToken) return
      const authApi = useStoreAuthApi()
      try {
        const customer = await authApi.me<Customer>(this.accessToken)
        this.customer = customer
      } catch {
        this.logout()
      }
    },
  },
})
