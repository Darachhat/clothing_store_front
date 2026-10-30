<template>
  <div class="auth-root">
    <div class="auth-card">
      <!-- Tabs -->
      <div class="auth-tabs">
        <button :class="['auth-tab', mode === 'login' && 'auth-tab--active']" @click="mode = 'login'">Sign In</button>
        <button :class="['auth-tab', mode === 'register' && 'auth-tab--active']" @click="mode = 'register'">Create Account</button>
      </div>

      <!-- Login Form -->
      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-sub">Sign in to your account to view your orders.</p>

        <div class="field">
          <label class="field-label" for="login-username">Username</label>
          <input id="login-username" v-model="loginForm.username" type="text" class="field-input" placeholder="your_username" required />
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

const loginForm = reactive({ username: '', password: '' })
const regForm = reactive({ full_name: '', email: '', username: '', password: '' })

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(loginForm.username, loginForm.password)
    await router.push('/')
  } catch (err: any) {
    errorMsg.value = err?.data?.detail || 'Invalid credentials.'
  } finally {
    loading.value = false
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
</script>

<style scoped>
.auth-root { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: var(--space-4); }
.auth-card { width: 100%; max-width: 400px; background: var(--surface-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-4); }
.auth-tabs { display: flex; gap: 4px; margin-bottom: var(--space-3); background: var(--surface-bg); border-radius: var(--radius-md); padding: 4px; }
.auth-tab { flex: 1; height: 32px; border: none; background: none; border-radius: 6px; font-size: 13px; font-family: var(--font-body); color: var(--text-secondary); cursor: pointer; font-weight: 500; }
.auth-tab--active { background: var(--surface-card); color: var(--text-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.auth-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.auth-sub { font-size: 13px; color: var(--text-secondary); margin-top: 4px; margin-bottom: var(--space-3); }
.auth-form { display: flex; flex-direction: column; gap: var(--space-2); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text-primary); max-width: none; }
.field-input { height: 40px; border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 0 12px; font-size: 14px; font-family: var(--font-body); color: var(--text-primary); background: var(--surface-card); outline: none; }
.field-input:focus { border-color: var(--border-strong); }
.field-error { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--status-red-bg); border-radius: var(--radius-md); font-size: 13px; color: var(--status-red); }
.field-success { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--status-green-bg); border-radius: var(--radius-md); font-size: 13px; color: var(--status-green); }
.btn-primary { height: 40px; background: var(--accent); color: var(--accent-fg); border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
