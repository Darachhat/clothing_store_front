// Web Store customer auth store
import { defineStore } from 'pinia'
import type { CustomerRegisterRequest } from '~/types/api.generated'

export interface Customer {
  id: string
  username: string
  email: string
  full_name: string
  phone_number?: string | null
  phone_verified?: boolean
  telegram_id?: string | null
  telegram_username?: string | null
}

export interface StoreAuthState {
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
    _persistSession(accessToken: string, refreshToken: string, customer: Customer) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.customer = customer
      if (process.client) {
        localStorage.setItem('store_access_token', accessToken)
        localStorage.setItem('store_refresh_token', refreshToken)
        try {
          localStorage.setItem('store_user', JSON.stringify(customer))
        } catch {}
      }
    },

    async login(username: string, password: string) {
      const authApi = useStoreAuthApi()
      const data = await authApi.login<{
        access_token: string
        refresh_token: string
        user: Customer
      }>(username, password)
      this._persistSession(data.access_token, data.refresh_token, data.user)
    },

    async getTelegramConfig(): Promise<{ enabled: boolean; bot_username?: string | null; bot_id?: string | null }> {
      const authApi = useStoreAuthApi()
      try {
        const res = await authApi.telegramConfig<{ enabled: boolean; bot_username?: string | null; bot_id?: string | null }>()
        return {
          enabled: res.enabled,
          bot_username: res.bot_username ? res.bot_username.replace(/^@/, '') : 'clothing_store_kvm_bot',
          bot_id: res.bot_id || '8453886789',
        }
      } catch {
        return { enabled: true, bot_username: 'clothing_store_kvm_bot', bot_id: '8453886789' }
      }
    },

    async loginWithTelegram(payload: Record<string, unknown>) {
      const authApi = useStoreAuthApi()
      const data = await authApi.telegramLogin<{
        access_token: string
        refresh_token: string
        user: Customer
      }>(payload)
      this._persistSession(data.access_token, data.refresh_token, data.user)
    },

    async linkTelegram(payload: Record<string, unknown>): Promise<Customer> {
      if (!this.accessToken) throw new Error('Not authenticated')
      const authApi = useStoreAuthApi()
      const updated = await authApi.telegramLink<Customer>(payload, this.accessToken)
      this.customer = updated
      if (process.client) {
        try {
          localStorage.setItem('store_user', JSON.stringify(updated))
        } catch {}
      }
      return updated
    },

    async unlinkTelegram(): Promise<Customer> {
      if (!this.accessToken) throw new Error('Not authenticated')
      const authApi = useStoreAuthApi()
      const updated = await authApi.telegramUnlink<Customer>(this.accessToken)
      this.customer = updated
      if (process.client) {
        try {
          localStorage.setItem('store_user', JSON.stringify(updated))
        } catch {}
      }
      return updated
    },

    async requestPhoneVerification(phoneNumber: string) {
      if (!this.accessToken) throw new Error('Not authenticated')
      const authApi = useStoreAuthApi()
      return await authApi.requestPhoneVerification(phoneNumber, this.accessToken)
    },

    async verifyPhone(phoneNumber: string, otpCode: string): Promise<Customer> {
      if (!this.accessToken) throw new Error('Not authenticated')
      const authApi = useStoreAuthApi()
      const updated = await authApi.verifyPhone<Customer>(phoneNumber, otpCode, this.accessToken)
      this.customer = updated
      if (process.client) {
        try {
          localStorage.setItem('store_user', JSON.stringify(updated))
        } catch {}
      }
      return updated
    },

    async register(body: CustomerRegisterRequest & { username: string }) {
      const authApi = useStoreAuthApi()
      return authApi.register(body)
    },

    async refreshSession(): Promise<boolean> {
      const currentRefresh =
        this.refreshToken ||
        (process.client ? localStorage.getItem('store_refresh_token') : null)
      if (!currentRefresh) return false
      const authApi = useStoreAuthApi()
      try {
        const data = await authApi.refresh<{
          access_token: string
          refresh_token: string
        }>(currentRefresh)
        this.accessToken = data.access_token
        this.refreshToken = data.refresh_token
        if (process.client) {
          localStorage.setItem('store_access_token', data.access_token)
          localStorage.setItem('store_refresh_token', data.refresh_token)
        }
        return true
      } catch {
        return false
      }
    },

    clearLocalSession() {
      this.customer = null
      this.accessToken = null
      this.refreshToken = null
      if (process.client) {
        localStorage.removeItem('store_access_token')
        localStorage.removeItem('store_refresh_token')
        localStorage.removeItem('store_user')
      }
    },

    async logout() {
      const currentRefresh =
        this.refreshToken ||
        (process.client ? localStorage.getItem('store_refresh_token') : null)
      const currentAccess = this.accessToken

      this.clearLocalSession()

      if (currentRefresh) {
        const authApi = useStoreAuthApi()
        try {
          await authApi.logout(currentRefresh, currentAccess)
        } catch {}
      }
    },

    restoreSession() {
      if (process.client) {
        const token = localStorage.getItem('store_access_token')
        const refresh = localStorage.getItem('store_refresh_token')
        if (token) this.accessToken = token
        if (refresh) this.refreshToken = refresh
        if (!this.customer) {
          const cachedUser = localStorage.getItem('store_user')
          if (cachedUser) {
            try {
              this.customer = JSON.parse(cachedUser)
            } catch {}
          }
        }
      }
    },

    async fetchCurrentCustomer() {
      if (!this.accessToken) {
        this.restoreSession()
      }
      if (!this.accessToken) return
      const authApi = useStoreAuthApi()
      try {
        const customer = await authApi.me<Customer>(this.accessToken)
        this.customer = customer
        if (process.client) {
          try {
            localStorage.setItem('store_user', JSON.stringify(customer))
          } catch {}
        }
      } catch {
        const ok = await this.refreshSession()
        if (ok && this.accessToken) {
          try {
            const customer = await authApi.me<Customer>(this.accessToken)
            this.customer = customer
            if (process.client) {
              try {
                localStorage.setItem('store_user', JSON.stringify(customer))
              } catch {}
            }
            return
          } catch {}
        }
        await this.logout()
      }
    },
  },
})
