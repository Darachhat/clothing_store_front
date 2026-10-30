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
      if (token) {
        const headers = new Headers(options.headers || {})
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
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

// Catalog API — public, no auth needed
export function useCatalogApi() {
  const config = useRuntimeConfig()
  const apiFetch = $fetch.create({
    baseURL: (import.meta.server
      ? (config.apiBase || 'http://backend:8000')
      : config.public.apiBase) as string,
  })

  return {
    listProducts: (params?: Record<string, unknown>) =>
      apiFetch('/api/store/v1/catalog/products', { params, query: params }),
    getProduct: (id: string) =>
      apiFetch(`/api/store/v1/catalog/products/${id}`),
  }
}

// Auth API — customer register / login / refresh / me
export function useStoreAuthApi() {
  const config = useRuntimeConfig()
  const apiFetch = $fetch.create({
    baseURL: (import.meta.server
      ? (config.apiBase || 'http://backend:8000')
      : config.public.apiBase) as string,
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
