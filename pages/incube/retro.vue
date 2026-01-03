<template>
  <div class="max-w-4xl mx-auto">
    <AppBreadcrumb :items="[{ label: 'Demande de rétro-présence' }]" class="mb-6" />
    
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Demande de rétro-présence</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Pour les présences du jour précédent uniquement</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulaire de demande -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Nouvelle demande</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Date *</label>
            <input v-model="form.date" type="date" :max="yesterday" :min="yesterday" required class="input" />
            <p class="text-xs text-[var(--color-text-secondary)] mt-1">
              Uniquement pour le {{ formatDate(yesterday) }}
            </p>
          </div>

          <div>
            <label class="label">Motif *</label>
            <textarea v-model="form.motif" required rows="4" class="input"
              placeholder="Expliquez pourquoi vous n'avez pas pu pointer à temps..."></textarea>
          </div>

          <div v-if="errorMessage"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <div v-if="successMessage"
            class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
          </div>

          <button type="submit" :disabled="isSubmitting" class="w-full btn btn-primary">
            <IconLoader v-if="isSubmitting" class="w-5 h-5 animate-spin" />
            <IconSend v-else class="w-5 h-5" />
            <span>{{ isSubmitting ? 'Envoi...' : 'Soumettre la demande' }}</span>
          </button>
        </form>
      </div>

      <!-- Demandes en attente -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Mes demandes</h2>

        <div v-if="myRetroRequests.length > 0" class="space-y-3">
          <div v-for="request in myRetroRequests" :key="request.id"
            class="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-medium">{{ formatDate(request.date) }}</p>
                <p class="text-xs text-[var(--color-text-secondary)]">
                  Demandé le {{ formatDateTime(request.createdAt) }}
                </p>
              </div>
              <StatusBadge :status="request.status" type="presence" />
            </div>

            <p class="text-sm text-[var(--color-text-secondary)] mt-2">{{ request.motif }}</p>

            <div v-if="request.rejectionReason" class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <p class="text-xs text-red-600 dark:text-red-400">
                <strong>Motif du refus :</strong> {{ request.rejectionReason }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-[var(--color-text-secondary)]">
          <IconCalendarOff class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune demande en cours</p>
        </div>
      </div>
    </div>

    <!-- Boîte d'information -->
    <div class="card mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <h3 class="font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
        <IconInfoCircle class="w-5 h-5" />
        Informations importantes
      </h3>
      <ul class="text-sm text-blue-800 dark:text-blue-400 space-y-2 list-disc list-inside">
        <li>Les demandes de rétro-présence ne sont autorisées que pour J-1 (jour précédent)</li>
        <li>Vous devez fournir un motif valable</li>
        <li>La demande sera examinée par votre formateur</li>
        <li>En cas d'approbation, une présence sera créée automatiquement</li>
        <li>Vous ne pouvez soumettre qu'une seule demande par jour</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { usePresenceStore } from '~/stores/presence';
import { IconLoader, IconSend, IconCalendarOff, IconInfoCircle } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Demande de rétro-présence',
  meta: [
    { 
      name: 'description', 
      content: "Soumettre une demande de régularisation d'absence." 
    }
  ]
});

const authStore = useAuthStore();
const presenceStore = usePresenceStore();

const user = computed(() => authStore.currentUser);

const yesterday = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
});

const form = ref({
  date: yesterday.value,
  motif: '',
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const myRetroRequests = computed(() => {
  return presenceStore.retroRequests; 
});

onMounted(async () => {
    await presenceStore.fetchMyRetroRequests();
});

const handleSubmit = async () => {
  if (!user.value) return;

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const result = await presenceStore.requestRetroPresence(
      user.value.id,
      form.value.date,
      form.value.motif
    );

    if (result.success) {
      successMessage.value = result.message;
      form.value.motif = '';
    } else {
      errorMessage.value = result.message;
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (datetime: string) => {
  return new Date(datetime).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
