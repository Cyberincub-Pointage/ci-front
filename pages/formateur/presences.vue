<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Validation des présences' }]" class="mb-6" />
    
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Validation des présences</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Gérez les présences de votre équipe</p>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="label">Du</label>
          <div class="relative">
            <input type="date" v-model="filters.startDate" class="input pl-10 w-full" />
            <IconCalendar class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label class="label">Au</label>
          <div class="relative">
            <input type="date" v-model="filters.endDate" class="input pl-10 w-full" />
            <IconCalendar class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label class="label">Statut</label>
          <select v-model="filters.status" class="input w-full">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="validated">Validée</option>
            <option value="rejected">Refusée</option>
          </select>
        </div>
        <div>
          <button @click="resetFilters" class="btn btn-outline w-full flex gap-2 justify-center items-center">
            <IconFilterOff class="w-5 h-5" />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <ul class="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
        <li class="mr-2">
          <button @click="activeTab = 'presences'" 
                  class="inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group"
                  :class="activeTab === 'presences' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'">
            <IconCalendarCheck class="w-5 h-5 mr-2" />
            Présences du jour
          </button>
        </li>
        <li class="mr-2">
          <button @click="activeTab = 'retro'" 
                  class="inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group"
                  :class="activeTab === 'retro' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'">
            <IconHistory class="w-5 h-5 mr-2" />
            Demandes Rétroactives
          </button>
        </li>
      </ul>
    </div>

     <!-- CONTENU PRÉSENCES -->
    <div v-if="activeTab === 'presences'">
      <!-- Tableau Desktop -->
      <div class="card overflow-hidden hidden md:block">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-bg-secondary)] border-b">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Incubé</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Arrivée</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Géolocalisation</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="presence in filteredPresences" :key="presence.id"
                class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td class="px-4 py-3 text-sm font-medium">
                  <NuxtLink :to="`/manage/incubes/${presence.incubeId}`" class="hover:text-blue-600 hover:underline">
                    {{ getIncubeName(presence.incubeId) }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm">{{ formatDate(presence.date) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatTime(presence.heureArrivee) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="presence.isGeolocValid"
                    class="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs">
                    <IconMapCheck class="w-4 h-4" /> Valide
                  </span>
                  <span v-else class="text-red-600 dark:text-red-400 flex items-center gap-1 text-xs">
                    <IconMapX class="w-4 h-4" /> Invalide
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <StatusBadge :status="presence.status" type="presence" />
                  <span v-if="presence.isRetro" class="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <IconHistory class="w-3 h-3" /> Rétro
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2" v-if="presence.status === 'pending'">
                    <button @click="validatePresence(presence.id, true)"
                      class="btn btn-ghost text-green-600 dark:text-green-400 p-1" title="Valider">
                      <IconCheck class="w-5 h-5" />
                    </button>
                    <button @click="openRejectModal(presence)" class="btn btn-ghost text-red-600 dark:text-red-400 p-1"
                      title="Refuser">
                      <IconX class="w-5 h-5" />
                    </button>
                  </div>
                  <span v-else class="text-xs text-[var(--color-text-secondary)]">
                    Traité
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredPresences.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
            <IconClipboardOff class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune présence trouvée</p>
          </div>
        </div>
      </div>

      <!-- Vue Mobile (Cartes) -->
      <div class="md:hidden space-y-4">
        <div v-for="presence in filteredPresences" :key="presence.id" class="card p-4">
          <div class="flex justify-between items-start mb-3">
             <div>
                <NuxtLink :to="`/manage/incubes/${presence.incubeId}`" class="font-bold text-gray-900 dark:text-white hover:text-primary-600">
                    {{ getIncubeName(presence.incubeId) }}
                </NuxtLink>
                <div class="text-sm text-gray-500 mt-1 flex flex-col gap-1">
                   <span>{{ formatDate(presence.date) }} • {{ formatTime(presence.heureArrivee) }}</span>
                   <span v-if="presence.isGeolocValid" class="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs">
                      <IconMapCheck class="w-3 h-3" /> Géoloc. Valide
                   </span>
                   <span v-else class="text-red-600 dark:text-red-400 flex items-center gap-1 text-xs">
                      <IconMapX class="w-3 h-3" /> Géoloc. Invalide
                   </span>
                </div>
             </div>
             <div class="flex flex-col items-end gap-2">
                <StatusBadge :status="presence.status" type="presence" size="sm" />
                <span v-if="presence.isRetro" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <IconHistory class="w-3 h-3" /> Rétro
                 </span>
             </div>
          </div>
          
          <div v-if="presence.status === 'pending'" class="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
             <button @click="validatePresence(presence.id, true)" class="btn btn-outline border-green-200 hover:bg-green-50 text-green-700 w-full justify-center">
                <IconCheck class="w-4 h-4 mr-2" /> Valider
             </button>
             <button @click="openRejectModal(presence)" class="btn btn-outline border-red-200 hover:bg-red-50 text-red-700 w-full justify-center">
                 <IconX class="w-4 h-4 mr-2" /> Refuser
             </button>
          </div>
          <div v-else class="pt-2 mt-2 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
             Traité
          </div>
        </div>
        <div v-if="filteredPresences.length === 0" class="text-center py-12 text-gray-500">
            <IconClipboardOff class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune présence trouvée</p>
        </div>
      </div>
    </div>

    <!-- CONTENU RÉTRO-ACTIF -->
    <div v-else-if="activeTab === 'retro'">
       <!-- Tableau Desktop -->
       <div class="card overflow-hidden hidden md:block">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-bg-secondary)] border-b">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Incubé</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Date concernée</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Motif</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in filteredRetroRequests" :key="request.id"
                class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td class="px-4 py-3 text-sm font-medium">
                  <NuxtLink :to="`/manage/incubes/${request.incubeId}`" class="hover:text-blue-600 hover:underline">
                    {{ getIncubeName(request.incubeId) }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm">{{ formatDate(request.date) }}</td>
                <td class="px-4 py-3 text-sm max-w-xs truncate" :title="request.motif">{{ request.motif }}</td>
                <td class="px-4 py-3 text-sm">
                  <StatusBadge :status="request.status" type="presence" />
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2" v-if="request.status === 'pending'">
                    <button @click="validateRetroRequest(request.id, true)"
                      class="btn btn-ghost text-green-600 dark:text-green-400 p-1" title="Approuver">
                      <IconCheck class="w-5 h-5" />
                    </button>
                    <button @click="openRejectRetroModal(request)" class="btn btn-ghost text-red-600 dark:text-red-400 p-1"
                      title="Refuser">
                      <IconX class="w-5 h-5" />
                    </button>
                  </div>
                  <span v-else class="text-xs text-[var(--color-text-secondary)]">
                    Traité
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredRetroRequests.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
            <IconClipboardOff class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune demande de rétro-présence</p>
          </div>
        </div>
      </div>

      <!-- Vue Mobile (Cartes) -->
      <div class="md:hidden space-y-4">
        <div v-for="request in filteredRetroRequests" :key="request.id" class="card p-4">
           <div class="flex justify-between items-start mb-2">
              <div>
                 <NuxtLink :to="`/manage/incubes/${request.incubeId}`" class="font-bold text-gray-900 dark:text-white hover:text-primary-600">
                     {{ getIncubeName(request.incubeId) }}
                 </NuxtLink>
                 <p class="text-sm text-gray-500 mt-1">Date : {{ formatDate(request.date) }}</p>
              </div>
              <StatusBadge :status="request.status" type="presence" size="sm" />
           </div>
           
           <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-3 text-sm italic text-gray-600 dark:text-gray-400">
              "{{ request.motif }}"
           </div>

           <div v-if="request.status === 'pending'" class="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
             <button @click="validateRetroRequest(request.id, true)" class="btn btn-outline border-green-200 hover:bg-green-50 text-green-700 w-full justify-center">
                <IconCheck class="w-4 h-4 mr-2" /> Approuver
             </button>
             <button @click="openRejectRetroModal(request)" class="btn btn-outline border-red-200 hover:bg-red-50 text-red-700 w-full justify-center">
                 <IconX class="w-4 h-4 mr-2" /> Refuser
             </button>
           </div>
            <div v-else class="pt-2 mt-2 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
             Traité
          </div>
        </div>
         <div v-if="filteredRetroRequests.length === 0" class="text-center py-12 text-gray-500">
            <IconClipboardOff class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune demande de rétro-présence</p>
        </div>
      </div>
    </div>

    <!-- Modal de rejet -->
    <AppModal
      v-model="showRejectModal"
      :title="isRejectingRetro ? 'Refuser la demande rétroactive' : 'Refuser la présence'"
      :is-form="true"
      :loading="rejectLoading"
      submit-label="Refuser"
      submit-variant="danger"
      :fields="rejectModalFields"
      :form="rejectForm"
      @confirm="confirmRejection"
    >
      <template #icon>
        <IconAlertTriangle class="w-5 h-5 text-red-500" />
      </template>
      <p class="text-sm text-[var(--color-text-secondary)] mb-4">
        Veuillez indiquer le motif du refus pour l'incubé 
        <strong>
          <NuxtLink v-if="selectedItem" :to="`/manage/incubes/${selectedItem.incubeId}`" class="hover:text-blue-600 hover:underline">
            {{ selectedItem ? getIncubeName(selectedItem.incubeId) : '' }}
          </NuxtLink>
        </strong>.
      </p>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { IconFilterOff, IconCheck, IconX, IconMapCheck, IconMapX, IconClipboardOff, IconCalendarCheck, IconHistory, IconAlertTriangle, IconCalendar } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Validation des présences',
  meta: [
    { 
      name: 'description', 
      content: "Gérez les présences de votre équipe." 
    }
  ]
});

const authStore = useAuthStore();
const presenceStore = usePresenceStore();

const activeTab = ref('presences'); // 'presences' | 'retro'

const today = new Date().toISOString().split('T')[0];

const filters = ref({
  startDate: today,
  endDate: today,
  status: '',
});

/* Logique de filtrage */
const filteredPresences = computed(() => {
  let result = [...presenceStore.presences];
  
  // Filtre par plage de dates
  if (filters.value.startDate && filters.value.endDate) {
      result = result.filter(p => p.date >= filters.value.startDate && p.date <= filters.value.endDate);
  } else if (filters.value.startDate) {
      result = result.filter(p => p.date >= filters.value.startDate);
  }
  
  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status);
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
});

const filteredRetroRequests = computed(() => {
    let result = [...presenceStore.retroRequests];
    if (filters.value.status) {
        result = result.filter(r => r.status === filters.value.status);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

/* Actions */
const validatePresence = async (presenceId: string, approved: boolean, reason?: string) => {
  if (!authStore.currentUser) return;
  await presenceStore.validatePresence(presenceId, authStore.currentUser.id, approved, reason);
};

const validateRetroRequest = async (requestId: string, approved: boolean, reason?: string) => {
  if (!authStore.currentUser) return;
  await presenceStore.validateRetroRequest(requestId, authStore.currentUser.id, approved, reason);
};

/* --- Logique de rejet (Modal) --- */
const showRejectModal = ref(false);
const rejectLoading = ref(false);
const selectedItem = ref<any>(null); // Presence or RetroRequest
const isRejectingRetro = ref(false);
const rejectForm = ref({
  reason: ''
});

const rejectModalFields = [
  {
    name: 'reason',
    label: 'Motif du refus',
    type: 'textarea',
    required: true,
    placeholder: 'Ex: Justificatif manquant, hors délai...',
    minlength: 5
  }
];

const openRejectModal = (presence: any) => {
  selectedItem.value = presence;
  isRejectingRetro.value = false;
  rejectForm.value.reason = ''; 
  showRejectModal.value = true;
};

const openRejectRetroModal = (request: any) => {
  selectedItem.value = request;
  isRejectingRetro.value = true;
  rejectForm.value.reason = ''; 
  showRejectModal.value = true;
};

const confirmRejection = async () => {
  if (!selectedItem.value || !authStore.currentUser) return;

  rejectLoading.value = true;
  try {
    const reason = rejectForm.value.reason;
    if (isRejectingRetro.value) {
      await presenceStore.validateRetroRequest(selectedItem.value.id, authStore.currentUser.id, false, reason);
    } else {
      await presenceStore.validatePresence(selectedItem.value.id, authStore.currentUser.id, false, reason);
    }
    showRejectModal.value = false;
  } catch (error) {
    console.error("Error rejecting item:", error);
  } finally {
    rejectLoading.value = false;
    selectedItem.value = null; 
  }
};

/* --- Hooks & Utilitaires --- */
onMounted(async () => {
  await presenceStore.fetchPresences();
  await presenceStore.fetchRetroRequests(); 
});

const resetFilters = () => {
  filters.value = { startDate: today, endDate: today, status: '' };
};

const getIncubeName = (incubeId: string) => {
  // Aide pour extraire l'ID 
  const getId = (obj: any) => {
    if (obj.incube && typeof obj.incube === 'object') return obj.incube.id;
    return obj.incubeId || obj.incube;
  };

  // Contexte : Présences
  const p = presenceStore.presences.find(x => getId(x) === incubeId);
  if (p && p.incube && typeof p.incube === 'object') {
     // @ts-ignore
     return `${p.incube.prenom} ${p.incube.nom}`;
  }

  // Contexte : Demandes rétro-actives
  const r = presenceStore.retroRequests.find(x => getId(x) === incubeId);
  if (r && r.incube && typeof r.incube === 'object') {
     return `${r.incube.prenom} ${r.incube.nom}`;
  }

  return 'Inconnu';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (time: string) => {
  return time ? time.substring(0, 5) : '--:--';
};
</script>
