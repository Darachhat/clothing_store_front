<template>
  <div class="store-shell">
    <!-- Top navbar -->
    <header class="store-nav">
      <div class="store-nav__inner">
        <NuxtLink to="/" class="store-nav__brand">
          <UIcon name="i-heroicons-building-storefront" class="w-5 h-5" />
          {{ config.public.appName }}
        </NuxtLink>
        <nav class="store-nav__links">
          <NuxtLink to="/products" class="store-nav__link">Shop</NuxtLink>
        </nav>
        <div class="store-nav__actions">
          <NuxtLink v-if="authStore.isAuthenticated" to="/account" class="store-nav__user">
            <UIcon name="i-heroicons-user" class="w-4 h-4" />
            {{ authStore.currentCustomer?.full_name }}
          </NuxtLink>
          <NuxtLink v-else to="/account/login" class="store-nav__link">Sign In</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="store-main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="store-footer">
      <div class="store-footer__inner">
        <span>© {{ new Date().getFullYear() }} {{ config.public.appName }}</span>
        <WeAcceptPaymentStrip size="sm" :show-label="true" />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const authStore = useStoreAuthStore()

onMounted(() => {
  authStore.restoreSession()
  if (authStore.accessToken && !authStore.customer) {
    authStore.fetchCurrentCustomer()
  }
})
</script>

<style scoped>
.store-shell { display: flex; flex-direction: column; min-height: 100dvh; background: var(--surface-bg); }

.store-nav {
  position: sticky; top: 0; z-index: 100;
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-subtle);
}
.store-nav__inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; gap: var(--space-3);
  padding: 0 var(--space-2); height: 56px;
}
.store-nav__brand {
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 15px; color: var(--text-primary);
  text-decoration: none; letter-spacing: -0.01em;
}
.store-nav__links { display: flex; gap: var(--space-2); margin-left: var(--space-2); }
.store-nav__link {
  font-size: 14px; color: var(--text-secondary); text-decoration: none;
  padding: 4px 0;
}
.store-nav__link:hover { color: var(--text-primary); }
.store-nav__actions { margin-left: auto; display: flex; align-items: center; gap: var(--space-2); }
.store-nav__user { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); text-decoration: none; }
.store-nav__user:hover { color: var(--text-primary); }

.store-main { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: var(--space-4) var(--space-2); }

.store-footer { border-top: 1px solid var(--border-subtle); padding: var(--space-3) var(--space-2); }
.store-footer__inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; font-size: 12px; color: var(--text-tertiary); }
</style>
