<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-ink tracking-tight">My Account</h1>
        <p class="text-xs text-ink-secondary mt-0.5">Manage your profile, verified phone number, Telegram identity, and order history.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border-subtle rounded-md bg-surface-card text-xs font-semibold text-ink cursor-pointer hover:bg-surface-hover transition-colors shadow-xs" @click="handleLogout">
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>

    <div v-if="authStore.currentCustomer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-card border border-border-subtle rounded-2xl shadow-card">
      <div class="flex flex-col gap-1">
        <span class="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">Full Name</span>
        <span class="text-sm font-semibold text-ink">{{ authStore.currentCustomer.full_name }}</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">Username</span>
        <span class="text-sm font-semibold text-ink">@{{ authStore.currentCustomer.username }}</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">Email</span>
        <span class="text-sm font-semibold text-ink truncate">{{ authStore.currentCustomer.email }}</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">Verified Phone</span>
        <span class="text-sm font-semibold text-ink flex items-center gap-2">
          {{ authStore.currentCustomer.phone_number || 'Not linked' }}
          <span v-if="authStore.currentCustomer.phone_verified" class="text-[11px] font-semibold px-2 py-0.5 border border-border-subtle rounded-full text-ink-secondary bg-surface-bg">Verified</span>
        </span>
      </div>
      <div class="flex flex-col gap-1 sm:col-span-2 md:col-span-4">
        <span class="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">Telegram Identity</span>
        <span class="text-sm font-semibold text-ink">
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
    <div v-if="authStore.currentCustomer" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-surface-card border border-border-subtle rounded-2xl shadow-card flex flex-col gap-3">
        <div class="flex items-center gap-2 text-xs font-bold text-ink">
          <UIcon name="i-heroicons-phone" class="w-4 h-4" />
          <span>Link Verified Phone Number</span>
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model="phoneForm.phone_number"
            type="text"
            placeholder="+85569382165 or 069382165"
            class="flex-1 h-9 border border-border-subtle rounded-md px-3 text-xs font-mono bg-surface-card focus:outline-hidden focus:border-border-strong text-ink"
          />
          <button type="button" class="h-9 px-3.5 border border-border-subtle rounded-md bg-surface-card text-xs font-semibold text-ink cursor-pointer hover:bg-surface-hover disabled:opacity-50 transition-colors" :disabled="secLoading" @click="requestOtp">
            Send OTP
          </button>
        </div>
        <div v-if="phoneForm.challengeSent" class="flex items-center gap-2">
          <input
            v-model="phoneForm.otp_code"
            type="text"
            maxlength="6"
            placeholder="6-digit OTP"
            class="flex-1 h-9 border border-border-subtle rounded-md px-3 text-xs font-mono bg-surface-card focus:outline-hidden focus:border-border-strong text-ink"
          />
          <button type="button" class="h-9 px-3.5 border border-border-subtle rounded-md bg-ink text-white text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all shadow-xs" :disabled="secLoading" @click="confirmOtp">
            Verify
          </button>
        </div>
        <p v-if="secMessage" class="text-xs text-ink-secondary">{{ secMessage }}</p>
      </div>

      <div class="p-4 bg-surface-card border border-border-subtle rounded-2xl shadow-card flex flex-col gap-3">
        <div class="flex items-center gap-2 text-xs font-bold text-ink">
          <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
          <span>Telegram Account Linking</span>
        </div>
        <div v-if="authStore.currentCustomer.telegram_id" class="flex items-center justify-between gap-2">
          <span class="text-xs text-ink-secondary">Linked to Telegram ID {{ authStore.currentCustomer.telegram_id }}</span>
          <button type="button" class="h-9 px-3.5 border border-border-subtle rounded-md bg-surface-card text-xs font-semibold text-ink cursor-pointer hover:bg-surface-hover disabled:opacity-50 transition-colors" :disabled="secLoading" @click="unlinkTelegram">
            Unlink
          </button>
        </div>
        <div v-else class="flex flex-col gap-2">
          <button type="button" class="h-9 px-3.5 border border-border-subtle rounded-md bg-ink text-white text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all shadow-xs" :disabled="secLoading" @click="linkTelegram">
            Connect with Telegram
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3 mt-2">
      <h2 class="text-base font-bold text-ink">Order History</h2>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-2 py-12 px-4 bg-surface-card border border-border-subtle rounded-2xl text-ink-secondary text-xs shadow-card">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading orders...</span>
      </div>
      <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center gap-2 py-12 px-4 bg-surface-card border border-border-subtle rounded-2xl text-ink-secondary text-xs shadow-card">
        <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8 text-ink-tertiary" />
        <p>You have not placed any orders yet.</p>
        <NuxtLink to="/products" class="mt-2 px-4 py-2 rounded-md bg-ink text-white text-xs font-semibold no-underline hover:opacity-90 transition-opacity shadow-xs">Start Shopping</NuxtLink>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="order in orders" :key="order.id" class="p-4 bg-surface-card border border-border-subtle rounded-2xl shadow-card flex flex-col gap-2.5">
          <div class="flex items-center justify-between pb-2.5 border-b border-border-subtle">
            <div>
              <span class="text-sm font-bold text-ink mr-2.5 font-mono">{{ order.invoice_number }}</span>
              <span class="text-xs text-ink-tertiary">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-[11px] font-semibold px-2 py-0.5 border border-border-subtle rounded-full text-ink-secondary bg-surface-bg">{{ order.sale_status }}</span>
              <span class="text-sm font-bold text-ink font-mono">${{ Number(order.total || 0).toFixed(2) }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1 text-xs text-ink-secondary">
            <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center">
              <span>{{ item.product_name }} <span v-if="item.color || item.size" class="text-ink-tertiary text-[11px]">({{ [item.color, item.size].filter(Boolean).join(' / ') }})</span> &times; {{ item.quantity }}</span>
              <span class="font-mono">${{ Number(item.subtotal || 0).toFixed(2) }}</span>
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
