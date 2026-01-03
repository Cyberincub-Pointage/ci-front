<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Mes Avertissements' }]" class="mb-6" />

    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Mes Avertissements</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Consultez les avertissements reçus</p>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="w-full md:w-1/3 relative">
          <input v-model="searchQuery" type="text" placeholder="Rechercher par motif ou description..."
            class="input pl-10 w-full" />
          <IconSearch class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Contenu -->
    <div class="card overflow-hidden">
      <!-- Squelette de chargement -->
      <div v-if="warningStore.loading" class="p-4 space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
          <AppSkeleton type="text" width="15%" />
          <AppSkeleton type="text" width="20%" />
          <AppSkeleton type="text" width="40%" />
          <AppSkeleton type="text" width="15%" />
          <AppSkeleton type="circle" width="2rem" height="2rem" />
        </div>
      </div>

      <!-- Tableau -->
      <!-- Vue Desktop (Tableau) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--color-bg-secondary)] border-b">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Motif</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Description</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Formateur</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="warning in paginatedWarnings" :key="warning.id"
              class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
              <td class="px-4 py-3 text-sm">{{ formatDate(warning.date) }}</td>
              <td class="px-4 py-3 text-sm">
                <StatusBadge :status="warning.motif" type="warning" :show-icon="false" />
              </td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ warning.description }}</td>
              <td class="px-4 py-3 text-sm">{{ getFormateurName(warning.formateur) }}</td>
              <td class="px-4 py-3 text-sm">
                <NuxtLink :to="`/incube/warnings/${warning.id}`"
                  class="btn btn-ghost p-1 text-blue-600 dark:text-blue-400" title="Voir détails">
                  <IconEye class="w-5 h-5" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vue Mobile (Cartes) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="warning in paginatedWarnings" :key="warning.id"
          class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-medium text-[var(--color-text-primary)]">
                {{ formatDate(warning.date) }}
              </p>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Par: {{ getFormateurName(warning.formateur) }}
              </p>
            </div>
            <StatusBadge :status="warning.motif" type="warning" :show-icon="false" />
          </div>

          <p class="text-sm text-[var(--color-text-secondary)] line-clamp-2 italic mb-4">
            "{{ warning.description }}"
          </p>

          <div class="flex justify-end pt-2 border-t dark:border-gray-700">
            <NuxtLink :to="`/incube/warnings/${warning.id}`"
              class="btn btn-ghost btn-sm text-blue-600 dark:text-blue-400 w-full justify-center">
              <IconEye class="w-4 h-4 mr-2" />
              Voir les détails
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="filteredWarnings.length === 0" class="text-center py-12 text-[var(--color-text-secondary)]">
        <IconClipboardCheck class="w-16 h-16 mx-auto mb-4 opacity-50 text-green-500" />
        <p v-if="searchQuery">Aucun avertissement ne correspond à votre recherche.</p>
        <p v-else>Aucun avertissement reçu. Continuez ainsi !</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700">
        <p class="text-sm text-[var(--color-text-secondary)]">
          Page {{ currentPage }} sur {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="btn btn-ghost px-3 py-2 disabled:opacity-50">
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="btn btn-ghost px-3 py-2 disabled:opacity-50">
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWarningStore } from '~/stores/warning';
import { IconEye, IconClipboardCheck, IconSearch, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Mes avertissements',
});

const warningStore = useWarningStore();

// Logique de pagination et de recherche
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredWarnings = computed(() => {
  let items = warningStore.warnings;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(w =>
      w.motif.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q)
    );
  }
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const totalPages = computed(() => Math.ceil(filteredWarnings.value.length / itemsPerPage));

const paginatedWarnings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredWarnings.value.slice(start, end);
});

// Réinitialisation de la pagination lors de la recherche
watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  await warningStore.fetchMyWarnings();
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getFormateurName = (formateur: any) => {
  if (formateur && typeof formateur === 'object') {
    return `${formateur.prenom} ${formateur.nom}`;
  }
  return 'Formateur';
};
</script>
