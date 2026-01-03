<template>
  <div class="fixed top-20 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id"
        class="pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border backdrop-blur-md transform transition-all duration-300"
        :class="[
          toast.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100' :
            toast.type === 'error' ? 'bg-rose-50/90 dark:bg-rose-900/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-100' :
              toast.type === 'warning' ? 'bg-amber-50/90 dark:bg-amber-900/90 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-100' :
                'bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-100'
        ]">

        <!-- Icônes -->
        <div class="flex-shrink-0 mt-0.5">
          <IconCheck v-if="toast.type === 'success'" class="w-5 h-5" />
          <IconAlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5" />
          <IconAlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5" />
          <IconInfoCircle v-else class="w-5 h-5" />
        </div>

        <div class="ml-3 flex-1">
          <h3 v-if="toast.title" class="text-sm font-semibold mb-1">{{ toast.title }}</h3>
          <p class="text-sm opacity-90">{{ toast.message }}</p>
        </div>

        <button @click="removeToast(toast.id)"
          class="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <IconX class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { IconCheck, IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-vue';

// Gestion des notifications
const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
