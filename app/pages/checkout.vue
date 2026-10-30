<template>
  <div class="checkout-page max-w-4xl mx-auto py-6 px-4">
    <!-- Success Celebration Modal -->
    <Teleport to="body">
      <div
        v-if="isPaidSuccess"
        class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
      >
        <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150 border border-gray-200/80">
          <div class="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner mb-4">
            <UIcon name="i-heroicons-check" class="w-10 h-10" />
          </div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Payment Successful!</h2>
          <p class="text-xs text-gray-500 mt-1 max-w-xs">
            Order confirmed. Transaction completed via ABA PayWay.
          </p>
          <div class="my-4 py-2.5 px-6 rounded-xl bg-gray-50 border border-gray-200 text-base font-mono font-bold text-gray-900">
            Paid ${{ totalAmount.toFixed(2) }} ({{ (totalAmount * 4100).toLocaleString() }} ៛)
          </div>
          <div class="flex flex-col gap-2 w-full mt-2">
            <button
              type="button"
              class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              @click="downloadReceiptMock"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
              <span>Download Receipt</span>
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

    <!-- PayWay KHQR / Card Modal Overlay (Matches Official ABA Guideline) -->
    <Teleport to="body">
      <div
        v-if="isAbaModalOpen"
        class="fixed inset-0 z-50 bg-black/65 flex flex-col items-center justify-center p-4 backdrop-blur-xs"
      >
        <!-- Floating ABA PayWay Watermark Above Card -->
        <div class="flex items-center gap-2 mb-3 text-white/90">
          <img src="/images/payments/aba.svg" alt="ABA" class="h-5 w-8 object-contain rounded bg-white p-0.5" >
          <span class="text-xs font-bold tracking-widest uppercase">PAYWAY</span>
          <span class="text-[10px] text-gray-400">powered by ABA Bank</span>
        </div>

        <div class="bg-white rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden flex flex-col border border-gray-200/90 animate-in zoom-in-95 duration-150">
          <!-- Modal Top Bar -->
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-900 tracking-tight">
                {{ selectedMethod === 'ABA_KHQR' ? 'KHQR Checkout' : selectedMethodLabel }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Simulated Countdown Timer Ring -->
              <div v-if="selectedMethod === 'ABA_KHQR'" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200/80 text-[11px] font-mono font-semibold text-gray-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>02:45</span>
              </div>
              <button
                type="button"
                class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                @click="isAbaModalOpen = false"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-5 flex flex-col items-center">
            <!-- Mode 1: KHQR Ticket Display (Full Width) -->
            <template v-if="selectedMethod === 'ABA_KHQR'">
              <div class="w-full bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 flex flex-col items-center text-center">
                <!-- Red NBC KHQR Banner -->
                <div class="w-full py-2.5 px-4 rounded-xl bg-[#E1232E] text-white flex items-center justify-center shadow-2xs mb-2.5">
                  <img src="/images/payments/khqr.svg" alt="KHQR" class="h-7 object-contain" >
                </div>

                <!-- Store Name & Price -->
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

                <!-- Dashed Perforation Line -->
                <div class="w-full border-b border-dashed border-gray-200 my-2" />

                <!-- QR Container (Full Width of Card) -->
                <div class="w-full aspect-square bg-white rounded-xl border border-gray-200/90 shadow-inner p-2 flex items-center justify-center relative my-1">
                  <img
                    src="/images/payments/aba-khqr-sample.png"
                    alt="ABA KHQR Code"
                    class="w-full h-full object-contain rounded-lg"
                  >
                </div>

                <span class="text-[11px] text-gray-600 mt-2 text-center leading-relaxed">
                  Scan with <strong>ABA Mobile</strong>, <strong>Bakong</strong>, or any banking app that supports KHQR
                </span>

                <!-- Bank Trust Badges -->
                <div class="flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap justify-center mt-1.5">
                  <div class="px-2 py-0.5 rounded-md bg-white border border-gray-200/90 shadow-2xs flex items-center gap-1">
                    <img src="/images/payments/aba.svg" alt="ABA" class="h-3 w-4.5 object-contain" >
                    <span class="text-[10px] font-semibold text-gray-700">ABA Pay</span>
                  </div>
                  <div class="px-2 py-0.5 rounded-md bg-white border border-gray-200/90 shadow-2xs flex items-center gap-1">
                    <img src="/images/payments/khqr.svg" alt="KHQR" class="h-3 w-4.5 object-contain" >
                    <span class="text-[10px] font-semibold text-gray-700">Bakong</span>
                  </div>
                  <span class="px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/80 text-[10px] font-medium text-gray-600">ACLEDA</span>
                  <span class="px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/80 text-[10px] font-medium text-gray-600">Wing</span>
                  <span class="px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/80 text-[10px] font-medium text-gray-600">+30 Banks</span>
                </div>

                <!-- Mock Simulated Confirmation Trigger -->
                <button
                  type="button"
                  class="mt-4 w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  @click="simulatePaymentSuccess"
                >
                  <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-emerald-400" />
                  <span>Simulate Customer Scan / Confirm</span>
                </button>
              </div>
            </template>

            <!-- Mode 2: Card Payment Form -->
            <template v-else-if="selectedMethod === 'CARD'">
              <div class="w-full flex flex-col gap-3.5">
                <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span class="text-sm font-bold text-gray-900">Credit / Debit Card</span>
                  <div class="flex items-center gap-1">
                    <img src="/images/payments/visa.svg" alt="Visa" class="h-3.5 w-3.5 object-contain" >
                    <img src="/images/payments/mastercard.svg" alt="Mastercard" class="h-3.5 w-3.5 object-contain" >
                    <img src="/images/payments/unionpay.svg" alt="UnionPay" class="h-3.5 w-3.5 object-contain" >
                    <img src="/images/payments/jcb.svg" alt="JCB" class="h-3.5 w-3.5 object-contain" >
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] font-semibold text-gray-700">Card Number</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    class="h-9 px-3 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-gray-900"
                  >
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] font-semibold text-gray-700">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      class="h-9 px-3 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-gray-900"
                    >
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] font-semibold text-gray-700">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxlength="4"
                      class="h-9 px-3 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-gray-900"
                    >
                  </div>
                </div>

                <div class="p-2.5 rounded-lg bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs">
                  <span class="text-gray-600 font-medium">Total Charge:</span>
                  <span class="font-bold font-mono text-gray-900">${{ totalAmount.toFixed(2) }} USD</span>
                </div>

                <button
                  type="button"
                  class="mt-1 w-full py-2.5 rounded-xl bg-[#005E7B] hover:bg-[#004B62] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  @click="simulatePaymentSuccess"
                >
                  <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
                  <span>Authorize &amp; Pay ${{ totalAmount.toFixed(2) }}</span>
                </button>
              </div>
            </template>

            <!-- Mode 3: Alipay / WeChat -->
            <template v-else>
              <div class="w-full flex flex-col items-center gap-3">
                <div class="w-full aspect-square bg-white border border-gray-200/90 rounded-2xl shadow-inner flex flex-col items-center justify-center p-4">
                  <UIcon name="i-heroicons-qr-code" class="w-full h-full text-gray-900 max-w-[240px]" />
                </div>
                <span class="text-xs text-gray-600 font-medium text-center">
                  Scan to pay ${{ totalAmount.toFixed(2) }} with {{ selectedMethod === 'ALIPAY' ? 'Alipay' : 'WeChat Pay' }}
                </span>
                <button
                  type="button"
                  class="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  @click="simulatePaymentSuccess"
                >
                  Simulate QR Payment
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
        Review your items and select your preferred payment method.
      </p>
    </div>

    <!-- Main Grid: Items (Left) + Payment Method (Right) -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Left Column: Bag Summary -->
      <div class="md:col-span-7 flex flex-col gap-4">
        <div class="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-gray-100">
            <span class="text-xs font-bold text-gray-900 uppercase tracking-wider">Order Summary (2 Items)</span>
            <span class="text-xs text-gray-400">Order #ORD-{{ new Date().getFullYear() }}-0891</span>
          </div>

          <!-- Item 1 -->
          <div class="flex items-center gap-3 py-2 border-b border-gray-100">
            <div class="w-14 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
              <UIcon name="i-heroicons-photo" class="w-6 h-6" />
            </div>
            <div class="flex-1 flex flex-col">
              <span class="text-xs font-bold text-gray-900">Classic Oxford Button-Down Shirt</span>
              <span class="text-[11px] text-gray-500">Color: Light Blue &bull; Size: L</span>
              <span class="text-xs font-mono font-bold text-gray-900 mt-1">$28.00</span>
            </div>
            <div class="text-xs text-gray-500 font-mono">Qty: 1</div>
          </div>

          <!-- Item 2 -->
          <div class="flex items-center gap-3 py-2">
            <div class="w-14 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
              <UIcon name="i-heroicons-photo" class="w-6 h-6" />
            </div>
            <div class="flex-1 flex flex-col">
              <span class="text-xs font-bold text-gray-900">Slim-Fit Chino Pants</span>
              <span class="text-[11px] text-gray-500">Color: Charcoal &bull; Size: 32</span>
              <span class="text-xs font-mono font-bold text-gray-900 mt-1">$35.00</span>
            </div>
            <div class="text-xs text-gray-500 font-mono">Qty: 1</div>
          </div>

          <!-- Price Calculation -->
          <div class="pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-xs text-gray-600">
            <div class="flex items-center justify-between">
              <span>Subtotal</span>
              <span class="font-mono text-gray-900 font-semibold">$63.00</span>
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
      </div>

      <!-- Right Column: Choose Way to Pay -->
      <div class="md:col-span-5 flex flex-col gap-4">
        <div class="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs flex flex-col gap-4">
          <PaymentMethodSelector
            v-model="selectedMethod"
            :amount="totalAmount"
            store-name="STAR BOUTIQUE STORE"
            qr-image="/images/payments/aba-khqr-sample.png"
            @simulate-scan="simulatePaymentSuccess"
          />

          <!-- Pay CTA Button -->
          <button
            type="button"
            class="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
            @click="handlePayClick"
          >
            <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
            <span>Pay ${{ totalAmount.toFixed(2) }} with {{ selectedMethodLabel }}</span>
          </button>

          <!-- We Accept Trust Banner -->
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
import { ref, computed } from 'vue'

useHead({
  title: 'Checkout — Star Boutique',
})

const totalAmount = ref(63.0)
const selectedMethod = ref('ABA_KHQR')
const isAbaModalOpen = ref(false)
const isPaidSuccess = ref(false)

const selectedMethodLabel = computed(() => {
  switch (selectedMethod.value) {
    case 'ABA_KHQR':
      return 'ABA KHQR'
    case 'CARD':
      return 'Credit Card'
    case 'ALIPAY':
      return 'Alipay'
    case 'WECHAT':
      return 'WeChat Pay'
    default:
      return 'ABA PayWay'
  }
})

function handlePayClick() {
  isAbaModalOpen.value = true
}

function simulatePaymentSuccess() {
  isAbaModalOpen.value = false
  isPaidSuccess.value = true
}

function downloadReceiptMock() {
  alert('Receipt downloaded: INV-2026-0891.pdf')
}
</script>
