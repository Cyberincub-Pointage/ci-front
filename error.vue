<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
    <div class="text-center max-w-md">
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <IconAlertTriangle class="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <h1 class="text-4xl font-bold mb-2 text-[var(--color-text-primary)]">
        {{ error?.statusCode === 404 ? 'Page introuvable' : 'Une erreur est survenue' }}
      </h1>

      <p class="text-[var(--color-text-secondary)] mb-8 text-lg">
        {{ error?.message || "Désolé, nous ne parvenons pas à afficher cette page pour le moment." }}
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button @click="handleError" class="btn btn-primary">
          <IconHome class="w-5 h-5 mr-2" />
          Retour à l'accueil
        </button>
        <button @click="router.back()" class="btn btn-outline">
          <IconArrowLeft class="w-5 h-5 mr-2" />
          Page précédente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconHome, IconArrowLeft } from '@tabler/icons-vue';

const props = defineProps({
  error: Object
});

const router = useRouter();

const handleError = () => {
  clearError({ redirect: '/' });
};
</script>
