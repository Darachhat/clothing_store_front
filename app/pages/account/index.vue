<template>
  <div class="account-page">
    <div class="account-header">
      <div>
        <h1 class="account-title">My Account</h1>
        <p class="account-sub">Manage your profile and view your order history.</p>
      </div>
      <button type="button" class="btn-logout" @click="handleLogout">
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>

    <div v-if="authStore.currentCustomer" class="profile-card">
      <div class="profile-item">
        <span class="profile-label">Full Name</span>
        <span class="profile-val">{{ authStore.currentCustomer.full_name }}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Username</span>
        <span class="profile-val">{{ authStore.currentCustomer.username }}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Email</span>
        <span class="profile-val">{{ authStore.currentCustomer.email }}</span>
      </div>
    </div>

    <div class="orders-section">
      <h2 class="section-title">Order History</h2>

      <div v-if="loading" class="empty-state">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading orders...</span>
      </div>
      <div v-else-if="orders.length === 0" class="empty-state">
        <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8" />
        <p>You have not placed any orders yet.</p>
        <NuxtLink to="/products" class="btn-shop">Start Shopping</NuxtLink>
      </div>
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-card__top">
            <div>
              <span class="order-inv">{{ order.invoice_number }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-badges">
              <span class="order-badge">{{ order.sale_status }}</span>
              <span class="order-total">${{ Number(order.total || 0).toFixed(2) }}</span>
            </div>
          </div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item-row">
              <span>{{ item.product_name }} <span v-if="item.color || item.size" class="order-item-meta">({{ [item.color, item.size].filter(Boolean).join(' / ') }})</span> × {{ item.quantity }}</span>
              <span>${{ Number(item.subtotal || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'My Account — Clothing Store' })

const authStore = useStoreAuthStore()
const router = useRouter()
const { listMyOrders } = useStoreOrdersApi()

const orders = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  authStore.restoreSession()
  if (!authStore.accessToken) {
    await router.replace('/account/login')
    return
  }
  await authStore.fetchCurrentCustomer()
  try {
    orders.value = await listMyOrders()
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})

async function handleLogout() {
  authStore.logout()
  await router.push('/account/login')
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.account-page { display: flex; flex-direction: column; gap: var(--space-4); }
.account-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
.account-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }
.account-sub { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
.btn-logout {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-md); background: var(--surface-card);
  font-size: 13px; font-weight: 600; color: var(--text-primary); cursor: pointer;
}
.profile-card {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-3); padding: var(--space-3);
  background: var(--surface-card); border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-lg);
}
.profile-item { display: flex; flex-direction: column; gap: 4px; }
.profile-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-tertiary); }
.profile-val { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.orders-section { display: flex; flex-direction: column; gap: var(--space-2); }
.section-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 48px 16px; background: var(--surface-card);
  border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-lg);
  color: var(--text-secondary); font-size: 13px;
}
.btn-shop {
  margin-top: 4px; padding: 8px 16px; border-radius: var(--radius-md);
  background: var(--text-primary); color: white; font-size: 13px; font-weight: 600; text-decoration: none;
}
.orders-list { display: flex; flex-direction: column; gap: 12px; }
.order-card {
  padding: var(--space-3); background: var(--surface-card);
  border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-lg);
  display: flex; flex-direction: column; gap: 10px;
}
.order-card__top {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle, #e5e7eb);
}
.order-inv { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-right: 10px; }
.order-date { font-size: 12px; color: var(--text-tertiary); }
.order-badges { display: flex; align-items: center; gap: 10px; }
.order-badge {
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  border: 1px solid var(--border-subtle, #e5e7eb); border-radius: 999px;
}
.order-total { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.order-items { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--text-secondary); }
.order-item-row { display: flex; justify-content: space-between; }
.order-item-meta { color: var(--text-tertiary); font-size: 12px; }
</style>

