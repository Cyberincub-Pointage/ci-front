<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Gestion des permissions' }]" class="mb-6" />
    
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Gestion des permissions</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Gérez les demandes de permissions des incubés</p>
      </div>
      <NuxtLink v-if="isPrincipal" to="/formateur/permissions/config" class="btn btn-outline flex items-center gap-2">
        <IconSettings class="w-5 h-5" />
        Configuration
      </NuxtLink>
    </div>

    <!-- Filtres de recherche -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label class="label">Type</label>
          <select v-model="filters.type" class="input">
            <option value="">Tous les types</option>
            <option value="absence">Absence</option>
            <option value="retard">Retard</option>
            <option value="sortie_anticipee">Sortie anticipée</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label class="label">Statut</label>
          <select v-model="filters.status" class="input">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="viewed">Vue</option>
            <option value="approved">Approuvée</option>
            <option value="rejected">Rejetée</option>
          </select>
        </div>
        <div class="md:col-span-2 relative">
          <label class="label">Incubé</label>
          <div class="relative">
            <input 
              v-model="searchQuery" 
              @input="handleSearchInput"
              @blur="hideSuggestions"
              type="text" 
              class="input w-full" 
              placeholder="Rechercher un incubé..." 
              autocomplete="off"
            />
            
            <!-- Liste de suggestions -->
            <div v-if="showSuggestions && suggestions.length > 0" 
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <ul class="py-1">
                <li v-for="suggestion in suggestions" :key="suggestion.id" 
                  @mousedown.prevent="selectSuggestion(suggestion)"
                  class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm flex items-center justify-between">
                  <div>
                    <span class="font-medium">{{ suggestion.prenom }} {{ suggestion.nom }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <label class="label">Du</label>
          <input v-model="filters.dateStart" type="date" class="input" />
        </div>
        <div>
          <label class="label">Au</label>
          <input v-model="filters.dateEnd" type="date" class="input" />
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="btn btn-outline w-full">
            <IconFilterOff class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Cartes résumées des statuts -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        class="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">En attente</p>
            <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mt-1">{{ permissionStore.pendingCount }}</p>
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
            <p class="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{{ permissionStore.approvedCount }}</p>
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

    <!-- Tableau des permissions -->
    <div class="card overflow-hidden">
      <!-- Vue Desktop (Tableau) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--color-bg-secondary)] border-b">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium">Incubé</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Motif</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Date(s)</th>
              <th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in paginatedPermissions" :key="permission.id"
              class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
              <td class="px-4 py-3 text-sm font-medium">
                <div class="flex items-center gap-2">
                   <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                      :class="getTypeClass(permission.type)">
                      {{ getTypeLabel(permission.type) }}
                   </span>
                   <NuxtLink 
                      v-if="getIncubeId(permission)" 
                      :to="`/manage/incubes/${getIncubeId(permission)}`" 
                      class="hover:text-blue-600 hover:underline">
                      {{ getIncubeName(permission) }}
                   </NuxtLink>
                   <span v-else>{{ getIncubeName(permission) }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">
                 <div class="flex items-center gap-2">
                    <StatusBadge :status="permission.status" type="permission" size="sm" />
                    <span :title="permission.motif">{{ permission.motif }}</span>
                 </div>
              </td>
              <td class="px-4 py-3 text-sm">
                 {{ formatDate(permission.dateDebut) }} <span v-if="permission.dateFin" class="text-[var(--color-text-secondary)] text-xs">au {{ formatDate(permission.dateFin) }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-right">
                <div class="flex justify-end gap-2">
                  <NuxtLink 
                    :to="`/formateur/permissions/${permission.id}`" 
                    class="btn btn-ghost text-blue-600 dark:text-blue-400 p-1" 
                    title="Voir détails">
                    <IconEye class="w-5 h-5" />
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vue Mobile (Cartes) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="permission in paginatedPermissions" :key="permission.id" 
             class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <!-- En-tête de carte -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div>
                <p class="font-medium text-[var(--color-text-primary)]">
                  {{ getIncubeName(permission) }}
                </p>
                <span class="inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
                      :class="getTypeClass(permission.type)">
                  {{ getTypeLabel(permission.type) }}
                </span>
              </div>
            </div>
            <StatusBadge :status="permission.status" type="permission" size="sm" />
          </div>

          <!-- Contenu -->
          <div class="space-y-3 mb-4 text-sm text-[var(--color-text-secondary)]">
            <div class="flex flex-col gap-1">
              <span class="text-xs uppercase font-semibold text-gray-500">Motif</span>
              <p class="italic line-clamp-3 break-all min-w-0 text-[var(--color-text-primary)]">
                {{ permission.motif }}
              </p>
            </div>
            
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded border border-gray-100 dark:border-gray-700">
               <div class="flex items-center gap-2">
                 <IconCalendar class="w-4 h-4 text-gray-400" />
                 <span class="font-medium text-[var(--color-text-primary)]">{{ formatDate(permission.dateDebut) }}</span>
                 <span v-if="permission.dateFin" class="text-xs"> au {{ formatDate(permission.dateFin) }}</span>
               </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-1 border-t pt-3 dark:border-gray-700">
            <NuxtLink 
              :to="`/formateur/permissions/${permission.id}`" 
              class="btn btn-ghost btn-sm text-blue-600 dark:text-blue-400 w-full justify-center" 
              title="Voir détails">
              <IconEye class="w-4 h-4 mr-2" />
              Voir les détails
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="filteredPermissions.length === 0" class="text-center py-12 text-[var(--color-text-secondary)]">
        <IconClipboardOff class="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Aucune permission trouvée</p>
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

    <!-- Modal de rejet -->
    <AppModal
      v-model="showRejectModal"
      title="Rejeter la demande"
      :is-form="true"
      :loading="rejectLoading"
      submit-label="Rejeter"
      submit-variant="danger"
      :fields="rejectModalFields"
      :form="rejectForm"
      @confirm="confirmRejection"
    >
      <template #icon>
        <IconAlertTriangle class="w-5 h-5 text-red-500" />
      </template>
      <p class="text-sm text-[var(--color-text-secondary)] mb-4">
        Veuillez indiquer le motif du rejet pour l'incubé 
        <strong v-if="selectedPermission">{{ getIncubeName(selectedPermission) }}</strong>.
      </p>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from '~/stores/permission';
import { useManagerStore } from '~/stores/manager';
import { IconFilterOff, IconClock, IconEye, IconCheck, IconX, IconClipboardOff, IconChevronLeft, IconChevronRight, IconAlertTriangle, IconSettings, IconCalendar } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Gestion des permissions',
  meta: [
    { 
      name: 'description', 
      content: "Gérez les demandes de permissions des incubés." 
    }
  ]
});

const permissionStore = usePermissionStore();
const managerStore = useManagerStore();
import { ROLES } from '~/utils/roles';
const authStore = useAuthStore();
const isPrincipal = computed(() => authStore.hasRole(ROLES.PForm_Role));

const filters = ref({
  type: '',
  status: '',
  search: '',
  dateStart: '',
  dateEnd: ''
});

const searchQuery = ref('');
const suggestions = ref<any[]>([]);
const showSuggestions = ref(false);

const handleSearchInput = async () => {
  filters.value.search = searchQuery.value;
  if (searchQuery.value.length >= 2) {
    const results = await managerStore.searchIncubes({ search: searchQuery.value });
    suggestions.value = results.slice(0, 5);
    showSuggestions.value = true;
  } else {
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const selectSuggestion = (suggestion: any) => {
  searchQuery.value = `${suggestion.prenom} ${suggestion.nom}`;
  filters.value.search = searchQuery.value;
  showSuggestions.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const currentPage = ref(1);
const itemsPerPage = 10;

const showRejectModal = ref(false);
const rejectLoading = ref(false);
const selectedPermission = ref<any>(null);
const rejectForm = ref({
  reason: ''
});

const rejectModalFields = [
  {
    name: 'reason',
    label: 'Motif du rejet',
    type: 'textarea',
    required: true,
    placeholder: 'Ex: Justificatif manquant, hors délai...',
    minlength: 5
  }
];

onMounted(async () => {
  await permissionStore.fetchAllPermissions();
});

const filteredPermissions = computed(() => {
  let result = [...permissionStore.permissions];

  if (filters.value.type) {
    result = result.filter(p => p.type === filters.value.type);
  }

  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status);
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(p => {
      const name = getIncubeName(p).toLowerCase();
      return name.includes(search);
    });
  }

  if (filters.value.dateStart) {
    const startDate = new Date(filters.value.dateStart);
    startDate.setHours(0, 0, 0, 0);
    result = result.filter(p => {
      const pDate = new Date(p.dateDebut);
      pDate.setHours(0, 0, 0, 0);
      return pDate >= startDate;
    });
  }

  if (filters.value.dateEnd) {
    const endDate = new Date(filters.value.dateEnd);
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
  filters.value = {
    type: '',
    status: '',
    search: '',
    dateStart: '',
    dateEnd: ''
  };
  searchQuery.value = '';
  currentPage.value = 1;
};

const getIncubeId = (permission: any) => {
  if (typeof permission.incube === 'object' && permission.incube) {
    return permission.incube.id;
  }
  return permission.incube;
};

const getIncubeName = (permission: any) => {
  if (typeof permission.incube === 'object' && permission.incube) {
    return `${permission.incube.prenom} ${permission.incube.nom}`;
  }
  return 'Inconnu';
};

const { success, error } = useToast();

const approvePermission = async (permissionId: string) => {
  const result = await permissionStore.processPermission(permissionId, true);
  if (result.success) {
    success('Permission approuvée avec succès.', 'Validée');
    // Rafraîchir la liste
    await permissionStore.fetchAllPermissions();
  } else {
    error(result.message || 'Erreur lors de l\'approbation.', 'Erreur');
  }
};

const confirmRejection = async () => {
  if (!selectedPermission.value) return;

  rejectLoading.value = true;
  try {
    const result = await permissionStore.processPermission(
      selectedPermission.value.id,
      false,
      rejectForm.value.reason
    );

    if (result.success) {
      success('Permission rejetée avec succès.', 'Rejetée');
      showRejectModal.value = false;
      selectedPermission.value = null;
      // Rafraîchir la liste
      await permissionStore.fetchAllPermissions();
    } else {
      error(result.message || 'Erreur lors du rejet.', 'Erreur');
    }
  } catch (e: any) {
    console.error('Error rejecting permission:', e);
    error(e.message || 'Une erreur est survenue.', 'Erreur');
  } finally {
    rejectLoading.value = false;
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

watch([
  () => filters.value.type, 
  () => filters.value.status, 
  () => filters.value.search,
  () => filters.value.dateStart,
  () => filters.value.dateEnd
], () => {
  currentPage.value = 1;
});
</script>
