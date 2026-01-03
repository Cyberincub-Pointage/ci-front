<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <!-- Arrière-plan -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleCancel"></div>

      <!-- Modale -->
      <div
        class="bg-[var(--color-bg-primary)] rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden scale-100 transition-all border border-gray-100 dark:border-gray-700">
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div v-if="options.type === 'danger'"
                class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <IconAlertTriangle class="w-6 h-6" />
              </div>
              <div v-else-if="options.type === 'warning'"
                class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <IconAlertCircle class="w-6 h-6" />
              </div>
              <div v-else
                class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <IconInfoCircle class="w-6 h-6" />
              </div>
            </div>

            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ options.title }}</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ options.message }}</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button @click="handleCancel" class="btn btn-ghost">
            {{ options.cancelLabel }}
          </button>
          <button @click="handleConfirm" class="btn" :class="[
            options.type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
              options.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                'btn-primary'
          ]">
            {{ options.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconAlertCircle, IconInfoCircle } from '@tabler/icons-vue';

const { isVisible, options, handleConfirm, handleCancel } = useConfirm();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
