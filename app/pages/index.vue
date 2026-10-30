<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">Discover Your Style</h1>
        <p class="hero__sub">Quality clothing for every occasion — browse our latest collection.</p>
        <NuxtLink to="/products" class="hero__cta">
          Shop Now
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- Featured products -->
    <section class="featured">
      <h2 class="featured__title">New Arrivals</h2>
      <div v-if="pending" class="product-grid">
        <div v-for="i in 8" :key="i" class="product-card-skeleton" />
      </div>
      <div v-else class="product-grid">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/products/${product.id}`"
          class="product-card"
        >
          <div class="product-card__image">
            <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
            <div v-else class="product-card__placeholder">
              <UIcon name="i-heroicons-photo" class="w-8 h-8" />
            </div>
          </div>
          <div class="product-card__body">
            <div class="product-card__category">{{ product.category || 'General' }}</div>
            <div class="product-card__name">{{ product.name }}</div>
            <div class="product-card__brand">{{ product.brand }}</div>
          </div>
        </NuxtLink>
      </div>
      <div class="featured__more">
        <NuxtLink to="/products" class="btn-outline">View All Products</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Shop — Clothing Store', meta: [{ name: 'description', content: 'Discover our clothing collection.' }] })
const { listProducts } = useCatalogApi()
const { data, pending } = await useAsyncData('home-products', () => listProducts({ page_size: 8 }))
const products = computed(() => (data.value as any)?.items ?? [])
</script>

<style scoped>
.hero { background: var(--brand-900); border-radius: var(--radius-lg); padding: 64px var(--space-4); margin-bottom: var(--space-5); display: flex; align-items: center; justify-content: center; text-align: center; }
.hero__content { max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
.hero__title { font-size: 40px; font-weight: 800; color: white; letter-spacing: -0.03em; line-height: 1.1; }
.hero__sub { font-size: 16px; color: rgba(255,255,255,0.65); line-height: 1.6; }
.hero__cta { display: inline-flex; align-items: center; gap: 8px; background: white; color: var(--brand-900); padding: 12px 24px; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; text-decoration: none; margin-top: var(--space-1); }
.hero__cta:hover { opacity: 0.88; }
.featured__title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: var(--space-3); }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-2); }
.product-card { background: var(--surface-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; transition: box-shadow 0.15s, transform 0.15s; }
.product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
.product-card__image { aspect-ratio: 4/5; background: var(--surface-bg); overflow: hidden; }
.product-card__image img { width: 100%; height: 100%; object-fit: cover; }
.product-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); }
.product-card__body { padding: 12px; }
.product-card__category { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
.product-card__name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-top: 2px; }
.product-card__brand { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.product-card-skeleton { background: var(--surface-hover); border-radius: var(--radius-lg); aspect-ratio: 4/5; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.featured__more { display: flex; justify-content: center; margin-top: var(--space-4); }
.btn-outline { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border-default); padding: 10px 24px; border-radius: var(--radius-md); font-size: 14px; font-weight: 500; color: var(--text-primary); text-decoration: none; background: var(--surface-card); }
.btn-outline:hover { background: var(--surface-hover); }
</style>
