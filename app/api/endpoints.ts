// Centralized Web Store API Endpoints
export const STORE_API_ENDPOINTS = {
  auth: {
    login: '/api/store/v1/auth/login',
    register: '/api/store/v1/auth/register',
    refresh: '/api/store/v1/auth/refresh',
    me: '/api/store/v1/auth/me',
  },
  catalog: {
    products: '/api/store/v1/catalog/products',
    productDetail: (id: string) => `/api/store/v1/catalog/products/${id}`,
  },
  orders: {
    base: '/api/store/v1/orders',
    detail: (orderId: string) => `/api/store/v1/orders/${orderId}`,
    khqr: (orderId: string) => `/api/store/v1/orders/${orderId}/khqr`,
    paymentStatus: (orderId: string) => `/api/store/v1/orders/${orderId}/payment-status`,
    complete: (orderId: string) => `/api/store/v1/orders/${orderId}/complete`,
    validateCoupon: '/api/store/v1/orders/validate-coupon',
  },
} as const

export const API_ENDPOINTS = STORE_API_ENDPOINTS

