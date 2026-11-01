// Helper: inject X-System-Authorization server-side only
function _injectSystemAuth(options: { headers?: HeadersInit | Headers }, sysAuth: string) {
  if (!sysAuth) return
  const headers = new Headers(options.headers || {})
  headers.set('X-System-Authorization', sysAuth)
  options.headers = headers
}

// Store API composable — wraps $fetch pointed at /api/store/v1/
export function useStoreApi() {
  const config = useRuntimeConfig()
  const authStore = useStoreAuthStore()

  const apiFetch = $fetch.create({
    baseURL: (import.meta.server
      ? (config.apiBase || 'http://backend:8000')
      : config.public.apiBase) as string,
    onRequest({ options }) {
      const token = authStore.accessToken
      const headers = new Headers(options.headers || {})
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      // Attach system credential server-side only (credential stays private)
      if (import.meta.server) {
        const sysAuth = config.apiBaseAuth as string
        if (sysAuth) headers.set('X-System-Authorization', sysAuth)
      }
      options.headers = headers
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        authStore.logout()
      }
    },
  })

  return {
    apiFetch,
    get: <T = any>(url: string, params?: Record<string, unknown>) =>
      apiFetch<T>(url, { params, query: params }),
    post: <T = any>(url: string, body?: unknown) =>
      apiFetch<T>(url, { method: 'POST', body: body as any }),
  }
}

// Catalog API — public endpoints, but still carries system credential on SSR
export function useCatalogApi() {
  const config = useRuntimeConfig()
  const apiFetch = $fetch.create({
    baseURL: (import.meta.server
      ? (config.apiBase || 'http://backend:8000')
      : config.public.apiBase) as string,
    onRequest({ options }) {
      if (import.meta.server) {
        _injectSystemAuth(options, config.apiBaseAuth as string)
      }
    },
  })

  return {
    listProducts: (params?: Record<string, unknown>) =>
      apiFetch('/api/store/v1/catalog/products', { params, query: params }),
    getProduct: (id: string) =>
      apiFetch(`/api/store/v1/catalog/products/${id}`),
  }
}

// Auth API — customer register / login / refresh / me (carries system credential on SSR)
export function useStoreAuthApi() {
  const config = useRuntimeConfig()
  const apiFetch = $fetch.create({
    baseURL: (import.meta.server
      ? (config.apiBase || 'http://backend:8000')
      : config.public.apiBase) as string,
    onRequest({ options }) {
      if (import.meta.server) {
        _injectSystemAuth(options, config.apiBaseAuth as string)
      }
    },
  })

  return {
    login: <T = any>(username: string, password: string) =>
      apiFetch<T>('/api/store/v1/auth/login', { method: 'POST', body: { username, password } }),
    register: (body: { username: string; email: string; full_name: string; password: string }) =>
      apiFetch('/api/store/v1/auth/register', { method: 'POST', body }),
    refresh: <T = any>(refreshToken: string) =>
      apiFetch<T>('/api/store/v1/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } }),
    me: <T = any>(token: string) =>
      apiFetch<T>('/api/store/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  }
}

// Orders & Checkout API
export function useStoreOrdersApi() {
  const { get, post } = useStoreApi()
  return {
    createOrder: (payload: {
      items: Array<{ variant_id: string; quantity: number }>
      payment_method: string
      customer_name?: string
      customer_email?: string
      customer_phone?: string
      shipping_address?: string
      notes?: string
      coupon_code?: string
      create_draft?: boolean
    }) => post('/api/store/v1/orders', payload),
    createOrderKhqr: (orderId: string) =>
      post<any>(`/api/store/v1/orders/${orderId}/khqr`),
    getOrderPaymentStatus: (orderId: string, paymentId?: string) =>
      get<any>(`/api/store/v1/orders/${orderId}/payment-status`, paymentId ? { payment_id: paymentId } : undefined),
    completeOrder: (orderId: string, paymentMethod = 'ABA_KHQR') =>
      post<any>(`/api/store/v1/orders/${orderId}/complete`, { payment_method: paymentMethod }),
    validateCoupon: (code: string, cartTotal: number) =>
      post<{ valid: boolean; code: string; discount_amount: number; message: string }>(
        '/api/store/v1/orders/validate-coupon',
        { code, cart_total: cartTotal }
      ),
    listMyOrders: () => get<any[]>('/api/store/v1/orders'),
    getOrder: (orderId: string) => get<any>(`/api/store/v1/orders/${orderId}`),
  }
}
