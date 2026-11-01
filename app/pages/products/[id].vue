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
        <div v-if="selectedVariant" class="detail-price">
          ${{ Number(selectedVariant.price || 0).toFixed(2) }}
          <span class="detail-sku">SKU: {{ selectedVariant.sku }}</span>
        </div>
        <p v-if="product.description" class="detail-desc">{{ product.description }}</p>

        <!-- Variants -->
        <div v-if="product.variants?.length" class="variants">
          <div class="variants__label">Available Options</div>
          <div class="variants__grid">
            <button
              v-for="v in product.variants"
              :key="v.id"
              type="button"
              class="variant-chip"
              :class="{ 'variant-chip--selected': selectedVariant?.id === v.id, 'variant-chip--oos': !v.stock }"
              :disabled="!v.stock"
              @click="selectVariant(v)"
            >
              <span v-if="v.color">{{ v.color }}</span>
              <span v-if="v.size">{{ v.size }}</span>
              <span v-if="v.price != null" class="variant-chip__price">${{ Number(v.price).toFixed(2) }}</span>
              <span v-if="!v.stock" class="variant-chip__oos">Out of Stock</span>
              <span v-else class="variant-chip__stock">({{ v.stock }} left)</span>
            </button>
          </div>
        </div>

        <!-- Quantity & Add to Bag -->
        <div v-if="selectedVariant && selectedVariant.stock > 0" class="purchase-box">
          <div class="qty-control">
            <button type="button" class="qty-btn" :disabled="quantity <= 1" @click="quantity = Math.max(1, quantity - 1)">
              <UIcon name="i-heroicons-minus" class="w-4 h-4" />
            </button>
            <span class="qty-value">{{ quantity }}</span>
            <button
              type="button"
              class="qty-btn"
              :disabled="quantity >= selectedVariant.stock"
              @click="quantity = Math.min(selectedVariant.stock, quantity + 1)"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </button>
          </div>

          <button type="button" class="btn-add-cart" @click="handleAddToCart">
            <UIcon :name="addedFeedback ? 'i-heroicons-check' : 'i-heroicons-shopping-bag'" class="w-4 h-4" />
            <span>{{ addedFeedback ? 'Added to Bag' : 'Add to Bag' }}</span>
          </button>

          <NuxtLink to="/checkout" class="btn-checkout-now" @click="handleBuyNow">
            <span>Buy Now</span>
          </NuxtLink>
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
const cartStore = useStoreCartStore()

const { data, pending } = await useAsyncData(`product-${route.params.id}`, () =>
  getProduct(route.params.id as string)
)
const product = computed(() => data.value as any)
const selectedVariant = ref<any>(null)
const quantity = ref(1)
const addedFeedback = ref(false)

watch(
  product,
  (val) => {
    if (val?.variants?.length && !selectedVariant.value) {
      selectedVariant.value = val.variants.find((v: any) => v.stock > 0) || val.variants[0]
    }
  },
  { immediate: true }
)

function selectVariant(v: any) {
  selectedVariant.value = v
  quantity.value = 1
}

function handleAddToCart() {
  if (!product.value || !selectedVariant.value || !selectedVariant.value.stock) return
  cartStore.addItem({
    variantId: selectedVariant.value.id,
    productId: product.value.id,
    productName: product.value.name,
    sku: selectedVariant.value.sku,
    color: selectedVariant.value.color,
    size: selectedVariant.value.size,
    unitPrice: Number(selectedVariant.value.price || 0),
    quantity: quantity.value,
    maxStock: Number(selectedVariant.value.stock || 99),
    imageUrl: selectedVariant.value.image_url || product.value.image_url,
  })
  addedFeedback.value = true
  setTimeout(() => {
    addedFeedback.value = false
  }, 1500)
}

function handleBuyNow() {
  if (cartStore.isEmpty) {
    handleAddToCart()
  }
}

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

.detail-image { aspect-ratio: 3/4; background: var(--surface-bg); border: 1px solid var(--border-subtle, #e5e7eb); border-radius: var(--radius-lg); overflow: hidden; }
.detail-image img { width: 100%; height: 100%; object-fit: cover; }
.detail-image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); }

.detail-info { display: flex; flex-direction: column; gap: var(--space-2); padding-top: var(--space-1); }
.detail-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-tertiary); }
.detail-category { text-transform: uppercase; letter-spacing: 0.05em; }
.detail-brand { color: var(--text-secondary); }
.detail-name { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); }
.detail-price { display: flex; align-items: baseline; gap: 10px; font-size: 22px; font-weight: 700; color: var(--text-primary); }
.detail-sku { font-size: 12px; font-weight: 400; color: var(--text-tertiary); }
.detail-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

.variants__label { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 0.01em; }
.variants__grid { display: flex; flex-wrap: wrap; gap: 8px; }
.variant-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-md); font-size: 13px; cursor: pointer;
  background: var(--surface-card); color: var(--text-primary);
  transition: all 0.15s;
}
.variant-chip--selected { background: var(--text-primary); color: white; border-color: var(--border-subtle, #e5e7eb); }
.variant-chip--oos { opacity: 0.5; cursor: not-allowed; text-decoration: line-through; }
.variant-chip__price { font-weight: 600; }
.variant-chip__stock { font-size: 11px; opacity: 0.75; }
.variant-chip__oos { font-size: 11px; color: var(--status-red); }

.purchase-box { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.qty-control {
  display: inline-flex; align-items: center; border: 1px solid var(--border-subtle, #e5e7eb);
  border-radius: var(--radius-md); background: var(--surface-card); height: 40px;
}
.qty-btn {
  width: 36px; height: 100%; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary);
}
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-value { min-width: 32px; text-align: center; font-size: 13px; font-weight: 600; }
.btn-add-cart {
  height: 40px; padding: 0 18px; border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle, #e5e7eb); background: var(--text-primary); color: white;
  font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
}
.btn-checkout-now {
  height: 40px; padding: 0 16px; border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle, #e5e7eb); background: var(--surface-card); color: var(--text-primary);
  font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; text-decoration: none;
}

.detail-actions { margin-top: auto; padding-top: var(--space-2); }
.btn-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); text-decoration: none; }
.btn-back:hover { color: var(--text-primary); }
</style>
