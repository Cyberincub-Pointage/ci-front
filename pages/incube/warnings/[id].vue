<template>
  <div v-if="warning">
    <AppBreadcrumb :items="[{ label: 'Mes Avertissements', to: '/incube/warnings' }, { label: 'Détail' }]"
      class="mb-6" />

    <div class="card max-w-3xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <IconAlertTriangle class="w-8 h-8" />
            Avertissement
          </h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Reçu le {{ formatDate(warning.date) }}
          </p>
        </div>
        <NuxtLink to="/incube/warnings" class="btn btn-outline w-full md:w-auto justify-center">
          Retour
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Motif</h3>
          <StatusBadge :status="warning.motif" type="warning" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Émis par</h3>
          <p class="text-lg font-medium">{{ getFormateurName(warning.formateur) }}</p>
        </div>
      </div>

      <div class="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
        <h3 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Description</h3>
        <p class="text-gray-800 dark:text-gray-200 whitespace-pre-line">{{ warning.description }}</p>
      </div>
    </div>
  </div>
  <div v-else-if="warningStore.loading" class="flex justify-center items-center h-64">
    <IconLoader class="w-10 h-10 animate-spin text-primary-600" />
  </div>
  <div v-else class="text-center py-12">
    <p>Avertissement introuvable.</p>
    <NuxtLink to="/incube/warnings" class="btn btn-primary mt-4">Retour à la liste</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useWarningStore } from '~/stores/warning';
import { IconAlertTriangle, IconLoader } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const warningStore = useWarningStore();
const warning = computed(() => warningStore.currentWarning);

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    try {
      await warningStore.fetchWarningDetails(id);
    } catch (e) {
      // Erreur gérée dans le store
    }
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getFormateurName = (formateur: any) => {
  if (formateur && typeof formateur === 'object') {
    return `${formateur.prenom} ${formateur.nom}`;
  }
  return 'Formateur';
};
</script>
