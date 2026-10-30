// Guest middleware — redirect authenticated customers away from login page
export default defineNuxtRouteMiddleware(() => {
  const authStore = useStoreAuthStore()
  if (process.client) {
    authStore.restoreSession()
  }
  if (authStore.accessToken) {
    return navigateTo('/account')
  }
})
