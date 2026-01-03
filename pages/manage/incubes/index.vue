<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Gestion des Incubés' }]" class="mb-6" />

    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Gestion des incubés</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Liste et suivi des participants</p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Recherche</label>
          <div class="relative">
            <input v-model="searchQuery" @input="handleSearchInput" @keydown.enter="performSearch" type="text"
              class="input pr-10" placeholder="Nom, email..." />
            <button @click="performSearch"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700 p-1"
              title="Rechercher">
              <IconSearch class="w-5 h-5" />
            </button>

            <!-- Suggestions d'autocomplétion -->
            <div v-if="suggestions.length > 0 && showSuggestions"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              <ul class="py-1">
                <li v-for="suggestion in suggestions" :key="suggestion.id" @click="selectSuggestion(suggestion)"
                  class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm flex items-center justify-between">
                  <span>{{ suggestion.prenom }} {{ suggestion.nom }}</span>
                  <span class="text-xs text-gray-500">{{ suggestion.email }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <label class="label">Statut</label>
          <select v-model="filters.status" class="input">
            <option value="">Tous</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
            <option value="pending">En attente</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="btn btn-outline w-full">
            <IconFilterOff class="w-5 h-5" />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-800 dark:text-blue-300">Total Incubés</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ filteredIncubes.length }}</p>
      </div>
      <div class="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <p class="text-sm text-green-800 dark:text-green-300">Actifs</p>
        <p class="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{{ activeCount }}</p>
      </div>
      <div class="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <p class="text-sm text-red-800 dark:text-red-300">Suspendus</p>
        <p class="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">{{ suspendedCount }}</p>
      </div>
    </div>

    <!-- Liste -->
    <div class="card overflow-hidden">
      <div v-if="managerStore.loading" class="flex justify-center items-center py-12">
        <IconLoader class="w-10 h-10 text-primary-600 animate-spin" />
        <span class="ml-3 text-lg font-medium text-gray-500">Chargement des incubés...</span>
      </div>
      <div v-else>
        <!-- Vue Desktop (Tableau) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-bg-secondary)] border-b">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Incubé</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Équipe</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Projet</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="incube in filteredIncubes" :key="incube.id"
                class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td class="px-4 py-3">
                  <NuxtLink :to="`/manage/incubes/${incube.id}`"
                    class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      <img v-if="incube.photoUrl" :src="incube.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ getInitials(incube.prenom, incube.nom) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-sm">{{ incube.prenom }} {{ incube.nom }}</p>
                      <p class="text-xs text-[var(--color-text-secondary)]">{{ incube.email }}</p>
                    </div>
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm">{{ getEquipeName(incube) }}</td>
                <td class="px-4 py-3 text-sm truncate max-w-[150px]">{{ getProjetName(incube) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="incube.status === 'active'" class="badge badge-success">Actif</span>
                  <span v-else-if="incube.status === 'suspended'" class="badge badge-error">Suspendu</span>
                  <span v-else class="badge badge-warning">En attente</span>
                  
                  <div v-if="isAdmin && (incube.pendingBanque || incube.pendingRib)" class="mt-1 flex items-center gap-1 text-xs text-amber-600 font-medium animate-pulse" title="Mise à jour bancaire en attente">
                     <IconAlertCircle class="w-3 h-3" /> Banque
                  </div>
                  <div v-if="isFormateur && incube.pendingEquipe" class="mt-1 flex items-center gap-1 text-xs text-indigo-600 font-medium animate-pulse" title="Changement d'équipe en attente">
                     <IconAlertCircle class="w-3 h-3" /> Équipe
                  </div>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    <NuxtLink :to="`/manage/incubes/${incube.id}`"
                      class="btn btn-ghost p-1 text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Voir détails">
                      <IconEye class="w-4 h-4" />
                    </NuxtLink>
                    
                    <button v-if="isAdmin && (incube.pendingBanque || incube.pendingRib)" @click="openValidationModal(incube)" 
                      class="btn btn-ghost p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      title="Valider Banque">
                      <IconCheck class="w-4 h-4" />
                    </button>

                    <button v-if="isFormateur && incube.pendingEquipe" @click="openTeamValidationModal(incube)" 
                      class="btn btn-ghost p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      title="Valider Équipe">
                      <IconCheck class="w-4 h-4" />
                    </button>

                    <button v-if="incube.status === 'active'" @click="toggleStatus(incube)"
                      class="btn btn-ghost p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      title="Suspendre" :disabled="!!processingAction[incube.id]">
                      <IconLoader v-if="processingAction[incube.id]" class="w-4 h-4 animate-spin" />
                      <IconLock v-else class="w-4 h-4" />
                    </button>
                    <button v-else @click="toggleStatus(incube)"
                      class="btn btn-ghost p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Activer" :disabled="!!processingAction[incube.id]">
                      <IconLoader v-if="processingAction[incube.id]" class="w-4 h-4 animate-spin" />
                      <IconLockOpen v-else class="w-4 h-4" />
                    </button>
                    <!-- Alerter -->
                    <button @click="sendAlert(incube)"
                      class="btn btn-ghost p-1 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      title="Envoyer une alerte">
                      <IconAlertTriangle class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vue Mobile (Cartes) -->
        <div class="md:hidden space-y-4 p-4">
          <div v-for="incube in filteredIncubes" :key="incube.id" class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            
            <!-- En-tête de carte -->
            <div class="flex items-center justify-between mb-3">
              <NuxtLink :to="`/manage/incubes/${incube.id}`" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  <img v-if="incube.photoUrl" :src="incube.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
                  <span v-else>{{ getInitials(incube.prenom, incube.nom) }}</span>
                </div>
                <div>
                   <p class="font-medium text-[var(--color-text-primary)]">
                    {{ incube.prenom }} {{ incube.nom }}
                  </p>
                  <p class="text-xs text-[var(--color-text-secondary)]">{{ incube.email }}</p>
                </div>
              </NuxtLink>
               <div>
                  <span v-if="incube.status === 'active'" class="badge badge-success text-[10px]">Actif</span>
                  <span v-else-if="incube.status === 'suspended'" class="badge badge-error text-[10px]">Suspendu</span>
                  <span v-else class="badge badge-warning text-[10px]">En attente</span>
               </div>
            </div>

            <!-- Détails -->
            <div class="space-y-2 mb-4 text-sm text-[var(--color-text-secondary)]">
               <div class="flex items-center justify-between">
                  <span class="font-medium">Équipe:</span>
                  <span>{{ getEquipeName(incube) }}</span>
               </div>
               <div class="flex items-center justify-between">
                  <span class="font-medium">Projet:</span>
                  <span class="truncate max-w-[180px]">{{ getProjetName(incube) }}</span>
               </div>
               
               <!-- Notifications en attente -->
               <div v-if="isAdmin && (incube.pendingBanque || incube.pendingRib)" class="bg-amber-50 dark:bg-amber-900/20 p-2 rounded text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <IconAlertCircle class="w-3 h-3" /> Validation Banque requise
               </div>
               <div v-if="isFormateur && incube.pendingEquipe" class="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <IconAlertCircle class="w-3 h-3" /> Validation Équipe requise
               </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-1 border-t pt-3 dark:border-gray-700">
                <NuxtLink :to="`/manage/incubes/${incube.id}`"
                  class="btn btn-ghost btn-sm text-[var(--color-text-secondary)]" title="Voir détails">
                  <IconEye class="w-4 h-4" />
                </NuxtLink>

                <button v-if="isAdmin && (incube.pendingBanque || incube.pendingRib)" @click="openValidationModal(incube)" 
                  class="btn btn-ghost btn-sm text-amber-600" title="Valider Banque">
                  <IconCheck class="w-4 h-4" />
                </button>

                <button v-if="isFormateur && incube.pendingEquipe" @click="openTeamValidationModal(incube)" 
                  class="btn btn-ghost btn-sm text-indigo-600" title="Valider Équipe">
                  <IconCheck class="w-4 h-4" />
                </button>

                <button v-if="incube.status === 'active'" @click="toggleStatus(incube)"
                  class="btn btn-ghost btn-sm text-orange-600" title="Suspendre" :disabled="!!processingAction[incube.id]">
                  <IconLoader v-if="processingAction[incube.id]" class="w-4 h-4 animate-spin" />
                  <IconLock v-else class="w-4 h-4" />
                </button>
                <button v-else @click="toggleStatus(incube)"
                  class="btn btn-ghost btn-sm text-green-600" title="Activer" :disabled="!!processingAction[incube.id]">
                  <IconLoader v-if="processingAction[incube.id]" class="w-4 h-4 animate-spin" />
                  <IconLockOpen v-else class="w-4 h-4" />
                </button>

                <button @click="sendAlert(incube)" class="btn btn-ghost btn-sm text-yellow-600" title="Alerter">
                  <IconAlertTriangle class="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>

        <div v-if="filteredIncubes.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
          Aucun incubé trouvé.
        </div>
      </div>
    </div>

    <!-- Modale d'alerte -->
    <AppModal v-model="showAlertModal" title="Envoyer une alerte" is-form @confirm="submitAlert"
      submit-label="Envoyer" submit-variant="primary" :form="alertForm" :loading="alertLoading"
      :fields="[
        { name: 'incubeName', label: 'Destinataire', type: 'text', disabled: true },
        { name: 'message', label: 'Message d\'alerte *', type: 'textarea', required: true, placeholder: 'Raison de l\'alerte...' }
      ]">
      <template #description>
        <p class="text-sm text-gray-500 mb-4">Envoyez une notification importante à cet incubé.</p>
      </template>
    </AppModal>

    <!-- Modale de Validation Banque -->
    <AppModal v-model="showValidationModal" title="Validation Informations Bancaires" 
      @close="selectedIncubeForValidation = null"
      submit-label="Approuver"
      cancel-label="Refuser"
      submit-variant="success"
      @confirm="handleValidation(true)"
      @cancel-action="handleValidation(false)">
      <div v-if="selectedIncubeForValidation" class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          L'incubé <strong>{{ selectedIncubeForValidation.prenom }} {{ selectedIncubeForValidation.nom }}</strong> a demandé la mise à jour suivante :
        </p>
        
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div class="grid grid-cols-2 gap-4">
             <div>
               <p class="text-xs uppercase text-gray-400 font-semibold mb-1">Nouvelle Banque</p>
               <p class="font-medium text-gray-900 dark:text-white">{{ getBanqueName(selectedIncubeForValidation.pendingBanque) || '...' }}</p>
             </div>
             <div>
               <p class="text-xs uppercase text-gray-400 font-semibold mb-1">Nouveau RIB</p>
               <p class="font-mono text-gray-900 dark:text-white">{{ selectedIncubeForValidation.pendingRib }}</p>
             </div>
          </div>
        </div>
      </div>
    </AppModal>

    <!-- Modale de Validation Équipe -->
    <AppModal v-model="showTeamValidationModal" title="Validation Changement d'Équipe" 
      @close="selectedIncubeForTeamValidation = null"
      submit-label="Approuver"
      cancel-label="Refuser"
      submit-variant="success"
      @confirm="handleTeamValidation(true)"
      @cancel-action="handleTeamValidation(false)">
      <div v-if="selectedIncubeForTeamValidation" class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          L'incubé <strong>{{ selectedIncubeForTeamValidation.prenom }} {{ selectedIncubeForTeamValidation.nom }}</strong> souhaite changer d'équipe.
        </p>
        
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div class="grid grid-cols-2 gap-4">
             <div>
               <p class="text-xs uppercase text-gray-400 font-semibold mb-1">Équipe Actuelle</p>
               <p class="font-medium text-gray-900 dark:text-white">{{ getEquipeName(selectedIncubeForTeamValidation) }}</p>
             </div>
             <div>
               <p class="text-xs uppercase text-gray-400 font-semibold mb-1">Nouvelle Équipe</p>
               <p class="font-medium text-indigo-600 dark:text-indigo-400 font-bold">{{ getTeamName(selectedIncubeForTeamValidation.pendingEquipe) }}</p>
             </div>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { IconEye, IconLoader, IconSearch, IconFilterOff, IconLock, IconLockOpen, IconAlertTriangle, IconSend, IconCheck, IconAlertCircle } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Gestion des Incubés',
  meta: [
    { 
      name: 'description', 
      content: "Liste et suivi des participants. Gérer les statuts et les affectations." 
    }
  ]
});

const adminStore = useAdminStore();
const formateurStore = useFormateurStore();
const managerStore = useManagerStore();
const teamStore = useTeamStore();
const projectStore = useProjectStore();
const authStore = useAuthStore();

const isAdmin = computed(() => ['admin', 'super_admin'].includes(authStore.currentUser?.role || ''));
const isFormateur = computed(() => ['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || ''));

const filters = ref({
  search: '',
  status: '',
});

const searchQuery = ref('');
const suggestions = ref<any[]>([]);
const showSuggestions = ref(false);

const handleSearchInput = async () => {
  if (searchQuery.value.length >= 3) {
    const results = await managerStore.searchIncubes({ search: searchQuery.value });
    // Limiter à 3 suggestions
    suggestions.value = results.slice(0, 3);
    showSuggestions.value = true;
  } else {
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const selectSuggestion = (suggestion: any) => {
  navigateTo(`/manage/incubes/${suggestion.id}`);
  showSuggestions.value = false;
};

const performSearch = () => {
  filters.value.search = searchQuery.value;
  showSuggestions.value = false;
};

const filteredIncubes = ref<any[]>([]);

const loadData = async () => {
  filteredIncubes.value = await managerStore.loadIncubes(filters.value);
};

onMounted(async () => {
  await Promise.all([
    loadData(),
    teamStore.fetchTeams(),
    projectStore.fetchProjects()
  ]);
});

watch(filters, async () => {
  await loadData();
}, { deep: true });

const getInitials = (prenom: string, nom: string) => {
  return `${prenom ? prenom[0] : ''}${nom ? nom[0] : ''}`;
};

const getEquipeName = (incube: any) => {
  if (incube.equipe && typeof incube.equipe === 'object') return incube.equipe.nom;
  const id = incube.equipeId || incube.equipe;
  if (!id) return '-';
  const team = teamStore.teams.find(t => t.id === id);
  return team ? team.nom : 'Inconnu';
};

const getProjetName = (incube: any) => {
  // 1. Essayez l'objet de projet rempli
  if (incube.projet && typeof incube.projet === 'object') return incube.projet.nom;
  
  // 2. Essayez direct projectId
  const id = incube.projetId || incube.projet; 
  if (id) {
    const p = projectStore.projects.find(proj => proj.id === id);
    if (p) return p.nom;
  }

  // 3. Fallback: Essayez de trouver le projet par ID d'équipe
  const equipId = incube.equipe && typeof incube.equipe === 'object' ? incube.equipe.id : (incube.equipeId || incube.equipe);
  if (equipId) {
    const p = projectStore.projects.find(proj => {
       const pEquipeId = proj.equipe && typeof proj.equipe === 'object' ? proj.equipe.id : (proj.equipeId || proj.equipe);
       return pEquipeId === equipId;
    });
    if (p) return p.nom;
  }

  return '-';
};

const getBanqueName = (idOrObj: any) => {
  if (!idOrObj) return '-';
  if (typeof idOrObj === 'object') return idOrObj.nom;
  const b = entitiesStore.banques.find((b: any) => b.id === idOrObj);
  return b ? b.nom : idOrObj;
};

const activeCount = computed(() => filteredIncubes.value.filter(i => i.status === 'active').length);
const suspendedCount = computed(() => filteredIncubes.value.filter(i => i.status === 'suspended').length);

const resetFilters = () => {
  filters.value = { search: '', status: '' };
  searchQuery.value = '';
  suggestions.value = [];
};

// État pour gérer le chargement des actions par élément
const processingAction = ref<Record<string, boolean>>({});

const toggleStatus = async (incube: any) => {
  const action = incube.status === 'active' ? 'suspendre' : 'activer';
  if (await useConfirm().confirm({
    message: `Voulez-vous ${action} ${incube.prenom} ${incube.nom} ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} incubé`,
    type: incube.status === 'active' ? 'danger' : 'primary'
  })) {
    processingAction.value[incube.id] = true;
    const result = await managerStore.toggleIncubeStatus(incube.id, incube.status, true);
    processingAction.value[incube.id] = false;

    if (result.success) {
      useToast().success(result.message);
      const index = filteredIncubes.value.findIndex(i => i.id === incube.id);
      if (index !== -1) {
        filteredIncubes.value[index].status = incube.status === 'active' ? 'suspended' : 'active';
      }
    } else {
      useToast().error(result.message);
    }
  }
};

const showAlertModal = ref(false);
const alertForm = ref({
  incubeId: '',
  incubeName: '',
  message: '',
});
const alertLoading = ref(false);

const sendAlert = (incube: any) => {
  alertForm.value = {
    incubeId: incube.id,
    incubeName: `${incube.prenom} ${incube.nom}`,
    message: '',
  };
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
  alertForm.value = { incubeId: '', incubeName: '', message: '' };
};

const entitiesStore = useEntitiesStore();

const submitAlert = async () => {
  alertLoading.value = true;
  try {
    const result = await managerStore.sendIncubeAlert(alertForm.value.incubeId, alertForm.value.message, true);
    if (result.success) {
      useToast().success(`Alerte envoyée à ${alertForm.value.incubeName}`);
      closeAlertModal();
    } else {
      useToast().error(result.message);
    }
  } finally {
    alertLoading.value = false;
  }
};

// Validation d'informations bancaires
const showValidationModal = ref(false);
const selectedIncubeForValidation = ref<any>(null);
const validationLoading = ref(false);

const openValidationModal = (incube: any) => {
  selectedIncubeForValidation.value = incube;
  showValidationModal.value = true;
};

const handleValidation = async (approve: boolean) => {
  if (!selectedIncubeForValidation.value) return;
  
  validationLoading.value = true;
  const res = await adminStore.validateBankUpdate(selectedIncubeForValidation.value.id, approve);
  validationLoading.value = false;
  
  if (res.success) {
    useToast().success(res.message);
    showValidationModal.value = false;
    selectedIncubeForValidation.value = null;
    loadData();
  } else {
    useToast().error(res.message);
  }
};


// Validation de changement d'équipe
const showTeamValidationModal = ref(false);
const selectedIncubeForTeamValidation = ref<any>(null);

const openTeamValidationModal = (incube: any) => {
  selectedIncubeForTeamValidation.value = incube;
  showTeamValidationModal.value = true;
};

const getTeamName = (idOrObj: any) => {
  if (!idOrObj) return '...';
  if (typeof idOrObj === 'object' && idOrObj.nom) return idOrObj.nom;
  const t = teamStore.teams.find(team => team.id === idOrObj);
  return t ? t.nom : 'Inconnu';
};

const handleTeamValidation = async (approve: boolean) => {
  if (!selectedIncubeForTeamValidation.value) return;

  validationLoading.value = true;
  const res = await formateurStore.validateTeamUpdate(selectedIncubeForTeamValidation.value.id, approve);
  validationLoading.value = false;

  if (res.success) {
    useToast().success(res.message);
    showTeamValidationModal.value = false;
    selectedIncubeForTeamValidation.value = null;
    loadData();
  } else {
    useToast().error(res.message);
  }
};
</script>
