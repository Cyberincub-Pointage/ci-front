<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Mes permissions' }]" class="mb-6" />

    <div class="mb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold">Mes permissions</h1>
          <p class="text-[var(--color-text-secondary)] mt-1">Gérez vos demandes de permissions</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary w-full md:w-auto justify-center">
          <IconPlus class="w-5 h-5 mr-2" />
          Nouvelle demande
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="label">Type</label>
          <select v-model="selectedType" class="input">
            <option value="">Tous les types</option>
            <option value="absence">Absence</option>
            <option value="retard">Retard</option>
            <option value="sortie_anticipee">Sortie anticipée</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label class="label">Statut</label>
          <select v-model="selectedStatus" class="input">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="viewed">Vue</option>
            <option value="approved">Approuvée</option>
            <option value="rejected">Rejetée</option>
          </select>
        </div>
        <div>
          <label class="label">Du</label>
          <input v-model="selectedDateStart" type="date" class="input" />
        </div>
        <div>
          <label class="label">Au</label>
          <input v-model="selectedDateEnd" type="date" class="input" />
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="btn btn-outline w-full">
            <IconFilterOff class="w-5 h-5" />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Cartes Résumé -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        class="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">En attente</p>
            <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mt-1">{{ permissionStore.pendingCount }}
            </p>
          </div>
          <IconClock class="w-10 h-10 text-yellow-500" />
        </div>
      </div>

      <div
        class="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-800 dark:text-blue-300">Vues</p>
            <p class="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ permissionStore.viewedCount }}</p>
          </div>
          <IconEye class="w-10 h-10 text-blue-500" />
        </div>
      </div>

      <div
        class="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-800 dark:text-green-300">Approuvées</p>
            <p class="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{{ permissionStore.approvedCount }}
            </p>
          </div>
          <IconCheck class="w-10 h-10 text-green-500" />
        </div>
      </div>

      <div
        class="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-red-800 dark:text-red-300">Rejetées</p>
            <p class="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">{{ permissionStore.rejectedCount }}</p>
          </div>
          <IconX class="w-10 h-10 text-red-500" />
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--color-bg-secondary)] border-b">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Motif</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Date début</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Date fin</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Créée le</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in paginatedPermissions" :key="permission.id"
              class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
              <td class="px-4 py-3 text-sm">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  :class="getTypeClass(permission.type)">
                  {{ getTypeLabel(permission.type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm max-w-xs truncate" :title="permission.motif">{{ permission.motif }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(permission.dateDebut) }}</td>
              <td class="px-4 py-3 text-sm">{{ permission.dateFin ? formatDate(permission.dateFin) : '-' }}</td>
              <td class="px-4 py-3 text-sm">
                <StatusBadge :status="permission.status" type="permission" />
              </td>
              <td class="px-4 py-3 text-sm">{{ formatDateTime(permission.createdAt) }}</td>
              <td class="px-4 py-3 text-sm">
                <NuxtLink :to="`/incube/permissions/${permission.id}`"
                  class="btn btn-ghost text-blue-600 dark:text-blue-400 p-1" title="Voir détails">
                  <IconEye class="w-5 h-5" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredPermissions.length === 0" class="text-center py-12 text-[var(--color-text-secondary)]">
          <IconClipboardOff class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune permission trouvée</p>
        </div>
      </div>

      <!-- Vue Mobile (Cartes) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="permission in paginatedPermissions" :key="permission.id"
          class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <!-- En-tête -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                :class="getTypeClass(permission.type)">
                {{ getTypeLabel(permission.type) }}
              </span>
            </div>
            <StatusBadge :status="permission.status" type="permission" size="sm" />
          </div>

          <!-- Contenu -->
          <div class="space-y-2 mb-4">
            <div class="flex items-start gap-2">
              <IconClock class="w-4 h-4 text-gray-400 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-[var(--color-text-primary)]">
                  {{ formatDate(permission.dateDebut) }}
                  <span v-if="permission.dateFin" class="text-gray-500 font-normal">
                    au {{ formatDate(permission.dateFin) }}
                  </span>
                </p>
              </div>
            </div>

            <div
              class="text-sm text-[var(--color-text-secondary)] italic border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-1 line-clamp-3 break-all min-w-0">
              "{{ permission.motif }}"
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center border-t pt-3 dark:border-gray-700">
            <span class="text-xs text-gray-500">
              Créée le {{ formatDate(permission.createdAt) }}
            </span>
            <NuxtLink :to="`/incube/permissions/${permission.id}`"
              class="btn btn-ghost btn-sm text-blue-600 dark:text-blue-400" title="Voir détails">
              <span class="mr-1">Détails</span>
              <IconEye class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>

        <div v-if="filteredPermissions.length === 0" class="text-center py-12 text-[var(--color-text-secondary)]">
          <IconClipboardOff class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune permission trouvée</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between p-4 border-t">
        <p class="text-sm text-[var(--color-text-secondary)]">
          Page {{ currentPage }} sur {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="btn btn-ghost px-3 py-2">
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn btn-ghost px-3 py-2">
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de création -->
    <AppModal v-model="showCreateModal" title="Nouvelle demande de permission" :is-form="true" :loading="createLoading"
      submit-label="Soumettre" :fields="createModalFields" :form="createForm" @confirm="submitPermission">
      <template #icon>
        <IconFileText class="w-5 h-5 text-blue-500" />
      </template>
      <p class="text-sm text-[var(--color-text-secondary)] mb-4">
        Remplissez le formulaire ci-dessous pour soumettre votre demande de permission.
      </p>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from '~/stores/permission';
import { IconPlus, IconFilterOff, IconClock, IconEye, IconCheck, IconX, IconClipboardOff, IconChevronLeft, IconChevronRight, IconFileText } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Mes permissions',
  meta: [
    {
      name: 'description',
      content: "Gérez vos demandes de permissions."
    }
  ]
});

const permissionStore = usePermissionStore();

const selectedType = ref('');
const selectedStatus = ref('');
const selectedDateStart = ref('');
const selectedDateEnd = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const showCreateModal = ref(false);
const createLoading = ref(false);
const createForm = ref({
  type: 'absence',
  motif: '',
  dateDebut: '',
  dateFin: ''
});

// Récupération de la date du jour
const today = new Date().toISOString().split('T')[0];

const createModalFields = [
  {
    name: 'type',
    label: 'Type de permission',
    type: 'select',
    required: true,
    options: [
      { value: 'absence', label: 'Absence' },
      { value: 'retard', label: 'Retard' },
      { value: 'sortie_anticipee', label: 'Sortie anticipée' },
      { value: 'autre', label: 'Autre' }
    ]
  },
  {
    name: 'motif',
    label: 'Motif',
    type: 'textarea',
    required: true,
    placeholder: 'Décrivez la raison de votre demande...',
    minlength: 10
  },
  {
    name: 'dateDebut',
    label: 'Date de début',
    type: 'date',
    required: true,
    min: today
  },
  {
    name: 'dateFin',
    label: 'Date de fin (optionnel)',
    type: 'date',
    required: false,
    min: today
  }
];

onMounted(async () => {
  await permissionStore.fetchMyPermissions();
});

const filteredPermissions = computed(() => {
  let result = [...permissionStore.permissions];

  if (selectedType.value) {
    result = result.filter(p => p.type === selectedType.value);
  }

  if (selectedStatus.value) {
    result = result.filter(p => p.status === selectedStatus.value);
  }

  if (selectedDateStart.value) {
    const startDate = new Date(selectedDateStart.value);
    startDate.setHours(0, 0, 0, 0);
    result = result.filter(p => {
      const pDate = new Date(p.dateDebut);
      pDate.setHours(0, 0, 0, 0);
      return pDate >= startDate;
    });
  }

  if (selectedDateEnd.value) {
    const endDate = new Date(selectedDateEnd.value);
    endDate.setHours(23, 59, 59, 999);
    result = result.filter(p => {
      const pDate = new Date(p.dateDebut);
      pDate.setHours(0, 0, 0, 0);
      return pDate <= endDate;
    });
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const totalPages = computed(() => {
  return Math.ceil(filteredPermissions.value.length / itemsPerPage);
});

const paginatedPermissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPermissions.value.slice(start, end);
});

const resetFilters = () => {
  selectedType.value = '';
  selectedStatus.value = '';
  selectedDateStart.value = '';
  selectedDateEnd.value = '';
  currentPage.value = 1;
};

const { success, error } = useToast();

const submitPermission = async () => {
  createLoading.value = true;
  try {
    // Validation côté client
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateDebut = new Date(createForm.value.dateDebut);
    dateDebut.setHours(0, 0, 0, 0);

    if (dateDebut < today) {
      error('La date de début doit être aujourd\'hui ou dans le futur.', 'Date invalide');
      createLoading.value = false;
      return;
    }

    if (createForm.value.dateFin) {
      const dateFin = new Date(createForm.value.dateFin);
      dateFin.setHours(0, 0, 0, 0);

      if (dateFin < dateDebut) {
        error('La date de fin doit être après la date de début.', 'Date invalide');
        createLoading.value = false;
        return;
      }
    }

    const result = await permissionStore.requestPermission({
      type: createForm.value.type,
      motif: createForm.value.motif,
      dateDebut: createForm.value.dateDebut,
      dateFin: createForm.value.dateFin || undefined // Ne pas envoyer une chaîne vide
    });

    if (result.success) {
      success('Demande de permission envoyée avec succès.', 'Succès');
      showCreateModal.value = false;
      createForm.value = {
        type: 'absence',
        motif: '',
        dateDebut: '',
        dateFin: ''
      };
    } else {
      error(result.message || 'Une erreur est survenue.', 'Erreur');
    }
  } catch (e: any) {
    console.error('Error creating permission:', e);
    error(e.message || 'Une erreur est survenue.', 'Erreur');
  } finally {
    createLoading.value = false;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    absence: 'Absence',
    retard: 'Retard',
    sortie_anticipee: 'Sortie anticipée',
    autre: 'Autre'
  };
  return labels[type] || type;
};

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    absence: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    retard: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    sortie_anticipee: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    autre: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };
  return classes[type] || classes.autre;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

watch([selectedType, selectedStatus, selectedDateStart, selectedDateEnd], () => {
  currentPage.value = 1;
});
</script>
