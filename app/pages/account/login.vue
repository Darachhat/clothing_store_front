<template>
  <div class="flex items-center justify-center min-h-[60vh] p-4">
    <div class="w-full max-w-sm bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-card">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-surface-bg rounded-lg p-1">
        <button
          type="button"
          :class="['flex-1 h-8 border-none rounded-md text-xs font-body text-ink-secondary cursor-pointer font-medium transition-all', mode === 'login' && '!bg-surface-card !text-ink font-semibold shadow-xs']"
          @click="mode = 'login'"
        >
          Sign In
        </button>
        <button
          type="button"
          :class="['flex-1 h-8 border-none rounded-md text-xs font-body text-ink-secondary cursor-pointer font-medium transition-all', mode === 'register' && '!bg-surface-card !text-ink font-semibold shadow-xs']"
          @click="mode = 'register'"
        >
          Create Account
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="mode === 'login'">
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-ink">Welcome back</h1>
            <p class="text-xs text-ink-secondary mt-1">Sign in with your username, verified phone, or Telegram.</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-ink" for="login-username">Username or Verified Phone</label>
            <input id="login-username" v-model="loginForm.username" type="text" class="h-10 border border-border-subtle rounded-md px-3 text-sm font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong transition-colors" placeholder="your_username or +855..." required />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-ink" for="login-password">Password</label>
            <input id="login-password" v-model="loginForm.password" type="password" class="h-10 border border-border-subtle rounded-md px-3 text-sm font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong transition-colors" placeholder="••••••••" required />
          </div>
          <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-status-red-bg rounded-md text-xs text-status-red border border-border-subtle">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 shrink-0" /> {{ errorMsg }}
          </div>
          <button type="submit" class="h-10 w-full bg-ink text-white rounded-md text-xs font-semibold font-body cursor-pointer flex items-center justify-center gap-2 mt-1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs" :disabled="loading">
            <UIcon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="flex items-center gap-3 my-4 text-[11px] text-ink-tertiary uppercase before:content-[''] before:flex-1 before:h-px before:bg-border-subtle after:content-[''] after:flex-1 after:h-px after:bg-border-subtle">
          <span>or</span>
        </div>

        <div class="flex flex-col gap-2">
          <button type="button" class="h-9 w-full bg-surface-card text-ink border border-border-subtle rounded-md text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-surface-hover transition-colors" :disabled="loading || appChallengeActive" @click="startTelegramAppLogin">
            <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
            <span>{{ appChallengeActive ? 'Waiting for Telegram App...' : 'Log in with Telegram App' }}</span>
          </button>
          <div v-if="appChallengeActive" class="flex flex-col gap-2 p-3 border border-border-subtle rounded-md bg-surface-bg">
            <div class="text-xs text-ink-secondary">
              {{ appChallengeMessage || "Tap 'Start' in @clothing_store_kvm_bot in your Telegram App..." }}
            </div>
            <div class="flex gap-2">
              <a
                v-if="appChallengeWebUrl"
                :href="appChallengeWebUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 h-8.5 bg-surface-card text-ink border border-border-subtle rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 no-underline hover:bg-surface-hover transition-colors"
              >
                Open in Telegram
              </a>
              <button type="button" class="h-8.5 px-3 bg-surface-card text-ink border border-border-subtle rounded-md text-xs font-semibold cursor-pointer hover:bg-surface-hover transition-colors" @click="cancelTelegramAppLogin">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Register Form -->
      <form v-else class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-ink">Create Account</h1>
          <p class="text-xs text-ink-secondary mt-1">Join us to track your orders and get personalized deals.</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-ink" for="reg-name">Full Name</label>
          <input id="reg-name" v-model="regForm.full_name" type="text" class="h-10 border border-border-subtle rounded-md px-3 text-sm font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong transition-colors" placeholder="John Smith" required />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-ink" for="reg-email">Email</label>
          <input id="reg-email" v-model="regForm.email" type="email" class="h-10 border border-border-subtle rounded-md px-3 text-sm font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong transition-colors" placeholder="you@example.com" required />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-ink" for="reg-username">Username</label>
          <input id="reg-username" v-model="regForm.username" type="text" class="h-10 border border-border-subtle rounded-md px-3 text-sm font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong transition-colors" placeholder="your_username" required />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-ink" for="reg-password">Password</label>
          <input id="reg-password" v-model="regForm.password" type="password" class="h-10 border border-border-subtle rounded-md px-3 text-sm font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong transition-colors" placeholder="Min. 8 characters" required minlength="8" />
        </div>
        <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-status-red-bg rounded-md text-xs text-status-red border border-border-subtle">
          <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 shrink-0" /> {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="flex items-center gap-2 p-3 bg-status-green-bg rounded-md text-xs text-status-green border border-border-subtle">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4 shrink-0" /> {{ successMsg }}
        </div>
        <button type="submit" class="h-10 w-full bg-ink text-white rounded-md text-xs font-semibold font-body cursor-pointer flex items-center justify-center gap-2 mt-1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs" :disabled="loading">
          <UIcon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
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
