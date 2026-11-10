<template>
  <div class="checkout-page max-w-4xl mx-auto py-6 px-4">
    <!-- Success Celebration Modal -->
    <Teleport to="body">
      <div
        v-if="isPaidSuccess"
        class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
      >
        <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150 border border-gray-200/80">
          <div class="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 text-gray-900 flex items-center justify-center shadow-inner mb-4">
            <UIcon name="i-heroicons-check" class="w-10 h-10" />
          </div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Payment Successful!</h2>
          <p class="text-xs text-gray-500 mt-1 max-w-xs">
            Order <strong v-if="createdOrder?.invoice_number">{{ createdOrder.invoice_number }}</strong> confirmed.
          </p>
          <div class="my-4 py-2.5 px-6 rounded-xl bg-gray-50 border border-gray-200 text-base font-mono font-bold text-gray-900">
            Paid ${{ Number(createdOrder?.total ?? paidAmountSnapshot).toFixed(2) }} ({{ (Number(createdOrder?.total ?? paidAmountSnapshot) * 4100).toLocaleString() }} ៛)
          </div>
          <div class="flex flex-col gap-2 w-full mt-2">
            <button
              type="button"
              class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              @click="downloadReceipt"
            >
              <UIcon name="i-heroicons-printer" class="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <NuxtLink
              to="/products"
              class="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors text-center cursor-pointer shadow-xs"
            >
              Continue Shopping
            </NuxtLink>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- PayWay KHQR / Card Modal Overlay -->
    <Teleport to="body">
      <div
        v-if="isAbaModalOpen"
        class="fixed inset-0 z-50 bg-black/65 flex flex-col items-center justify-center p-4 backdrop-blur-xs"
      >
        <div class="flex items-center gap-2 mb-3 text-white/90">
          <img src="/images/payments/aba.svg" alt="ABA" class="h-5 w-8 object-contain rounded bg-white p-0.5" >
          <span class="text-xs font-bold tracking-widest uppercase">PAYWAY</span>
          <span class="text-[10px] text-gray-400">powered by ABA Bank</span>
        </div>

        <div class="bg-white rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden flex flex-col border border-gray-200/90 animate-in zoom-in-95 duration-150">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-900 tracking-tight">
                {{ selectedMethod === 'ABA_KHQR' ? 'KHQR Checkout' : selectedMethodLabel }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <div v-if="selectedMethod === 'ABA_KHQR'" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200/80 text-[11px] font-mono font-semibold text-gray-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{{ countdownFormatted }}</span>
              </div>
              <button
                type="button"
                class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                @click="closePaymentModal"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="p-5 flex flex-col items-center">
            <div v-if="orderError" class="w-full mb-3 p-2.5 rounded-lg bg-gray-100 border border-gray-200 text-xs text-red-600 flex items-center gap-1.5">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 shrink-0" />
              <span>{{ orderError }}</span>
            </div>

            <!-- Mode 1: KHQR Ticket Display -->
            <template v-if="selectedMethod === 'ABA_KHQR'">
              <div class="w-full bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 flex flex-col items-center text-center">
                <div class="w-full py-2.5 px-4 rounded-xl bg-[#E1232E] text-white flex items-center justify-center shadow-2xs mb-2.5">
                  <img src="/images/payments/khqr.svg" alt="KHQR" class="h-7 object-contain" >
                </div>

                <span class="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  STAR BOUTIQUE STORE
                </span>
                <div class="my-1.5 flex flex-col items-center">
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-black font-mono text-gray-900">
                      ${{ totalAmount.toFixed(2) }}
                    </span>
                    <span class="text-xs font-bold text-gray-400 font-mono">USD</span>
                  </div>
                  <span class="text-[11px] font-mono text-gray-500">
                    &approx; {{ (totalAmount * 4100).toLocaleString() }} ៛ (4,100 KHR/USD)
                  </span>
                </div>

                <div class="w-full border-b border-dashed border-gray-200 my-2" />

                <div class="w-full aspect-square bg-white rounded-xl border border-gray-200/90 shadow-inner p-2 flex items-center justify-center relative my-1">
                  <div v-if="khqrLoading" class="flex flex-col items-center gap-2 text-xs text-gray-500">
                    <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-700" />
                    <span>Generating ABA KHQR...</span>
                  </div>
                  <img
                    v-else-if="khqrImageUrl"
                    :src="khqrImageUrl"
                    alt="ABA KHQR Code"
                    class="w-full h-full object-contain rounded-lg"
                  >
                  <div v-else class="flex flex-col items-center gap-2 text-xs text-gray-500 text-center px-4">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-gray-700" />
                    <span>QR code unavailable. Close this window and try again.</span>
                  </div>
                </div>

                <span v-if="khqrTranId" class="text-[10px] font-mono text-gray-400 mt-1">
                  Ref: {{ khqrTranId }} &bull; Auto-checking payment status...
                </span>
                <span class="text-[11px] text-gray-600 mt-1 text-center leading-relaxed">
                  Scan with <strong>ABA Mobile</strong>, <strong>Bakong</strong>, or any banking app that supports KHQR
                </span>

                <button
                  type="button"
                  :disabled="submitting"
                  class="mt-4 w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  @click="submitOrderAndComplete"
                >
                  <UIcon :name="submitting ? 'i-heroicons-arrow-path' : 'i-heroicons-device-phone-mobile'" class="w-4 h-4" :class="{ 'animate-spin': submitting }" />
                  <span>{{ submitting ? 'Processing Order...' : 'Confirm Payment & Complete Order' }}</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-black text-gray-900 tracking-tight">Your Bag &amp; Checkout</h1>
      <p class="text-xs text-gray-500 mt-1">
        Review your items, enter delivery details, and select your payment method.
      </p>
    </div>

    <!-- Empty Bag State -->
    <div
      v-if="cartStore.isEmpty && !isPaidSuccess"
      class="p-12 bg-white border border-gray-200/90 rounded-2xl text-center flex flex-col items-center gap-3"
    >
      <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10 text-gray-400" />
      <p class="text-sm font-semibold text-gray-900">Your shopping bag is empty</p>
      <p class="text-xs text-gray-500">Explore the catalog and add items to your bag before checking out.</p>
      <NuxtLink
        to="/products"
        class="mt-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
      >
        Browse Products
      </NuxtLink>
    </div>

    <!-- Main Grid: Items & Shipping (Left) + Payment Method (Right) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Left Column: Bag Summary & Shipping -->
      <div class="md:col-span-7 flex flex-col gap-4">
        <div class="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-gray-100">
            <span class="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Order Summary ({{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'Item' : 'Items' }})
            </span>
            <button
              type="button"
              class="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
              @click="cartStore.clearCart()"
            >
              <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
              <span>Clear Bag</span>
            </button>
          </div>

          <!-- Dynamic Cart Items -->
          <div
            v-for="item in cartStore.items"
            :key="item.variantId"
            class="flex items-center gap-3 py-2 border-b border-gray-100"
          >
            <div class="w-14 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 overflow-hidden">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.productName" class="w-full h-full object-cover" >
              <UIcon v-else name="i-heroicons-photo" class="w-6 h-6" />
            </div>
            <div class="flex-1 flex flex-col">
              <span class="text-xs font-bold text-gray-900">{{ item.productName }}</span>
              <span class="text-[11px] text-gray-500">
                <template v-if="item.color">Color: {{ item.color }}</template>
                <template v-if="item.color && item.size"> &bull; </template>
                <template v-if="item.size">Size: {{ item.size }}</template>
              </span>
              <span class="text-xs font-mono font-bold text-gray-900 mt-1">${{ item.unitPrice.toFixed(2) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
                @click="cartStore.updateQuantity(item.variantId, item.quantity - 1)"
              >
                <UIcon name="i-heroicons-minus" class="w-3 h-3" />
              </button>
              <span class="text-xs font-mono font-semibold w-5 text-center">{{ item.quantity }}</span>
              <button
                type="button"
                class="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer"
                @click="cartStore.updateQuantity(item.variantId, item.quantity + 1)"
              >
                <UIcon name="i-heroicons-plus" class="w-3 h-3" />
              </button>
              <button
                type="button"
                class="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 cursor-pointer ml-1"
                @click="cartStore.removeItem(item.variantId)"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Price Calculation -->
          <div class="pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-xs text-gray-600">
            <div class="flex items-center justify-between">
              <span>Subtotal</span>
              <span class="font-mono text-gray-900 font-semibold">${{ cartStore.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="appliedDiscount > 0" class="flex items-center justify-between text-gray-900">
              <span>Promo Discount ({{ appliedCouponCode }})</span>
              <span class="font-mono font-semibold">-${{ appliedDiscount.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Shipping</span>
              <span class="text-emerald-600 font-semibold">Free Delivery</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
              <span>Total Amount</span>
              <div class="flex flex-col items-end">
                <span class="font-mono text-base font-black text-gray-900">${{ totalAmount.toFixed(2) }}</span>
                <span class="text-[10px] font-mono text-gray-400 font-normal">&approx; {{ (totalAmount * 4100).toLocaleString() }} ៛</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery & Contact Details -->
        <div class="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs flex flex-col gap-3">
          <span class="text-xs font-bold text-gray-900 uppercase tracking-wider">Delivery &amp; Contact Information</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-gray-700">Full Name</label>
              <input
                v-model="customerForm.name"
                type="text"
                placeholder="Customer Name"
                class="h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none"
              >
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-gray-700">Phone Number</label>
              <input
                v-model="customerForm.phone"
                type="tel"
                placeholder="012 345 678"
                class="h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none"
              >
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-gray-700">Delivery Address</label>
              <input
                v-model="customerForm.address"
                type="text"
                placeholder="Street, Sangkat, Khan, City"
                class="h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none"
              >
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-semibold text-gray-700">Coupon Code (Optional)</label>
              <div class="flex items-center gap-1.5">
                <input
                  v-model="customerForm.couponCode"
                  type="text"
                  placeholder="SAVE10"
                  class="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-xs font-mono outline-none uppercase"
                  @keyup.enter="handleApplyCoupon"
                >
                <button
                  type="button"
                  :disabled="validatingCoupon || !customerForm.couponCode.trim()"
                  class="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-800 cursor-pointer disabled:opacity-50"
                  @click="handleApplyCoupon"
                >
                  {{ validatingCoupon ? '...' : 'Apply' }}
                </button>
              </div>
              <span v-if="couponMessage" class="text-[11px]" :class="appliedDiscount > 0 ? 'text-gray-900 font-medium' : 'text-red-600'">
                {{ couponMessage }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Choose Way to Pay -->
      <div class="md:col-span-5 flex flex-col gap-4">
        <div class="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs flex flex-col gap-4">
          <PaymentMethodSelector
            v-model="selectedMethod"
            :amount="totalAmount"
            store-name="STAR BOUTIQUE STORE"
            qr-image="/images/payments/aba-khqr-sample.png"
          />

          <button
            type="button"
            class="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
            @click="handlePayClick"
          >
            <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
            <span>Pay ${{ totalAmount.toFixed(2) }} with {{ selectedMethodLabel }}</span>
          </button>

          <div class="pt-3 border-t border-gray-100 flex flex-col items-center gap-1.5">
            <WeAcceptPaymentStrip :show-label="true" size="sm" />
            <span class="text-[10px] text-gray-400">Guaranteed 256-bit SSL encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

useHead({
  title: 'Checkout — Star Boutique',
})

const cartStore = useStoreCartStore()
const authStore = useStoreAuthStore()
const { createOrder, createOrderKhqr, getOrderPaymentStatus, completeOrder, validateCoupon } = useStoreOrdersApi()

const selectedMethod = ref('ABA_KHQR')
const isAbaModalOpen = ref(false)
const isPaidSuccess = ref(false)
const submitting = ref(false)
const orderError = ref('')
const createdOrder = ref<any>(null)
const paidAmountSnapshot = ref(0)

// Coupon state
const validatingCoupon = ref(false)
const appliedDiscount = ref(0)
const appliedCouponCode = ref('')
const couponMessage = ref('')

// Live KHQR & Polling state
const khqrLoading = ref(false)
const khqrImageUrl = ref<string | null>(null)
const khqrTranId = ref<string | null>(null)
const activeDraftOrderId = ref<string | null>(null)
const activePaymentId = ref<string | null>(null)
const countdownSeconds = ref(180)
let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const countdownFormatted = computed(() => {
  const mins = Math.floor(countdownSeconds.value / 60)
  const secs = countdownSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const customerForm = reactive({
  name: '',
  phone: '',
  address: '',
  couponCode: '',
})

onMounted(() => {
  cartStore.restoreCart()
  if (authStore.currentCustomer) {
    customerForm.name = authStore.currentCustomer.full_name || ''
  }
})

onBeforeUnmount(() => {
  stopPollingTimers()
})

function stopPollingTimers() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function closePaymentModal() {
  stopPollingTimers()
  isAbaModalOpen.value = false
}

const totalAmount = computed(() => Math.max(0, cartStore.subtotal - appliedDiscount.value))

async function handleApplyCoupon() {
  const code = customerForm.couponCode.trim()
  if (!code || cartStore.isEmpty) return
  validatingCoupon.value = true
  couponMessage.value = ''
  try {
    const res = await validateCoupon(code, cartStore.subtotal)
    if (res.valid) {
      appliedDiscount.value = Number(res.discount_amount || 0)
      appliedCouponCode.value = res.code || code.toUpperCase()
      couponMessage.value = res.message || `Coupon ${appliedCouponCode.value} applied!`
    } else {
      appliedDiscount.value = 0
      appliedCouponCode.value = ''
      couponMessage.value = res.message || 'Invalid or expired coupon code.'
    }
  } catch (err: any) {
    appliedDiscount.value = 0
    appliedCouponCode.value = ''
    couponMessage.value = err?.data?.detail || 'Invalid or expired coupon code.'
  } finally {
    validatingCoupon.value = false
  }
}

const selectedMethodLabel = computed(() => 'ABA KHQR')

async function handlePayClick() {
  orderError.value = ''
  isAbaModalOpen.value = true

  if (selectedMethod.value === 'ABA_KHQR' && !cartStore.isEmpty) {
    await initializeKhqrSession()
  }
}

async function initializeKhqrSession() {
  stopPollingTimers()
  khqrLoading.value = true
  orderError.value = ''
  paidAmountSnapshot.value = totalAmount.value
  countdownSeconds.value = 180

  try {
    // Create or reuse a DRAFT order for KHQR generation
    if (!activeDraftOrderId.value) {
      const draftOrder: any = await createOrder({
        items: cartStore.items.map((i) => ({
          variant_id: i.variantId,
          quantity: i.quantity,
        })),
        payment_method: 'ABA_KHQR',
        customer_name: customerForm.name || undefined,
        customer_email: authStore.currentCustomer?.email || undefined,
        customer_phone: customerForm.phone || undefined,
        shipping_address: customerForm.address || undefined,
        coupon_code: customerForm.couponCode.trim() || undefined,
        create_draft: true,
      })
      activeDraftOrderId.value = draftOrder.id
      createdOrder.value = draftOrder
    }

    const khqrRes = await createOrderKhqr(activeDraftOrderId.value!)
    khqrImageUrl.value = khqrRes.qr_image || null
    khqrTranId.value = khqrRes.tran_id || null
    activePaymentId.value = khqrRes.payment_id || null

    // Start countdown & 3s payment status polling
    countdownTimer = setInterval(() => {
      if (countdownSeconds.value > 0) {
        countdownSeconds.value -= 1
      } else {
        stopPollingTimers()
      }
    }, 1000)

    pollTimer = setInterval(async () => {
      if (!activeDraftOrderId.value) return
      try {
        const statusRes = await getOrderPaymentStatus(
          activeDraftOrderId.value,
          activePaymentId.value || undefined
        )
        if (
          statusRes.payment_status === 'PAID' ||
          statusRes.transaction_status === 'APPROVED'
        ) {
          stopPollingTimers()
          const completed = await completeOrder(activeDraftOrderId.value, 'ABA_KHQR')
          createdOrder.value = completed
          activeDraftOrderId.value = null
          cartStore.clearCart()
          isAbaModalOpen.value = false
          isPaidSuccess.value = true
        }
      } catch {
        // Ignore transient poll errors
      }
    }, 3000)
  } catch (err: any) {
    orderError.value = err?.data?.detail || err?.message || 'Failed to initialize KHQR session.'
  } finally {
    khqrLoading.value = false
  }
}

async function submitOrderAndComplete() {
  // Only reachable for ABA KHQR: the order must already exist as a DRAFT and the server
  // confirms payment with ABA (HTTP 402 if not yet paid). We never claim success locally.
  if (!activeDraftOrderId.value || submitting.value) return
  orderError.value = ''
  submitting.value = true
  paidAmountSnapshot.value = totalAmount.value
  try {
    const order = await completeOrder(activeDraftOrderId.value, 'ABA_KHQR')
    activeDraftOrderId.value = null
    stopPollingTimers()
    createdOrder.value = order
    cartStore.clearCart()
    isAbaModalOpen.value = false
    isPaidSuccess.value = true
  } catch (err: any) {
    orderError.value = err?.data?.detail || err?.message || 'Payment has not been confirmed yet.'
  } finally {
    submitting.value = false
  }
}

function downloadReceipt() {
  if (import.meta.client) {
    window.print()
  }
}
</script>
