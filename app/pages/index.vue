<template>
  <div>
    <!-- Hero -->
    <section class="bg-brand-900 rounded-2xl py-16 px-6 mb-10 flex items-center justify-center text-center text-white">
      <div class="max-w-xl flex flex-col items-center gap-3">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">Discover Your Style</h1>
        <p class="text-base text-white/70 max-w-lg leading-relaxed">Quality clothing for every occasion — browse our latest collection.</p>
        <NuxtLink to="/products" class="inline-flex items-center gap-2 bg-white text-brand-900 px-6 py-3 rounded-md font-semibold text-sm no-underline mt-2 hover:opacity-90 transition-opacity">
          Shop Now
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- Featured products -->
    <section>
      <h2 class="text-xl md:text-2xl font-bold tracking-tight mb-6 text-ink">New Arrivals</h2>
      <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="bg-surface-hover rounded-xl aspect-[4/5] animate-pulse" />
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/products/${product.id}`"
          class="group bg-surface-card border border-border-subtle rounded-xl overflow-hidden no-underline transition-all duration-150 hover:shadow-card hover:-translate-y-0.5"
        >
          <div class="aspect-[4/5] bg-surface-bg overflow-hidden relative">
            <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="w-full h-full flex items-center justify-center text-ink-tertiary">
              <UIcon name="i-heroicons-photo" class="w-8 h-8" />
            </div>
          </div>
          <div class="p-3">
            <div class="text-[11px] text-ink-tertiary uppercase tracking-wider font-medium">{{ product.category || 'General' }}</div>
            <div class="text-sm font-semibold text-ink mt-0.5 truncate">{{ product.name }}</div>
            <div class="text-xs text-ink-secondary mt-0.5 truncate">{{ product.brand }}</div>
          </div>
        </NuxtLink>
      </div>
      <div class="flex justify-center mt-8">
        <NuxtLink to="/products" class="inline-flex items-center gap-2 border border-border-default px-6 py-2.5 rounded-md text-sm font-medium text-ink no-underline bg-surface-card hover:bg-surface-hover transition-colors">
          View All Products
        </NuxtLink>
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
