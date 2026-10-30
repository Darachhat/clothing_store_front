<template>
  <div>
    <div v-if="pending" class="detail-skeleton" />
    <div v-else-if="!product" class="not-found">
      <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10" />
      <p>Product not found.</p>
      <NuxtLink to="/products" class="btn-link">Back to catalog</NuxtLink>
    </div>
    <div v-else class="detail-root">
      <!-- Image -->
      <div class="detail-image">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
        <div v-else class="detail-image-placeholder">
          <UIcon name="i-heroicons-photo" class="w-16 h-16" />
        </div>
      </div>

      <!-- Info -->
      <div class="detail-info">
        <div class="detail-meta">
          <span class="detail-category">{{ product.category }}</span>
          <span v-if="product.brand" class="detail-brand">· {{ product.brand }}</span>
        </div>
        <h1 class="detail-name">{{ product.name }}</h1>
        <p v-if="product.description" class="detail-desc">{{ product.description }}</p>

        <!-- Variants -->
        <div v-if="product.variants?.length" class="variants">
          <div class="variants__label">Available Options</div>
          <div class="variants__grid">
            <div
              v-for="v in product.variants"
              :key="v.id"
              class="variant-chip"
              :class="{ 'variant-chip--selected': selectedVariant?.id === v.id, 'variant-chip--oos': !v.stock }"
              @click="selectedVariant = v"
            >
              <span v-if="v.color">{{ v.color }}</span>
              <span v-if="v.size">{{ v.size }}</span>
              <span v-if="v.price" class="variant-chip__price">${{ v.price.toFixed(2) }}</span>
              <span v-if="!v.stock" class="variant-chip__oos">Out of Stock</span>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <NuxtLink to="/products" class="btn-back">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            Back to catalog
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getProduct } = useCatalogApi()

const { data, pending } = await useAsyncData(`product-${route.params.id}`, () =>
  getProduct(route.params.id as string)
)
const product = computed(() => data.value as any)
const selectedVariant = ref<any>(null)

useHead(() => ({
  title: product.value ? `${product.value.name} — Clothing Store` : 'Product',
}))
</script>

<style scoped>
.detail-skeleton { height: 400px; background: var(--surface-hover); border-radius: var(--radius-lg); animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

.not-found { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: 80px 0; color: var(--text-tertiary); }
.btn-link { font-size: 13px; color: var(--text-primary); text-decoration: underline; }

.detail-root { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
@media (max-width: 640px) { .detail-root { grid-template-columns: 1fr; } }

.detail-image { aspect-ratio: 3/4; background: var(--surface-bg); border-radius: var(--radius-lg); overflow: hidden; }
.detail-image img { width: 100%; height: 100%; object-fit: cover; }
.detail-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); }

.detail-info { display: flex; flex-direction: column; gap: var(--space-2); padding-top: var(--space-1); }
.detail-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-tertiary); }
.detail-category { text-transform: uppercase; letter-spacing: 0.05em; }
.detail-brand { color: var(--text-secondary); }
.detail-name { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); }
.detail-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

.variants__label { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 0.01em; }
.variants__grid { display: flex; flex-wrap: wrap; gap: 8px; }
.variant-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border: 1px solid var(--border-default);
  border-radius: var(--radius-md); font-size: 13px; cursor: pointer;
  background: var(--surface-card); color: var(--text-primary);
  transition: all 0.15s;
}
.variant-chip:hover { border-color: var(--border-strong); }
.variant-chip--selected { border-color: var(--text-primary); background: var(--text-primary); color: white; }
.variant-chip--oos { opacity: 0.5; cursor: not-allowed; text-decoration: line-through; }
.variant-chip__price { font-weight: 600; }
.variant-chip__oos { font-size: 11px; color: var(--status-red); }

.detail-actions { margin-top: auto; padding-top: var(--space-2); }
.btn-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); text-decoration: none; }
.btn-back:hover { color: var(--text-primary); }
</style>
