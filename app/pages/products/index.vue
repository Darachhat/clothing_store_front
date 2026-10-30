<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">All Products</h1>
      <div class="page-search">
        <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 search-icon" />
        <input v-model="search" class="search-input" placeholder="Search products..." @input="debouncedSearch" />
      </div>
    </div>

    <div v-if="pending" class="product-grid">
      <div v-for="i in 12" :key="i" class="product-card-skeleton" />
    </div>

    <div v-else-if="products.length === 0" class="empty-state">
      <UIcon name="i-heroicons-tag" class="w-10 h-10" />
      <p>No products found.</p>
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

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" class="page-btn" @click="page--">
        <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
      </button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" class="page-btn" @click="page++">
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

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2); }
.page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.page-search { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; color: var(--text-tertiary); }
.search-input { height: 36px; padding: 0 12px 0 34px; border: 1px solid var(--border-default); border-radius: var(--radius-md); font-size: 13px; font-family: var(--font-body); color: var(--text-primary); background: var(--surface-card); outline: none; width: 220px; }
.search-input:focus { border-color: var(--border-strong); }

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

.empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: 80px 0; color: var(--text-tertiary); }

.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-4); }
.page-btn { width: 36px; height: 36px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-card); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: var(--text-secondary); min-width: 60px; text-align: center; }
</style>
