<template>
  <NuxtLayout name="auth">
    <div class="w-full max-w-md">
      <div class="card text-center">
        <!-- Chargement -->
        <div v-if="loading" class="py-8">
          <IconLoader class="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 class="text-xl font-bold mb-2">Vérification en cours...</h2>
          <p class="text-[var(--color-text-secondary)]">Veuillez patienter pendant que nous vérifions votre adresse
            email.</p>
        </div>

        <!-- Succès -->
        <div v-else-if="success" class="py-8">
          <div
            class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="text-xl font-bold mb-2 text-green-700 dark:text-green-400">Email vérifié !</h2>
          <p class="text-[var(--color-text-secondary)] mb-6">{{ message }}</p>

          <NuxtLink to="/auth/login" class="btn btn-primary w-full">
            Se connecter
          </NuxtLink>
        </div>

        <!-- Erreur -->
        <div v-else class="py-8">
          <div
            class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconX class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 class="text-xl font-bold mb-2 text-red-700 dark:text-red-400">Échec de la vérification</h2>
          <p class="text-[var(--color-text-secondary)] mb-6">{{ message }}</p>

          <div class="flex gap-3">
            <NuxtLink to="/auth/login" class="btn btn-outline flex-1">
              Retour
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn btn-primary flex-1">
              S'inscrire
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { IconLoader, IconCheck, IconX } from '@tabler/icons-vue';

// Désactive le layout par défaut
definePageMeta({
  layout: false,
});

const route = useRoute();
const authStore = useAuthStore();

// SEO
useHead({
  title: 'Vérification email',
  meta: [
    { 
      name: 'description', 
      content: "Vérification de l'adresse email pour l'activation du compte. Étape nécessaire pour accéder aux services CyberIncub." 
    }
  ]
});
const loading = ref(true);
const success = ref(false);
const message = ref('');

// Vérifie le token de l'email au chargement
onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    loading.value = false;
    success.value = false;
    message.value = 'Jeton de vérification manquant.';
    return;
  }

  // Pause UX pour éviter un flash trop rapide
  const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const [result] = await Promise.all([
      authStore.verifyEmail(token),
      minLoadingTime
    ]);

    success.value = result.success;
    message.value = result.message;
  } catch (error) {
    success.value = false;
    message.value = 'Une erreur est survenue lors de la vérification.';
  } finally {
    loading.value = false;
  }
});
</script>
