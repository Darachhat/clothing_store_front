<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-gray-900 tracking-tight">Choose way to pay</h3>
      <span class="text-[11px] text-gray-400 font-medium">Powered by ABA PayWay</span>
    </div>

    <div class="flex flex-col gap-2.5">
      <!-- Option 1: ABA KHQR (with Full-Width QR Display when selected) -->
      <div
        class="rounded-2xl border transition-all overflow-hidden bg-white"
        :class="modelValue === 'ABA_KHQR'
          ? 'border-gray-900 ring-1 ring-gray-900 shadow-xs'
          : 'border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/60'"
      >
        <!-- Header Button -->
        <button
          type="button"
          class="w-full flex items-center justify-between p-3.5 text-left cursor-pointer group"
          @click="$emit('update:modelValue', 'ABA_KHQR')"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center p-1 flex-shrink-0">
              <img
                src="/images/payments/aba-khqr.svg"
                alt="ABA KHQR"
                class="w-full h-full object-contain"
              >
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-gray-900 group-hover:text-black">ABA KHQR</span>
              <span class="text-[11px] text-gray-500">Scan to pay with any banking app</span>
            </div>
          </div>
          <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-200 transition-colors">
            <UIcon
              :name="modelValue === 'ABA_KHQR' ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
              class="w-4 h-4 transition-transform duration-150"
            />
          </div>
        </button>

        <!-- Full-Width QR Section (Shown directly on ABA KHQR when active) -->
        <div
          v-if="modelValue === 'ABA_KHQR' && showInlineQr"
          class="px-3.5 pb-4 pt-1 flex flex-col items-center border-t border-gray-100 bg-gray-50/50 animate-in fade-in duration-150"
        >
          <!-- KHQR Ticket Container (Full Width) -->
          <div class="w-full bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 flex flex-col items-center text-center mt-1">
            <!-- Official NBC KHQR Red Ticket Header Banner -->
            <div class="w-full py-2.5 px-4 rounded-xl bg-[#E1232E] text-white flex items-center justify-center shadow-2xs mb-2.5">
              <img
                src="/images/payments/khqr.svg"
                alt="KHQR Logo"
                class="h-6 sm:h-7 object-contain"
              >
            </div>

            <!-- Merchant & Branch -->
            <span class="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              {{ storeName }}
            </span>

            <!-- Amount Display -->
            <div class="my-1.5 flex flex-col items-center">
              <div class="flex items-baseline gap-1">
                <span class="text-2xl sm:text-3xl font-black font-mono text-gray-900 tracking-tight">
                  ${{ amount.toFixed(2) }}
                </span>
                <span class="text-xs font-bold text-gray-400 font-mono">USD</span>
              </div>
              <span class="text-[11px] font-semibold font-mono text-gray-500">
                &approx; {{ Math.round(amount * 4100).toLocaleString() }} ៛ (4,100 KHR/USD)
              </span>
            </div>

            <!-- Ticket Dashed Tear-Line Separator -->
            <div class="w-full border-b border-dashed border-gray-200 my-2" />

            <!-- Dynamic QR Code Container (Full Width of Ticket Card) -->
            <div class="w-full aspect-square bg-white rounded-xl border border-gray-200/90 shadow-inner p-2 flex items-center justify-center relative my-1">
              <img
                :src="qrImage || '/images/payments/aba-khqr-sample.png'"
                alt="ABA KHQR Code"
                class="w-full h-full object-contain rounded-lg"
              >
            </div>

            <!-- Customer Scan Instruction & Official Bank Badges -->
            <div class="mt-2 flex flex-col items-center gap-2 w-full">
              <span class="text-[11px] text-gray-600 font-medium leading-tight">
                Scan with <strong>Bakong App</strong> or any <strong>Mobile Banking app</strong> that supports KHQR
              </span>

              <div class="flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap justify-center pt-0.5">
                <div class="px-2 py-0.5 rounded-md bg-white border border-gray-200/90 shadow-2xs flex items-center gap-1" title="ABA Mobile">
                  <img src="/images/payments/aba.svg" alt="ABA" class="h-3 w-4.5 object-contain" >
                  <span class="text-[10px] font-semibold text-gray-700">ABA Pay</span>
                </div>
                <div class="px-2 py-0.5 rounded-md bg-white border border-gray-200/90 shadow-2xs flex items-center gap-1" title="NBC Bakong">
                  <img src="/images/payments/khqr.svg" alt="KHQR" class="h-3 w-4.5 object-contain" >
                  <span class="text-[10px] font-semibold text-gray-700">Bakong</span>
                </div>
                <span class="px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/80 text-[10px] font-medium text-gray-600">ACLEDA</span>
                <span class="px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/80 text-[10px] font-medium text-gray-600">Wing</span>
                <span class="px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/80 text-[10px] font-medium text-gray-600">+30 Banks</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    amount?: number
    storeName?: string
    qrImage?: string | null
    showInlineQr?: boolean
  }>(),
  {
    amount: 63.0,
    storeName: 'STAR BOUTIQUE STORE',
    qrImage: null,
    showInlineQr: true,
  }
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
