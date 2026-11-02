// Centralized HTTP Client for Web Store Frontend

export function createStoreApiClient() {
  const config = useRuntimeConfig()
  const authStore = useStoreAuthStore()

  const baseURL = (import.meta.server
    ? (config.apiBase || 'http://backend:8000')
    : config.public.apiBase) as string

  const apiFetch = $fetch.create({
    baseURL,
    retry: 1,
    retryStatusCodes: [401],
    async onRequest({ options }) {
      if (!authStore.accessToken && typeof window !== 'undefined') {
        authStore.restoreSession()
      }
      const token = authStore.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('store_access_token') : null)

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
    baseURL,
    fetch: apiFetch,
    get: <T = unknown>(url: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) =>
      apiFetch<T>(url, { ...opts, params, query: params } as any),
    post: <T = unknown>(url: string, body?: unknown, opts?: Record<string, unknown>) =>
      apiFetch<T>(url, { ...opts, method: 'POST', body: body as any } as any),
    put: <T = unknown>(url: string, body?: unknown, opts?: Record<string, unknown>) =>
      apiFetch<T>(url, { ...opts, method: 'PUT', body: body as any } as any),
    patch: <T = unknown>(url: string, body?: unknown, opts?: Record<string, unknown>) =>
      apiFetch<T>(url, { ...opts, method: 'PATCH', body: body as any } as any),
    delete: <T = unknown>(url: string, opts?: Record<string, unknown>) =>
      apiFetch<T>(url, { ...opts, method: 'DELETE' } as any),
  }
}

export type StoreApiClient = ReturnType<typeof createStoreApiClient>

