// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
  ],

  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    exposeConfig: false,
  },

  app: {
    head: {
      title: 'Shop — Clothing Store',
      meta: [
        { name: 'description', content: 'Browse our clothing collection.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Inter+Tight:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    apiBase:     process.env.NUXT_API_BASE     || 'http://backend:8000',
    // X-System-Authorization value injected server-side; never sent to browser
    apiBaseAuth: process.env.NUXT_API_BASE_AUTH || '',
    public: {
      apiBase:      process.env.NUXT_PUBLIC_API_BASE      || '/api/proxy',
      backendBase:  process.env.NUXT_PUBLIC_BACKEND_BASE  || 'http://localhost:8000',
      appName:      process.env.NUXT_PUBLIC_APP_NAME      || 'Clothing Store',
      storeDomain:  process.env.NUXT_PUBLIC_STORE_DOMAIN  || 'https://store.example.com',
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  ui: {
    global: true,
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: ['~/assets/css/main.css'],

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  nitro: {
    preset: process.env.NITRO_PRESET || (process.env.CF_PAGES ? 'cloudflare_pages' : 'cloudflare-module'),
  },

  routeRules: {
    '/uploads/**': {
      // @ts-expect-error: 'proxy' is valid at runtime but not in the RouteRules type definition
      proxy: `${process.env.NUXT_API_BASE || 'http://localhost:8000'}/uploads/**`,
    },
  },
})
