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
          <button type="button" class="btn-secondary" :disabled="loading || appChallengeActive" @click="startTelegramAppLogin">
            <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
            <span>{{ appChallengeActive ? 'Waiting for Telegram App...' : 'Log in with Telegram App' }}</span>
          </button>
          <div v-if="appChallengeActive" class="tg-payload-box">
            <div style="font-size: 12px; color: var(--text-secondary);">
              {{ appChallengeMessage || "Tap 'Start' in @clothing_store_kvm_bot in your Telegram App..." }}
            </div>
            <div style="display: flex; gap: 8px;">
              <a
                v-if="appChallengeWebUrl"
                :href="appChallengeWebUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-secondary"
                style="text-decoration: none; height: 34px; font-size: 12px;"
              >
                Open in Telegram
              </a>
              <button type="button" class="btn-secondary" style="height: 34px; font-size: 12px;" @click="cancelTelegramAppLogin">
                Cancel
              </button>
            </div>
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
const telegramBotId = ref<string>('8453886789')
const appChallengeActive = ref(false)
const appChallengeMessage = ref('')
const appChallengeWebUrl = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

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

function extractTelegramRedirectPayload(): Record<string, unknown> | null {
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

function cancelTelegramAppLogin() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  appChallengeActive.value = false
  appChallengeMessage.value = ''
  appChallengeWebUrl.value = ''
}

async function startTelegramAppLogin() {
  if (typeof window === 'undefined') return
  errorMsg.value = ''
  cancelTelegramAppLogin()
  try {
    const ch = await authStore.createTelegramAppChallenge()
    appChallengeActive.value = true
    appChallengeMessage.value = "Tap 'Start' in your Telegram App to sign in..."
    appChallengeWebUrl.value = ch.tg_web_url
    window.location.href = ch.tg_app_url

    pollTimer = setInterval(async () => {
      try {
        const res = await authStore.pollTelegramAppStatus(ch.challenge_token)
        if (res.message) appChallengeMessage.value = res.message
        if (res.status === 'APPROVED') {
          cancelTelegramAppLogin()
          await router.push('/')
        } else if (res.status === 'REJECTED' || res.status === 'EXPIRED') {
          const msg = res.message || 'Telegram login was declined or expired.'
          cancelTelegramAppLogin()
          errorMsg.value = msg
        }
      } catch (err: any) {
        if (err?.status === 403 || err?.statusCode === 403) {
          cancelTelegramAppLogin()
          errorMsg.value = err?.data?.detail || 'Account is not authorized.'
        }
      }
    }, 2000)
  } catch (err: any) {
    errorMsg.value = err?.data?.detail || 'Could not start Telegram App login.'
  }
}

onBeforeUnmount(() => {
  cancelTelegramAppLogin()
})

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
    const redirectedPayload = extractTelegramRedirectPayload()
    if (redirectedPayload) {
      await handleTelegramCallback(redirectedPayload)
      return
    }
  }
  const tgConfig = await authStore.getTelegramConfig()
  if (tgConfig.bot_id) telegramBotId.value = tgConfig.bot_id
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
