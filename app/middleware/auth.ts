// Customer auth middleware — restores session, refreshes expired JWTs, and enforces authentication
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const authStore = useStoreAuthStore()
  authStore.restoreSession()

  if (!authStore.accessToken) {
    return navigateTo('/account/login', { replace: true })
  }

  await authStore.fetchCurrentCustomer()

  if (!authStore.accessToken || !authStore.currentCustomer) {
    authStore.clearLocalSession()
    return navigateTo('/account/login', { replace: true })
  }
})

