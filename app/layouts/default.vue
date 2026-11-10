<template>
  <div class="min-h-screen flex flex-col bg-surface-bg text-ink">
    <!-- Top navbar -->
    <header class="sticky top-0 z-50 bg-surface-card border-b border-border-subtle">
      <div class="max-w-6xl mx-auto flex items-center gap-6 px-4 h-14">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-[15px] text-ink no-underline tracking-tight">
          <UIcon name="i-heroicons-building-storefront" class="w-5 h-5" />
          {{ config.public.appName }}
        </NuxtLink>
        <nav class="flex items-center gap-4 ml-4">
          <NuxtLink to="/products" class="text-sm text-ink-secondary hover:text-ink transition-colors no-underline py-1">Shop</NuxtLink>
        </nav>
        <div class="ml-auto flex items-center gap-4">
          <NuxtLink to="/checkout" class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle rounded-md text-xs font-semibold text-ink no-underline bg-surface-card hover:bg-surface-hover transition-colors">
            <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
            <span>Bag</span>
            <span v-if="cartStore.itemCount > 0" class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-ink text-surface-card text-[11px] font-bold">
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isAuthenticated" to="/account" class="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors no-underline">
            <UIcon name="i-heroicons-user" class="w-4 h-4" />
            {{ authStore.currentCustomer?.full_name }}
          </NuxtLink>
          <NuxtLink v-else to="/account/login" class="text-sm text-ink-secondary hover:text-ink transition-colors no-underline py-1">Sign In</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border-subtle px-4 py-6">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap text-xs text-ink-tertiary">
        <span>© {{ new Date().getFullYear() }} {{ config.public.appName }}</span>
        <WeAcceptPaymentStrip size="sm" :show-label="true" />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const authStore = useStoreAuthStore()
const cartStore = useStoreCartStore()

onMounted(() => {
  cartStore.restoreCart()
  authStore.restoreSession()
  if (authStore.accessToken && !authStore.customer) {
    authStore.fetchCurrentCustomer()
  }
})
</script>
