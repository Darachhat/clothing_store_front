// Web Store API facade delegating to centralized client & endpoints
import { createStoreApiClient } from '~/api/client'
import { STORE_API_ENDPOINTS } from '~/api/endpoints'

// Generic Store API composable
export function useStoreApi() {
  const client = createStoreApiClient()

  return {
    baseURL: client.baseURL,
    apiFetch: client.fetch,
    get: client.get,
    post: client.post,
    patch: client.patch,
    put: client.put,
    delete: client.delete,
  }
}

// Catalog API — public endpoints with SSR system credential support
export function useCatalogApi() {
  const { apiFetch } = useStoreApi()

  return {
    listProducts: (params?: Record<string, unknown>) =>
      apiFetch(STORE_API_ENDPOINTS.catalog.products, { params, query: params }),
    getProduct: (id: string) =>
      apiFetch(STORE_API_ENDPOINTS.catalog.productDetail(id)),
  }
}

// Auth API — customer register / login / refresh / logout / me / Telegram / phone
export function useStoreAuthApi() {
  const { apiFetch } = useStoreApi()

  return {
    login: <T = any>(username: string, password: string) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.login, { method: 'POST', body: { username, password } }),
    register: (body: { username: string; email: string; full_name: string; password: string }) =>
      apiFetch(STORE_API_ENDPOINTS.auth.register, { method: 'POST', body }),
    refresh: <T = any>(refreshToken: string) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.refresh, { method: 'POST', body: { refresh_token: refreshToken } }),
    logout: (refreshToken: string, token?: string | null) =>
      apiFetch(STORE_API_ENDPOINTS.auth.logout, {
        method: 'POST',
        body: { refresh_token: refreshToken },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
    me: <T = any>(token: string) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.me, { headers: { Authorization: `Bearer ${token}` } }),
    telegramConfig: () =>
      apiFetch<{ enabled: boolean; bot_username?: string | null }>(STORE_API_ENDPOINTS.auth.telegramConfig),
    telegramLogin: <T = any>(payload: Record<string, unknown>) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.telegramLogin, { method: 'POST', body: payload }),
    telegramLink: <T = any>(payload: Record<string, unknown>, token: string) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.telegramLink, {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      }),
    telegramUnlink: <T = any>(token: string) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.telegramLink, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    requestPhoneVerification: (phoneNumber: string, token: string) =>
      apiFetch<{
        message: string
        normalized_phone: string
        expires_in_seconds: number
        delivery_channel: string
      }>(STORE_API_ENDPOINTS.auth.phoneRequestVerification, {
        method: 'POST',
        body: { phone_number: phoneNumber },
        headers: { Authorization: `Bearer ${token}` },
      }),
    verifyPhone: <T = any>(phoneNumber: string, otpCode: string, token: string) =>
      apiFetch<T>(STORE_API_ENDPOINTS.auth.phoneVerify, {
        method: 'POST',
        body: { phone_number: phoneNumber, otp_code: otpCode },
        headers: { Authorization: `Bearer ${token}` },
      }),
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
    }) => post(STORE_API_ENDPOINTS.orders.base, payload),
    createOrderKhqr: (orderId: string) =>
      post<any>(STORE_API_ENDPOINTS.orders.khqr(orderId)),
    getOrderPaymentStatus: (orderId: string, paymentId?: string) =>
      get<any>(STORE_API_ENDPOINTS.orders.paymentStatus(orderId), paymentId ? { payment_id: paymentId } : undefined),
    completeOrder: (orderId: string, paymentMethod = 'ABA_KHQR') =>
      post<any>(STORE_API_ENDPOINTS.orders.complete(orderId), { payment_method: paymentMethod }),
    validateCoupon: (code: string, cartTotal: number) =>
      post<{ valid: boolean; code: string; discount_amount: number; message: string }>(
        STORE_API_ENDPOINTS.orders.validateCoupon,
        { code, cart_total: cartTotal }
      ),
    listMyOrders: () => get<any[]>(STORE_API_ENDPOINTS.orders.base),
    getOrder: (orderId: string) => get<any>(STORE_API_ENDPOINTS.orders.detail(orderId)),
  }
}
