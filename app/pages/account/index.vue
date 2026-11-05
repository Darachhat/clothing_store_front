<template>
  <div class="account-page">
    <div class="account-header">
      <div>
        <h1 class="account-title">My Account</h1>
        <p class="account-sub">Manage your profile, verified phone number, Telegram identity, and order history.</p>
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
        <span class="profile-val">@{{ authStore.currentCustomer.username }}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Email</span>
        <span class="profile-val">{{ authStore.currentCustomer.email }}</span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Verified Phone</span>
        <span class="profile-val">
          {{ authStore.currentCustomer.phone_number || 'Not linked' }}
          <span v-if="authStore.currentCustomer.phone_verified" class="verified-pill">Verified</span>
        </span>
      </div>
      <div class="profile-item">
        <span class="profile-label">Telegram Identity</span>
        <span class="profile-val">
          {{
            authStore.currentCustomer.telegram_id
              ? authStore.currentCustomer.telegram_username
                ? `@${authStore.currentCustomer.telegram_username}`
                : `ID: ${authStore.currentCustomer.telegram_id}`
              : 'Not linked'
          }}
        </span>
      </div>
    </div>

    <!-- Phone & Telegram Linking Card -->
    <div v-if="authStore.currentCustomer" class="security-grid">
      <div class="security-box">
        <div class="security-box__header">
          <UIcon name="i-heroicons-phone" class="w-4 h-4" />
          <span>Link Verified Phone Number</span>
        </div>
        <div class="security-box__row">
          <input
            v-model="phoneForm.phone_number"
            type="text"
            placeholder="+85569382165 or 069382165"
            class="sec-input"
          />
          <button type="button" class="sec-btn" :disabled="secLoading" @click="requestOtp">
            Send OTP
          </button>
        </div>
        <div v-if="phoneForm.challengeSent" class="security-box__row">
          <input
            v-model="phoneForm.otp_code"
            type="text"
            maxlength="6"
            placeholder="6-digit OTP"
            class="sec-input"
          />
          <button type="button" class="sec-btn sec-btn--primary" :disabled="secLoading" @click="confirmOtp">
            Verify
          </button>
        </div>
        <p v-if="secMessage" class="sec-msg">{{ secMessage }}</p>
      </div>

      <div class="security-box">
        <div class="security-box__header">
          <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
          <span>Telegram Account Linking</span>
        </div>
        <div v-if="authStore.currentCustomer.telegram_id" class="security-box__row">
          <span class="sec-msg">Linked to Telegram ID {{ authStore.currentCustomer.telegram_id }}</span>
          <button type="button" class="sec-btn" :disabled="secLoading" @click="unlinkTelegram">
            Unlink
          </button>
        </div>
        <div v-else class="security-box__col">
          <button type="button" class="sec-btn sec-btn--primary" :disabled="secLoading" @click="linkTelegram">
            Connect with Telegram
          </button>
        </div>
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
              <span>{{ item.product_name }} <span v-if="item.color || item.size" class="order-item-meta">({{ [item.color, item.size].filter(Boolean).join(' / ') }})</span> &times; {{ item.quantity }}</span>
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
const secLoading = ref(false)
const secMessage = ref('')
const telegramPayloadJson = ref('')
const phoneForm = reactive({
  phone_number: '',
  otp_code: '',
  challengeSent: false,
})

onMounted(async () => {
  authStore.restoreSession()
  if (!authStore.accessToken) {
    await router.replace('/account/login')
    return
  }
  await authStore.fetchCurrentCustomer()
  if (!authStore.accessToken || !authStore.currentCustomer) {
    await router.replace('/account/login')
    return
  }
  phoneForm.phone_number = authStore.currentCustomer.phone_number || ''
  const redirectedPayload = extractTelegramRedirectOnAccount()
  if (redirectedPayload) {
    await linkTelegramPayload(redirectedPayload)
  }
  try {
    orders.value = await listMyOrders()
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})

function extractTelegramRedirectOnAccount(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash || ''
  if (hash.includes('tgAuthResult=')) {
    try {
      const encoded = hash.split('tgAuthResult=')[1]?.split('&')[0] || ''
      const normalizedBase64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padded = normalizedBase64 + '='.repeat((4 - (normalizedBase64.length % 4)) % 4)
      const parsed = JSON.parse(atob(padded))
      if (parsed && parsed.id && parsed.hash) {
        window.history.replaceState({}, document.title, window.location.pathname)
        return parsed
      }
    } catch {}
  }
  const params = new URLSearchParams(window.location.search)
  if (params.get('id') && params.get('hash') && params.get('auth_date')) {
    const payload: Record<string, unknown> = {
      id: Number(params.get('id')) || params.get('id'),
      auth_date: Number(params.get('auth_date')),
      hash: params.get('hash'),
    }
    if (params.get('first_name')) payload.first_name = params.get('first_name')
    if (params.get('last_name')) payload.last_name = params.get('last_name')
    if (params.get('username')) payload.username = params.get('username')
    if (params.get('photo_url')) payload.photo_url = params.get('photo_url')
    window.history.replaceState({}, document.title, window.location.pathname)
    return payload
  }
  return null
}

async function linkTelegramPayload(payload: Record<string, unknown>) {
  secLoading.value = true
  secMessage.value = ''
  try {
    await authStore.linkTelegram(payload)
    secMessage.value = 'Telegram account linked.'
  } catch (err: any) {
    secMessage.value = err?.data?.detail || 'Telegram linking failed.'
  } finally {
    secLoading.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  await router.push('/account/login')
}

async function requestOtp() {
  if (!phoneForm.phone_number.trim()) return
  secLoading.value = true
  secMessage.value = ''
  try {
    const res = await authStore.requestPhoneVerification(phoneForm.phone_number.trim())
    phoneForm.phone_number = res.normalized_phone
    phoneForm.challengeSent = true
    secMessage.value = res.message
  } catch (err: any) {
    secMessage.value = err?.data?.detail || 'Failed to request verification code.'
  } finally {
    secLoading.value = false
  }
}

async function confirmOtp() {
  if (!phoneForm.phone_number.trim() || !phoneForm.otp_code.trim()) return
  secLoading.value = true
  secMessage.value = ''
  try {
    await authStore.verifyPhone(phoneForm.phone_number.trim(), phoneForm.otp_code.trim())
    phoneForm.challengeSent = false
    phoneForm.otp_code = ''
    secMessage.value = 'Phone number verified and linked.'
  } catch (err: any) {
    secMessage.value = err?.data?.detail || 'Invalid verification code.'
  } finally {
    secLoading.value = false
  }
}

async function linkTelegram() {
  if (typeof window === 'undefined') return
  secLoading.value = true
  secMessage.value = ''
  try {
    const ch = await authStore.createTelegramAppLinkChallenge()
    window.location.href = ch.tg_app_url
    secMessage.value = "Tap 'Start' in @clothing_store_kvm_bot in your Telegram App to finish linking..."
    let attempts = 0
    const timer = setInterval(async () => {
      attempts++
      if (attempts > 60) {
        clearInterval(timer)
        secLoading.value = false
        return
      }
      try {
        const res = await authStore.pollTelegramAppStatus(ch.challenge_token)
        if (res.status === 'APPROVED') {
          clearInterval(timer)
          secLoading.value = false
          await authStore.fetchCurrentCustomer()
          secMessage.value = 'Telegram account linked!'
        } else if (res.status === 'REJECTED' || res.status === 'EXPIRED') {
          clearInterval(timer)
          secLoading.value = false
          secMessage.value = res.message || 'Telegram link failed.'
        }
      } catch {}
    }, 2000)
  } catch (err: any) {
    secLoading.value = false
    secMessage.value = err?.data?.detail || 'Could not start Telegram link.'
  }
}

async function unlinkTelegram() {
  secLoading.value = true
  secMessage.value = ''
  try {
    await authStore.unlinkTelegram()
  } catch (err: any) {
    secMessage.value = err?.data?.detail || 'Failed to unlink Telegram.'
  } finally {
    secLoading.value = false
  }
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
.profile-val { font-size: 14px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.verified-pill { font-size: 11px; font-weight: 600; padding: 1px 6px; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: 999px; color: var(--text-secondary); }

.security-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); }
.security-box {
  padding: var(--space-3); background: var(--surface-card);
  border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-lg);
  display: flex; flex-direction: column; gap: 10px;
}
.security-box__header { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--text-primary); }
.security-box__row { display: flex; align-items: center; gap: 8px; }
.security-box__col { display: flex; flex-direction: column; gap: 8px; }
.sec-input { flex: 1; height: 36px; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); padding: 0 10px; font-size: 13px; font-family: monospace; }
.sec-textarea { width: 100%; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); padding: 8px; font-size: 11px; font-family: monospace; }
.sec-btn { height: 36px; padding: 0 12px; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); background: var(--surface-card); font-size: 12px; font-weight: 600; cursor: pointer; }
.sec-btn--primary { background: var(--text-primary); color: white; border: none; }
.sec-msg { font-size: 12px; color: var(--text-secondary); }

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
