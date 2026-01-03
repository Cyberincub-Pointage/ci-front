<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Gestion des Administrateurs' }]" class="mb-6" />
    
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full overflow-hidden">
      <div class="w-full sm:w-auto">
        <h1 class="text-2xl md:text-3xl font-bold truncate">Gestion des administrateurs</h1>
        <p class="text-[var(--color-text-secondary)] mt-1 truncate">Supervision de l'équipe d'administration</p>
      </div>
      <button v-if="isSuperAdmin" @click="showCreateModal = true" class="btn btn-primary w-full md:w-auto shrink-0">
        <IconPlus class="w-5 h-5 mr-2" />
        Inviter un Administrateur
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
          <label class="label">Rôle</label>
          <select v-model="filters.role" class="input">
            <option value="">Tous</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
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

    <!-- Liste -->
    <div class="card">
      <div v-if="adminStore.loading" class="flex justify-center items-center py-12">
        <IconLoader class="w-10 h-10 text-primary-600 animate-spin" />
        <span class="ml-3 text-lg font-medium text-gray-500">Chargement des administrateurs...</span>
      </div>
      <div v-else>
        <!-- Vue Desktop (Tableau) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-bg-secondary)] border-b">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Administrateur</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in filteredAdmins" :key="admin.id"
                class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td class="px-4 py-3">
                  <NuxtLink :to="`/admin/admins/${admin.id}`"
                    class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      <img v-if="admin.photoUrl" :src="admin.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ admin.prenom ? admin.prenom[0] : '?' }}{{ admin.nom ? admin.nom[0] : '?' }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-[var(--color-text-primary)]">
                        {{ admin.prenom }} {{ admin.nom }}
                        <span v-if="admin.id === authStore.currentUser?.id" class="badge badge-info ml-2 text-xs py-0.5 px-2">Vous</span>
                      </p>
                    </div>
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm">{{ admin.email }}</td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="admin.role === 'super_admin'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Super Admin
                  </span>
                  <span v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Admin
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="admin.status === 'active'" class="badge badge-success">Actif</span>
                  <span v-else-if="admin.status === 'suspended'" class="badge badge-error">Suspendu</span>
                  <span v-else class="badge badge-warning">En attente</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <!-- Voir -->
                    <NuxtLink :to="`/admin/admins/${admin.id}`"
                      class="btn btn-ghost p-1 text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Voir détails">
                      <IconEye class="w-4 h-4" />
                    </NuxtLink>

                    <!-- Actions Super Admin Uniquement -->
                    <template v-if="isSuperAdmin && admin.id !== authStore.currentUser?.id">
                      <!-- Promouvoir/Rétrograder -->
                      <button v-if="admin.role === 'admin'" @click="promoteToSuperAdmin(admin)"
                        class="btn btn-ghost p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        title="Promouvoir en Super Admin" :disabled="!!processingAction[admin.id]">
                        <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                        <IconStar v-else class="w-4 h-4" />
                      </button>
                      <button v-else-if="admin.role === 'super_admin'" @click="demoteToAdmin(admin)"
                        class="btn btn-ghost p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        title="Rétrograder en Admin" :disabled="!!processingAction[admin.id]">
                        <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                        <IconStarFilled v-else class="w-4 h-4" />
                      </button>

                      <!-- Suspendre/Activer (Seulement si non en attente) -->
                      <template v-if="admin.status !== 'pending'">
                        <button v-if="admin.status === 'active'" @click="toggleSuspend(admin)"
                          class="btn btn-ghost p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          title="Suspendre" :disabled="!!processingAction[admin.id]">
                          <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                          <IconLock v-else class="w-4 h-4" />
                        </button>
                        <button v-else @click="toggleSuspend(admin)"
                          class="btn btn-ghost p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Activer" :disabled="!!processingAction[admin.id]">
                          <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                          <IconLockOpen v-else class="w-4 h-4" />
                        </button>
                      </template>

                      <!-- Renvoyer l'invitation (Seulement si en attente) -->
                      <button v-if="admin.status === 'pending'" @click="resendInvite(admin)"
                        class="btn btn-ghost p-1 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                        title="Renvoyer invitation" :disabled="!!processingAction[admin.id]">
                        <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                        <IconMailForward v-else class="w-4 h-4" />
                      </button>

                      <!-- Alerter -->
                      <button @click="sendAlert(admin)"
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

        <!-- Vue Mobile (Cartes) -->
        <div class="md:hidden space-y-4 p-4">
          <div v-for="admin in filteredAdmins" :key="admin.id" class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            
            <!-- En-tête de la carte -->
            <div class="flex items-center justify-between mb-3">
              <NuxtLink :to="`/admin/admins/${admin.id}`" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  <img v-if="admin.photoUrl" :src="admin.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
                  <span v-else>{{ admin.prenom ? admin.prenom[0] : '?' }}{{ admin.nom ? admin.nom[0] : '?' }}</span>
                </div>
                <div>
                   <p class="font-medium text-[var(--color-text-primary)]">
                    {{ admin.prenom }} {{ admin.nom }}
                  </p>
                  <span v-if="admin.id === authStore.currentUser?.id" class="badge badge-info text-[10px] py-0 px-2">Vous</span>
                </div>
              </NuxtLink>
               <div>
                  <span v-if="admin.status === 'active'" class="badge badge-success text-xs">Actif</span>
                  <span v-else-if="admin.status === 'suspended'" class="badge badge-error text-xs">Suspendu</span>
                  <span v-else class="badge badge-warning text-xs">En attente</span>
               </div>
            </div>

            <!-- Détails -->
            <div class="space-y-2 mb-4 text-sm text-[var(--color-text-secondary)]">
               <div class="flex items-center justify-between">
                  <span class="font-medium">Email:</span>
                  <span class="truncate max-w-[180px]">{{ admin.email }}</span>
               </div>
               <div class="flex items-center justify-between">
                  <span class="font-medium">Rôle:</span>
                   <span v-if="admin.role === 'super_admin'"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Super Admin
                    </span>
                    <span v-else
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Admin
                    </span>
               </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-1 border-t pt-3 dark:border-gray-700">
                <!-- Voir -->
                <NuxtLink :to="`/admin/admins/${admin.id}`"
                   class="btn btn-ghost btn-sm text-[var(--color-text-secondary)]" title="Voir détails">
                   <IconEye class="w-4 h-4" />
                </NuxtLink>

                <template v-if="isSuperAdmin && admin.id !== authStore.currentUser?.id">
                   <button v-if="admin.role === 'admin'" @click="promoteToSuperAdmin(admin)"
                        class="btn btn-ghost btn-sm text-purple-600" title="Promouvoir" :disabled="!!processingAction[admin.id]">
                        <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                        <IconStar v-else class="w-4 h-4" />
                   </button>
                   <button v-else-if="admin.role === 'super_admin'" @click="demoteToAdmin(admin)"
                        class="btn btn-ghost btn-sm text-orange-600" title="Rétrograder" :disabled="!!processingAction[admin.id]">
                        <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                        <IconStarFilled v-else class="w-4 h-4" />
                   </button>

                   <template v-if="admin.status !== 'pending'">
                      <button v-if="admin.status === 'active'" @click="toggleSuspend(admin)"
                          class="btn btn-ghost btn-sm text-orange-600" title="Suspendre" :disabled="!!processingAction[admin.id]">
                          <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                          <IconLock v-else class="w-4 h-4" />
                      </button>
                      <button v-else @click="toggleSuspend(admin)"
                          class="btn btn-ghost btn-sm text-green-600" title="Activer" :disabled="!!processingAction[admin.id]">
                          <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                          <IconLockOpen v-else class="w-4 h-4" />
                      </button>
                   </template>

                   <button v-if="admin.status === 'pending'" @click="resendInvite(admin)"
                        class="btn btn-ghost btn-sm text-teal-600" title="Renvoyer invitation" :disabled="!!processingAction[admin.id]">
                        <IconLoader v-if="processingAction[admin.id]" class="w-4 h-4 animate-spin" />
                        <IconMailForward v-else class="w-4 h-4" />
                   </button>

                   <button @click="sendAlert(admin)" class="btn btn-ghost btn-sm text-yellow-600" title="Alerter">
                        <IconAlertTriangle class="w-4 h-4" />
                   </button>
                </template>
            </div>
          </div>
        </div>
        
        <div v-if="filteredAdmins.length === 0" class="text-center py-8 text-gray-500">
          Aucun administrateur trouvé.
        </div>
      </div>
    </div>

    <!-- Modale de création (Invitation) -->
    <AppModal v-model="showCreateModal" title="Inviter un administrateur" is-form @confirm="submitCreate"
      submit-label="Inviter" submit-variant="primary" :form="createForm" :loading="adminStore.loading"
      :fields="[
        { name: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'Prénom' },
        { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'admin@exemple.com' },
        { name: 'role', label: 'Rôle', type: 'select', required: true, options: [{ label: 'Administrateur', value: 'admin' }, { label: 'Super Administrateur', value: 'super_admin' }] }
      ]">
      <template #description>
        <p class="text-sm text-gray-500 mb-4">Envoyez une invitation par email pour ajouter un nouveau membre à l'équipe administrative.</p>
      </template>
    </AppModal>

    <!-- Modale d'alerte -->
    <AppModal v-model="showAlertModal" title="Envoyer une alerte" is-form @confirm="submitAlert"
      submit-label="Envoyer" submit-variant="primary" :form="alertForm" :loading="alertLoading"
      :fields="[
        { name: 'adminName', label: 'Destinataire', type: 'text', disabled: true },
        { name: 'message', label: 'Message d\'alerte *', type: 'textarea', required: true, placeholder: 'Raison de l\'alerte...' }
      ]">
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { IconFilterOff, IconSearch, IconPlus, IconLoader, IconMailForward, IconEye, IconAlertTriangle, IconStar, IconStarFilled, IconLock, IconLockOpen } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Gestion des administrateurs',
  meta: [
    { 
      name: 'description', 
      content: "Supervision de l'équipe d'administration. Gérer les invitations, les rôles et les statuts des administrateurs." 
    }
  ]
});

const adminStore = useAdminStore();
const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();
const api = useAPI();

const isSuperAdmin = computed(() => authStore.currentUser?.role === 'super_admin');

// Filtres de recherche et de liste
const filters = ref({
  search: '',
  role: '',
  status: '',
});

// Gestion de la recherche avec autocomplétion
const searchQuery = ref('');
const suggestions = ref<any[]>([]);
const showSuggestions = ref(false);

const handleSearchInput = async () => {
  if (searchQuery.value.length >= 3) {
    const results = await adminStore.searchAdmins({ search: searchQuery.value });
    suggestions.value = results.slice(0, 3);
    showSuggestions.value = true;
  } else {
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const selectSuggestion = (suggestion: any) => {
  navigateTo(`/admin/admins/${suggestion.id}`);
  showSuggestions.value = false;
};

const performSearch = () => {
  filters.value.search = searchQuery.value;
  showSuggestions.value = false;
};

const resetFilters = () => {
  filters.value = { search: '', role: '', status: '' };
  searchQuery.value = '';
  suggestions.value = [];
};

const filteredAdmins = ref<any[]>([]);

// Chargement de la liste des administrateurs avec filtres appliqués
const loadData = async () => {
  filteredAdmins.value = await adminStore.loadAdmins(filters.value);
};

// Start
onMounted(async () => {
  await loadData();
});

// Changements de filtres pour recharger les données
watch(filters, async () => {
  await loadData();
}, { deep: true });

// Actions sur les administrateurs
const processingAction = ref<Record<string, boolean>>({});

// Création d'un nouvel administrateur (Invitation)
const showCreateModal = ref(false);
const createForm = ref({
  nom: '',
  prenom: '',
  email: '',
  role: 'admin',
});

const closeCreateModal = () => {
  showCreateModal.value = false;
  createForm.value = { nom: '', prenom: '', email: '', role: 'admin' };
};

const submitCreate = async () => {
  const result = await adminStore.createAdmin(createForm.value);
  if (result.success) {
    toast.success('Invitation envoyée avec succès');
    closeCreateModal();
    await loadData();
  } else {
    toast.error(result.message);
  }
};

// Alert Modal
const showAlertModal = ref(false);
const alertLoading = ref(false);
const alertForm = ref({
  adminId: '',
  adminName: '',
  message: '',
});

const sendAlert = (admin: any) => {
  alertForm.value = {
    adminId: admin.id,
    adminName: `${admin.prenom} ${admin.nom}`,
    message: '',
  };
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
  alertForm.value = { adminId: '', adminName: '', message: '' };
};

const submitAlert = async () => {
  if (!alertForm.value.message) return;
  
  alertLoading.value = true;
  try {
     await api(`/admin/admin/${alertForm.value.adminId}/alert`, {
        method: 'POST',
        body: { message: alertForm.value.message }
     });
     toast.success(`Alerte envoyée à ${alertForm.value.adminName}`);
     closeAlertModal();
  } catch (e: any) {
     toast.error(e.message || "Erreur lors de l'envoi de l'alerte");
  } finally {
     alertLoading.value = false;
  }
};

const resendInvite = async (admin: any) => {
  if (await confirm.confirm({
    message: `Renvoyer l'invitation à ${admin.prenom} ${admin.nom} ?`,
    title: 'Renvoyer invitation',
    type: 'primary'
  })) {
    processingAction.value[admin.id] = true;
    try {
        await api(`/admin/resend-admin-invite/${admin.id}`, { method: 'POST' });
        toast.success("Invitation renvoyée avec succès");
    } catch (e: any) {
        toast.error(e.message || "Erreur lors de l'envoi");
    }
    processingAction.value[admin.id] = false;
  }
};

const promoteToSuperAdmin = async (admin: any) => {
  if (await confirm.confirm({
    message: `Promouvoir ${admin.prenom} ${admin.nom} en Super Admin ?`,
    title: 'Promouvoir Admin',
    type: 'primary'
  })) {
    processingAction.value[admin.id] = true;
    try {
      await api(`/admin/update-admin-role/${admin.id}`, { 
          method: 'PATCH',
          body: { role: 'super_admin' }
      });
      
      const index = filteredAdmins.value.findIndex(a => a.id === admin.id);
      if (index !== -1) filteredAdmins.value[index].role = 'super_admin';
      
      toast.success(`${admin.prenom} ${admin.nom} est maintenant Super Admin`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour");
    }
    processingAction.value[admin.id] = false;
  }
};

const demoteToAdmin = async (admin: any) => {
  if (await confirm.confirm({
    message: `Rétrograder ${admin.prenom} ${admin.nom} en Admin ?`,
    title: 'Rétrograder Admin',
    type: 'primary'
  })) {
    processingAction.value[admin.id] = true;
    try {
      await api(`/admin/update-admin-role/${admin.id}`, { 
          method: 'PATCH',
          body: { role: 'admin' }
      });
      
      const index = filteredAdmins.value.findIndex(a => a.id === admin.id);
      if (index !== -1) filteredAdmins.value[index].role = 'admin';
      
      toast.success(`${admin.prenom} ${admin.nom} est maintenant Admin`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour");
    }
    processingAction.value[admin.id] = false;
  }
};

const toggleSuspend = async (admin: any) => {
  const action = admin.status === 'active' ? 'suspendre' : 'réactiver';
  const newStatus = admin.status === 'active' ? 'suspended' : 'active';
  
  if (await confirm.confirm({
    message: `Voulez-vous ${action} ${admin.prenom} ${admin.nom} ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} administrateur`,
    type: admin.status === 'active' ? 'danger' : 'primary'
  })) {
    processingAction.value[admin.id] = true;
    try {
      await api(`/admin/update-admin-status/${admin.id}`, { 
          method: 'PATCH',
          body: { status: newStatus }
      });
      
      const index = filteredAdmins.value.findIndex(a => a.id === admin.id);
      if (index !== -1) filteredAdmins.value[index].status = newStatus;
      
      toast.success(`Statut mis à jour : ${newStatus === 'active' ? 'Actif' : 'Suspendu'}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour");
    }
    processingAction.value[admin.id] = false;
  }
};
</script>
