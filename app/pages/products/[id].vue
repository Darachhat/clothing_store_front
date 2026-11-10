<template>
  <div>
    <div v-if="pending" class="h-96 bg-surface-hover rounded-xl animate-pulse" />
    <div v-else-if="!product" class="flex flex-col items-center justify-center gap-3 py-20 text-ink-tertiary">
      <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10" />
      <p class="text-sm">Product not found.</p>
      <NuxtLink to="/products" class="text-xs text-ink underline font-medium">Back to catalog</NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Image -->
      <div class="aspect-[3/4] bg-surface-bg border border-border-subtle rounded-xl overflow-hidden relative">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-ink-tertiary">
          <UIcon name="i-heroicons-photo" class="w-16 h-16" />
        </div>
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-4 pt-1">
        <div class="flex items-center gap-2 text-xs text-ink-tertiary">
          <span class="uppercase tracking-wider font-medium">{{ product.category }}</span>
          <span v-if="product.brand" class="text-ink-secondary font-medium">· {{ product.brand }}</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-ink">{{ product.name }}</h1>
        <div v-if="selectedVariant" class="flex items-baseline gap-3 text-2xl font-bold text-ink">
          ${{ Number(selectedVariant.price || 0).toFixed(2) }}
          <span class="text-xs font-normal text-ink-tertiary font-mono">SKU: {{ selectedVariant.sku }}</span>
        </div>
        <p v-if="product.description" class="text-sm text-ink-secondary leading-relaxed">{{ product.description }}</p>

        <!-- Variants -->
        <div v-if="product.variants?.length" class="mt-2">
          <div class="text-xs font-semibold text-ink mb-2 uppercase tracking-wide">Available Options</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in product.variants"
              :key="v.id"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle rounded-md text-xs cursor-pointer bg-surface-card text-ink transition-all hover:bg-surface-hover"
              :class="{ '!bg-ink !text-white !border-border-subtle shadow-xs': selectedVariant?.id === v.id, 'opacity-40 cursor-not-allowed line-through': !v.stock }"
              :disabled="!v.stock"
              @click="selectVariant(v)"
            >
              <span v-if="v.color">{{ v.color }}</span>
              <span v-if="v.size">{{ v.size }}</span>
              <span v-if="v.price != null" class="font-semibold">${{ Number(v.price).toFixed(2) }}</span>
              <span v-if="!v.stock" class="text-[11px] text-status-red">Out of Stock</span>
              <span v-else class="text-[11px] opacity-75">({{ v.stock }} left)</span>
            </button>
          </div>
        </div>

        <!-- Quantity & Add to Bag -->
        <div v-if="selectedVariant && selectedVariant.stock > 0" class="flex items-center gap-3 flex-wrap mt-4">
          <div class="inline-flex items-center border border-border-subtle rounded-md bg-surface-card h-10">
            <button type="button" class="w-9 h-full flex items-center justify-center text-ink hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" :disabled="quantity <= 1" @click="quantity = Math.max(1, quantity - 1)">
              <UIcon name="i-heroicons-minus" class="w-4 h-4" />
            </button>
            <span class="min-w-8 text-center text-xs font-semibold font-mono">{{ quantity }}</span>
            <button
              type="button"
              class="w-9 h-full flex items-center justify-center text-ink hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              :disabled="quantity >= selectedVariant.stock"
              @click="quantity = Math.min(selectedVariant.stock, quantity + 1)"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </button>
          </div>

          <button type="button" class="h-10 px-5 rounded-md border border-border-subtle bg-ink text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shadow-xs" @click="handleAddToCart">
            <UIcon :name="addedFeedback ? 'i-heroicons-check' : 'i-heroicons-shopping-bag'" class="w-4 h-4" />
            <span>{{ addedFeedback ? 'Added to Bag' : 'Add to Bag' }}</span>
          </button>

          <NuxtLink to="/checkout" class="h-10 px-4 rounded-md border border-border-subtle bg-surface-card text-ink text-xs font-semibold inline-flex items-center no-underline hover:bg-surface-hover transition-colors" @click="handleBuyNow">
            <span>Buy Now</span>
          </NuxtLink>
        </div>

        <div class="mt-auto pt-6">
          <NuxtLink to="/products" class="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors no-underline">
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
