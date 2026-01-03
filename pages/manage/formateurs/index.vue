<template>
  <div>
     <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Gestion des Formateurs' }
    ]" class="mb-6" />
    
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full overflow-hidden">
      <div class="w-full sm:w-auto">
        <h1 class="text-2xl md:text-3xl font-bold truncate">Gestion des formateurs</h1>
        <p class="text-[var(--color-text-secondary)] mt-1 truncate">Supervision de l'équipe pédagogique</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary w-full md:w-auto shrink-0">
        <IconPlus class="w-5 h-5 mr-2" />
        Nouveau Formateur
      </button>
    </div>

    <!-- Filtres -->
    <div class="card mb-6 max-w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6">
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
                  <span class="text-xs text-gray-500 ml-2">({{ suggestion.email }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <label class="label">Type de formateur</label>
          <select v-model="filters.role" class="input">
            <option value="">Tous</option>
            <option value="formateur">Formateurs</option>
            <option value="formateur_principal">Formateurs Principaux</option>
          </select>
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
        <p class="text-sm text-blue-800 dark:text-blue-300">Total Formateurs</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ filteredFormateurs.length }}</p>
      </div>
      <div class="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
        <p class="text-sm text-purple-800 dark:text-purple-300">Formateurs Principaux</p>
        <p class="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-1">{{ principalCount }}</p>
      </div>
      <div class="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <p class="text-sm text-green-800 dark:text-green-300">Actifs</p>
        <p class="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{{ activeCount }}</p>
      </div>
    </div>

    <!-- Liste -->
    <div class="card">
      <div v-if="managerStore.loading" class="flex justify-center items-center py-12">
        <IconLoader class="w-10 h-10 text-primary-600 animate-spin" />
        <span class="ml-3 text-lg font-medium text-gray-500">Chargement des formateurs...</span>
      </div>
      <div v-else>
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-bg-secondary)] border-b">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Formateur</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Téléphone</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Spécialité</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="formateur in filteredFormateurs" :key="formateur.id"
                class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td class="px-4 py-3">
                  <NuxtLink :to="`/manage/formateurs/${formateur.id}`"
                    class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      <img v-if="formateur.photoUrl" :src="formateur.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ formateur.prenom ? formateur.prenom[0] : '?' }}{{ formateur.nom ? formateur.nom[0] : '?' }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-[var(--color-text-primary)]">
                        {{ formateur.prenom }} {{ formateur.nom }}
                        <span v-if="formateur.id === authStore.currentUser?.id && ['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || '')" class="badge badge-info ml-2 text-xs py-0.5 px-2">Vous</span>
                      </p>
                    </div>
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm">{{ formateur.email }}</td>
                <td class="px-4 py-3 text-sm">{{ formateur.telephone || '-' }}</td>
                <td class="px-4 py-3 text-sm">{{ formateur.specialite || '-' }}</td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="formateur.role === 'formateur_principal'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Principal
                  </span>
                  <span v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Formateur
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="formateur.status === 'active'" class="badge badge-success">Actif</span>
                  <span v-else-if="formateur.status === 'suspended'" class="badge badge-error">Suspendu</span>
                  <span v-else class="badge badge-warning">En attente</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <!-- Voir les détails -->
                    <NuxtLink :to="`/manage/formateurs/${formateur.id}`"
                      class="btn btn-ghost p-1 text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Voir détails">
                      <IconEye class="w-4 h-4" />
                    </NuxtLink>

                    <template v-if="formateur.id !== authStore.currentUser?.id || !['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || '')">

                    <!-- Promouvoir/Rétrograder -->
                    <button v-if="formateur.role === 'formateur'" @click="promoteToPrincipal(formateur)"
                      class="btn btn-ghost p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      title="Promouvoir en formateur principal" :disabled="!!processingAction[formateur.id]">
                      <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                      <IconStar v-else class="w-4 h-4" />
                    </button>
                    <button v-else-if="formateur.role === 'formateur_principal'" @click="demoteFromPrincipal(formateur)"
                      class="btn btn-ghost p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      title="Rétrograder en formateur" :disabled="!!processingAction[formateur.id]">
                      <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                      <IconStarFilled v-else class="w-4 h-4" />
                    </button>

                    <!-- Suspendre/Activer (Seulement si non en attente) -->
                    <template v-if="formateur.status !== 'pending'">
                      <button v-if="formateur.status === 'active'" @click="toggleSuspend(formateur)"
                        class="btn btn-ghost p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        title="Suspendre" :disabled="!!processingAction[formateur.id]">
                        <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                        <IconLock v-else class="w-4 h-4" />
                      </button>
                      <button v-else @click="toggleSuspend(formateur)"
                        class="btn btn-ghost p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Activer" :disabled="!!processingAction[formateur.id]">
                        <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                        <IconLockOpen v-else class="w-4 h-4" />
                      </button>
                    </template>

                    <!-- Renvoyer l'invitation (Seulement si en attente) -->
                    <button v-if="formateur.status === 'pending'" @click="resendInvite(formateur)"
                      class="btn btn-ghost p-1 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      title="Renvoyer invitation" :disabled="!!processingAction[formateur.id]">
                      <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                      <IconMailForward v-else class="w-4 h-4" />
                    </button>

                    <!-- Alerter -->
                    <button @click="sendAlert(formateur)"
                      class="btn btn-ghost p-1 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      title="Envoyer une alerte">
                      <IconAlertTriangle class="w-4 h-4" />
                    </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile View (Cards) -->
        <div class="md:hidden space-y-4 p-4">
           <div v-for="formateur in filteredFormateurs" :key="formateur.id" class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
             
             <!-- Header -->
              <div class="flex items-center justify-between mb-3">
                 <NuxtLink :to="`/manage/formateurs/${formateur.id}`" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    <img v-if="formateur.photoUrl" :src="formateur.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
                    <span v-else>{{ formateur.prenom ? formateur.prenom[0] : '?' }}{{ formateur.nom ? formateur.nom[0] : '?' }}</span>
                  </div>
                   <div>
                     <p class="font-medium text-[var(--color-text-primary)]">
                       {{ formateur.prenom }} {{ formateur.nom }}
                     </p>
                     <span v-if="formateur.id === authStore.currentUser?.id && ['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || '')" class="badge badge-info text-[10px] py-0 px-2">Vous</span>
                   </div>
                 </NuxtLink>
                 <div>
                    <span v-if="formateur.status === 'active'" class="badge badge-success text-xs">Actif</span>
                    <span v-else-if="formateur.status === 'suspended'" class="badge badge-error text-xs">Suspendu</span>
                    <span v-else class="badge badge-warning text-xs">En attente</span>
                 </div>
              </div>

              <!-- Content -->
              <div class="space-y-2 mb-4 text-sm text-[var(--color-text-secondary)]">
                 <div class="flex items-center justify-between">
                    <span class="font-medium">Email:</span>
                    <span class="truncate max-w-[180px]">{{ formateur.email }}</span>
                 </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Téléphone:</span>
                    <span>{{ formateur.telephone || '-' }}</span>
                 </div>
                 <div class="flex items-center justify-between">
                    <span class="font-medium">Spécialité:</span>
                    <span class="truncate max-w-[150px]">{{ formateur.specialite || '-' }}</span>
                 </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Rôle:</span>
                    <span v-if="formateur.role === 'formateur_principal'"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Principal
                    </span>
                    <span v-else
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Formateur
                    </span>
                 </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-1 border-t pt-3 dark:border-gray-700">
                   <!-- Voir les détails -->
                    <NuxtLink :to="`/manage/formateurs/${formateur.id}`"
                      class="btn btn-ghost btn-sm text-[var(--color-text-secondary)]" title="Voir détails">
                      <IconEye class="w-4 h-4" />
                    </NuxtLink>

                    <template v-if="formateur.id !== authStore.currentUser?.id || !['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || '')">
                        <!-- Promouvoir/Rétrograder -->
                        <button v-if="formateur.role === 'formateur'" @click="promoteToPrincipal(formateur)"
                          class="btn btn-ghost btn-sm text-orange-600" title="Promouvoir" :disabled="!!processingAction[formateur.id]">
                          <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                          <IconStar v-else class="w-4 h-4" />
                        </button>
                        <button v-else-if="formateur.role === 'formateur_principal'" @click="demoteFromPrincipal(formateur)"
                          class="btn btn-ghost btn-sm text-purple-600" title="Rétrograder" :disabled="!!processingAction[formateur.id]">
                          <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                          <IconStarFilled v-else class="w-4 h-4" />
                        </button>

                        <!-- Suspendre/Activer -->
                        <template v-if="formateur.status !== 'pending'">
                          <button v-if="formateur.status === 'active'" @click="toggleSuspend(formateur)"
                            class="btn btn-ghost btn-sm text-orange-600" title="Suspendre" :disabled="!!processingAction[formateur.id]">
                            <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                            <IconLock v-else class="w-4 h-4" />
                          </button>
                          <button v-else @click="toggleSuspend(formateur)"
                            class="btn btn-ghost btn-sm text-green-600" title="Activer" :disabled="!!processingAction[formateur.id]">
                            <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                            <IconLockOpen v-else class="w-4 h-4" />
                          </button>
                        </template>

                        <!-- Renvoyer l'invitation -->
                        <button v-if="formateur.status === 'pending'" @click="resendInvite(formateur)"
                          class="btn btn-ghost btn-sm text-teal-600" title="Renvoyer invitation" :disabled="!!processingAction[formateur.id]">
                          <IconLoader v-if="processingAction[formateur.id]" class="w-4 h-4 animate-spin" />
                          <IconMailForward v-else class="w-4 h-4" />
                        </button>

                        <!-- Alerter -->
                        <button @click="sendAlert(formateur)" class="btn btn-ghost btn-sm text-yellow-600" title="Alerter">
                          <IconAlertTriangle class="w-4 h-4" />
                        </button>
                   </template>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Modale d'alerte -->
    <AppModal v-model="showAlertModal" title="Envoyer une alerte" is-form @confirm="submitAlert"
      submit-label="Envoyer" submit-variant="primary" :form="alertForm" :loading="alertLoading"
      :fields="[
        { name: 'formateurName', label: 'Destinataire', type: 'text', disabled: true },
        { name: 'message', label: 'Message d\'alerte *', type: 'textarea', required: true, placeholder: 'Raison de l\'alerte...' }
      ]">
      <template #description>
        <p class="text-sm text-gray-500 mb-4">Envoyez une notification importante à ce formateur.</p>
      </template>
    </AppModal>

    <!-- Modale de création -->
    <AppModal v-model="showCreateModal" title="Ajouter un formateur" is-form @confirm="submitCreate"
      :loading="managerStore.loading" submit-label="Créer" submit-variant="primary" :form="createForm"
      :fields="[
        { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'DITCHARE' },
        { name: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'Elisée' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'lenvol.benin@gmail.com' },
        { name: 'role', label: 'Rôle', type: 'select', required: true, options: [{ label: 'Formateur', value: 'formateur' }, { label: 'Formateur Principal', value: 'formateur_principal' }] }
      ]" />
  </div>
</template>

<script setup lang="ts">
import { IconFilterOff, IconStarFilled, IconStar, IconLock, IconLockOpen, IconAlertTriangle, IconSearch, IconSend, IconPlus, IconLoader, IconMailForward, IconEye } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Gestion des Formateurs',
  meta: [
    { 
      name: 'description', 
      content: "Supervision de l'équipe pédagogique. Gérer les profils et les rôles des formateurs." 
    }
  ]
});

const managerStore = useManagerStore();
const authStore = useAuthStore();

const filters = ref({
  search: '',
  role: '',
  status: '',
});

const searchQuery = ref('');
const suggestions = ref<any[]>([]);
const showSuggestions = ref(false);

const handleSearchInput = async () => {
  if (searchQuery.value.length >= 3) {
    const results = await managerStore.searchFormateurs({ search: searchQuery.value });
    suggestions.value = results.slice(0, 3);
    showSuggestions.value = true;
  } else {
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const selectSuggestion = (suggestion: any) => {
  navigateTo(`/manage/formateurs/${suggestion.id}`);
  showSuggestions.value = false;
};

const performSearch = () => {
  filters.value.search = searchQuery.value;
  showSuggestions.value = false;
};

const showAlertModal = ref(false);
const alertForm = ref({
  formateurId: '',
  formateurName: '',
  message: '',
});
const alertLoading = ref(false);

const showCreateModal = ref(false);
const createForm = ref({
  nom: '',
  prenom: '',
  email: '',
  role: 'formateur_principal',
});

const closeCreateModal = () => {
  showCreateModal.value = false;
  createForm.value = { nom: '', prenom: '', email: '', role: 'formateur_principal' };
};

const submitCreate = async () => {
  const result = await managerStore.createFormateur(createForm.value);
  if (result.success) {
    useToast().success('Formateur créé avec succès');
    closeCreateModal();
    // Recharger la liste pour afficher le nouveau formateur
    await loadData();
  } else {
    useToast().error(result.message);
  }
};

const filteredFormateurs = ref<any[]>([]);

const loadData = async () => {
  filteredFormateurs.value = await managerStore.loadFormateurs(filters.value);
};

// Chargement initial
onMounted(async () => {
  await loadData();
});

// Observer les filtres
watch(filters, async () => {
  await loadData();
}, { deep: true });

const resetFilters = () => {
  filters.value = { search: '', role: '', status: '' };
  searchQuery.value = '';
  suggestions.value = [];
};

// État pour gérer le chargement des actions par élément
const processingAction = ref<Record<string, boolean>>({});

const resendInvite = async (formateur: any) => {
  if (await useConfirm().confirm({
    message: `Renvoyer l'invitation à ${formateur.prenom} ${formateur.nom} ?`,
    title: 'Renvoyer invitation',
    type: 'primary'
  })) {
    processingAction.value[formateur.id] = true;
    const result = await managerStore.resendInvitation(formateur.id, true);
    processingAction.value[formateur.id] = false;

    if (result.success) {
      useToast().success(result.message);
    } else {
      useToast().error(result.message);
    }
  }
};

const principalCount = computed(() => {
  return filteredFormateurs.value.filter(f => f.role === 'formateur_principal').length;
});

const activeCount = computed(() => {
  return filteredFormateurs.value.filter(f => f.status === 'active').length;
});

const promoteToPrincipal = async (formateur: any) => {
  if (await useConfirm().confirm({
    message: `Voulez-vous promouvoir ${formateur.prenom} ${formateur.nom} en Formateur Principal ?`,
    title: 'Promouvoir Formateur',
    type: 'primary'
  })) {
    processingAction.value[formateur.id] = true;
    const result = await managerStore.updateFormRole(formateur.id, 'formateur_principal', true);
    processingAction.value[formateur.id] = false;

    if (result.success) {
      useToast().success(`${formateur.prenom} ${formateur.nom} a été promu en Formateur Principal !`);
      // Mettre à jour l'état local immédiatement
      const index = filteredFormateurs.value.findIndex(f => f.id === formateur.id);
      if (index !== -1) {
        filteredFormateurs.value[index].role = 'formateur_principal';
      }
    } else {
      useToast().error(result.message);
    }
  }
};

const demoteFromPrincipal = async (formateur: any) => {
  if (await useConfirm().confirm({
    message: `Voulez-vous rétrograder ${formateur.prenom} ${formateur.nom} en Formateur ?`,
    title: 'Rétrograder Formateur',
    type: 'primary'
  })) {
    processingAction.value[formateur.id] = true;
    const result = await managerStore.updateFormRole(formateur.id, 'formateur', true);
    processingAction.value[formateur.id] = false;

    if (result.success) {
      useToast().success(`${formateur.prenom} ${formateur.nom} a été rétrogradé en Formateur.`);
      // Mettre à jour l'état local immédiatement
      const index = filteredFormateurs.value.findIndex(f => f.id === formateur.id);
      if (index !== -1) {
        filteredFormateurs.value[index].role = 'formateur';
      }
    } else {
      useToast().error(result.message);
    }
  }
};

const toggleSuspend = async (formateur: any) => {
  const action = formateur.status === 'active' ? 'suspendre' : 'réactiver';
  if (await useConfirm().confirm({
    message: `Voulez-vous ${action} ${formateur.prenom} ${formateur.nom} ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} formateur`,
    type: formateur.status === 'active' ? 'danger' : 'primary'
  })) {
    processingAction.value[formateur.id] = true;
    const result = await managerStore.toggleFormStatus(formateur.id, formateur.status, true);
    processingAction.value[formateur.id] = false;

    if (result.success) {
      useToast().success(result.message);
      const index = filteredFormateurs.value.findIndex(f => f.id === formateur.id);
      if (index !== -1) {
        filteredFormateurs.value[index].status = formateur.status === 'active' ? 'suspended' : 'active';
      }
    } else {
      useToast().error(result.message);
    }
  }
};

const sendAlert = (formateur: any) => {
  alertForm.value = {
    formateurId: formateur.id,
    formateurName: `${formateur.prenom} ${formateur.nom}`,
    message: '',
  };
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
  alertForm.value = { formateurId: '', formateurName: '', message: '' };
};

const submitAlert = async () => {
  alertLoading.value = true;
  try {
    const result = await managerStore.sendFormAlert(alertForm.value.formateurId, alertForm.value.message, true);
    if (result.success) {
      useToast().success(`Alerte envoyée à ${alertForm.value.formateurName}`);
      closeAlertModal();
    } else {
      useToast().error(result.message);
    }
  } finally {
    alertLoading.value = false;
  }
};
</script>
