// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
    payloadExtraction: false,
    defaults: {
      nuxtLink: {
        prefetch: false,
      },
    },
  },

  hooks: {
    'build:manifest': (manifest) => {
      for (const key in manifest) {
        if (manifest[key]) {
          manifest[key].prefetch = false
        }
      }
    },
  },

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
    apiBase:     process.env.NUXT_API_BASE     || 'https://api.kimvannak.store',
    // X-System-Authorization value injected server-side; never sent to browser
    apiBaseAuth: process.env.NUXT_API_BASE_AUTH || 'Basic d2ViX2Zyb250OmM2MWNlMDdhLTc1YTMtNDFjNi1hYjBkLWFiZWM2NWU0Y2EyNA==',
    public: {
      apiBase:      process.env.NUXT_PUBLIC_API_BASE      || '/api/proxy',
      backendBase:  process.env.NUXT_PUBLIC_BACKEND_BASE  || process.env.NUXT_API_BASE || 'https://api.kimvannak.store',
      appName:      process.env.NUXT_PUBLIC_APP_NAME      || 'Kim Vannak Store',
      storeDomain:  process.env.NUXT_PUBLIC_STORE_DOMAIN  || 'https://kimvannak.store',
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
    compatibilityDate: '2024-11-01',
    cloudflare: {
      deployConfig: false,
    },
  } as any,

  routeRules: {
    '/': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'cdn-cache-control': 'no-store',
        'cloudflare-cdn-cache-control': 'no-store',
      },
    },
    '/products/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'cdn-cache-control': 'no-store',
        'cloudflare-cdn-cache-control': 'no-store',
      },
    },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    ...(process.env.NUXT_API_BASE
      ? {
          '/uploads/**': {
            proxy: `${process.env.NUXT_API_BASE}/uploads/**`,
          },
        }
      : {}),
  } as any,
})
