<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <h1 class="text-2xl font-bold tracking-tight text-ink">All Products</h1>
      <div class="relative flex items-center">
        <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 absolute left-3 text-ink-tertiary pointer-events-none" />
        <input
          v-model="search"
          class="h-9 pl-9 pr-3 border border-border-default rounded-md text-xs font-body text-ink bg-surface-card focus:outline-hidden focus:border-border-strong w-56 transition-colors"
          placeholder="Search products..."
          @input="debouncedSearch"
        />
      </div>
    </div>

    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="i in 12" :key="i" class="bg-surface-hover rounded-xl aspect-[4/5] animate-pulse" />
    </div>

    <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center gap-3 py-20 text-ink-tertiary">
      <UIcon name="i-heroicons-tag" class="w-10 h-10" />
      <p class="text-sm">No products found.</p>
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

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button :disabled="page <= 1" class="w-9 h-9 border border-border-default rounded-md bg-surface-card flex items-center justify-center text-ink hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" @click="page--">
        <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
      </button>
      <span class="text-xs text-ink-secondary min-w-16 text-center font-mono">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" class="w-9 h-9 border border-border-default rounded-md bg-surface-card flex items-center justify-center text-ink hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" @click="page++">
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Products — Clothing Store' })

const search = ref('')
const page = ref(1)
const { listProducts } = useCatalogApi()

const { data, pending, refresh } = await useAsyncData(
  'store-products',
  () => listProducts({ search: search.value || undefined, page: page.value, page_size: 24 }),
  { watch: [page] }
)

const products = computed(() => (data.value as any)?.items ?? [])
const totalPages = computed(() => (data.value as any)?.pages ?? 1)

let searchTimer: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    refresh()
  }, 350)
}
</script>
