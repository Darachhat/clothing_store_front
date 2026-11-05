<template>
  <div class="auth-root">
    <div class="auth-card">
      <!-- Tabs -->
      <div class="auth-tabs">
        <button :class="['auth-tab', mode === 'login' && 'auth-tab--active']" @click="mode = 'login'">Sign In</button>
        <button :class="['auth-tab', mode === 'register' && 'auth-tab--active']" @click="mode = 'register'">Create Account</button>
      </div>

      <!-- Login Form -->
      <div v-if="mode === 'login'">
        <form class="auth-form" @submit.prevent="handleLogin">
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-sub">Sign in with your username, verified phone, or Telegram.</p>

          <div class="field">
            <label class="field-label" for="login-username">Username or Verified Phone</label>
            <input id="login-username" v-model="loginForm.username" type="text" class="field-input" placeholder="your_username or +855..." required />
          </div>
          <div class="field">
            <label class="field-label" for="login-password">Password</label>
            <input id="login-password" v-model="loginForm.password" type="password" class="field-input" placeholder="••••••••" required />
          </div>
          <div v-if="errorMsg" class="field-error">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" /> {{ errorMsg }}
          </div>
          <button type="submit" class="btn-primary" :disabled="loading">
            <UIcon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 spin" />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-divider"><span>or</span></div>

        <div class="tg-section">
          <div ref="telegramWidgetContainer" class="tg-widget-box" />
          <button type="button" class="btn-secondary" :disabled="loading" @click="showTelegramInput = !showTelegramInput">
            <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
            <span>Sign in with Telegram</span>
          </button>
          <div v-if="showTelegramInput" class="tg-payload-box">
            <textarea
              v-model="telegramPayloadJson"
              rows="3"
              class="tg-textarea"
              placeholder='{"id": 123456789, "first_name": "Customer", "username": "cust_tg", "auth_date": 1730000000, "hash": "..."}'
            />
            <button type="button" class="btn-primary" :disabled="loading || !telegramPayloadJson.trim()" @click="handleTelegramLogin">
              <UIcon name="i-heroicons-check-badge" class="w-4 h-4" />
              <span>Verify &amp; Sign In</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Register Form -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-sub">Join us to track your orders and get personalized deals.</p>

        <div class="field">
          <label class="field-label" for="reg-name">Full Name</label>
          <input id="reg-name" v-model="regForm.full_name" type="text" class="field-input" placeholder="John Smith" required />
        </div>
        <div class="field">
          <label class="field-label" for="reg-email">Email</label>
          <input id="reg-email" v-model="regForm.email" type="email" class="field-input" placeholder="you@example.com" required />
        </div>
        <div class="field">
          <label class="field-label" for="reg-username">Username</label>
          <input id="reg-username" v-model="regForm.username" type="text" class="field-input" placeholder="your_username" required />
        </div>
        <div class="field">
          <label class="field-label" for="reg-password">Password</label>
          <input id="reg-password" v-model="regForm.password" type="password" class="field-input" placeholder="Min. 8 characters" required minlength="8" />
        </div>
        <div v-if="errorMsg" class="field-error">
          <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" /> {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="field-success">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> {{ successMsg }}
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          <UIcon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 spin" />
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['guest'] })
useHead({ title: 'Account — Clothing Store' })

const authStore = useStoreAuthStore()
const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showTelegramInput = ref(false)
const telegramPayloadJson = ref('')
const telegramWidgetContainer = ref<HTMLElement | null>(null)

const loginForm = reactive({ username: '', password: '' })
const regForm = reactive({ full_name: '', email: '', username: '', password: '' })

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(loginForm.username.trim(), loginForm.password)
    await router.push('/')
  } catch (err: any) {
    errorMsg.value = err?.data?.detail || 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}

async function handleTelegramCallback(payload: Record<string, unknown>) {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.loginWithTelegram(payload)
    await router.push('/')
  } catch (err: any) {
    errorMsg.value = err?.data?.detail || 'Telegram login failed.'
  } finally {
    loading.value = false
  }
}

async function handleTelegramLogin() {
  errorMsg.value = ''
  try {
    const parsed = JSON.parse(telegramPayloadJson.value)
    await handleTelegramCallback(parsed)
  } catch {
    errorMsg.value = 'Invalid Telegram authentication JSON.'
  }
}

async function handleRegister() {
  errorMsg.value = ''; successMsg.value = ''
  loading.value = true
  try {
    await authStore.register(regForm)
    successMsg.value = 'Account created! You can now sign in.'
    mode.value = 'login'
    loginForm.username = regForm.username
  } catch (err: any) {
    errorMsg.value = err?.data?.detail || 'Registration failed.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    ;(window as any).onTelegramAuthStore = (user: Record<string, unknown>) => {
      handleTelegramCallback(user)
    }
  }
  const tgConfig = await authStore.getTelegramConfig()
  if (tgConfig.enabled && tgConfig.bot_username && telegramWidgetContainer.value) {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', tgConfig.bot_username)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuthStore(user)')
    script.setAttribute('data-request-access', 'write')
    telegramWidgetContainer.value.appendChild(script)
  }
})
</script>

<style scoped>
.auth-root { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: var(--space-4); }
.auth-card { width: 100%; max-width: 400px; background: var(--surface-card); border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-lg); padding: var(--space-4); }
.auth-tabs { display: flex; gap: 4px; margin-bottom: var(--space-3); background: var(--surface-bg); border-radius: var(--radius-md); padding: 4px; }
.auth-tab { flex: 1; height: 32px; border: none; background: none; border-radius: 6px; font-size: 13px; font-family: var(--font-body); color: var(--text-secondary); cursor: pointer; font-weight: 500; }
.auth-tab--active { background: var(--surface-card); color: var(--text-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.auth-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.auth-sub { font-size: 13px; color: var(--text-secondary); margin-top: 4px; margin-bottom: var(--space-3); }
.auth-form { display: flex; flex-direction: column; gap: var(--space-2); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text-primary); max-width: none; }
.field-input { height: 40px; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); padding: 0 12px; font-size: 14px; font-family: var(--font-body); color: var(--text-primary); background: var(--surface-card); outline: none; }
.field-input:focus { border-color: var(--border-subtle, #e2e8f0); }
.field-error { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--status-red-bg); border-radius: var(--radius-md); font-size: 13px; color: var(--status-red); }
.field-success { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--status-green-bg); border-radius: var(--radius-md); font-size: 13px; color: var(--status-green); }
.btn-primary { height: 40px; width: 100%; background: var(--accent); color: var(--accent-fg); border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { height: 38px; width: 100%; background: var(--surface-card); color: var(--text-primary); border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-divider { display: flex; align-items: center; gap: 10px; margin: 12px 0; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; }
.auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle, #e5e7eb); }
.tg-section { display: flex; flex-direction: column; gap: 8px; }
.tg-widget-box { display: flex; justify-content: center; }
.tg-payload-box { display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); }
.tg-textarea { width: 100%; border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-md); padding: 8px; font-family: monospace; font-size: 11px; resize: vertical; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
