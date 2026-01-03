<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Avertissements' }]" class="mb-6" />
    
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Avertissements</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Gérer les avertissements</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulaire -->
      <div v-if="isFormateur" class="card">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <IconAlertTriangle class="w-5 h-5 text-yellow-500" />
          Nouvel avertissement
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Incubé concerné</label>
            <select v-model="form.incubeId" required class="input">
              <option value="">Sélectionner un incubé</option>
              <option v-for="incube in incubesList" :key="incube.id" :value="incube.id">
                {{ incube.prenom }} {{ incube.nom }}
              </option>
            </select>
          </div>

          <div>
            <label class="label">Motif</label>
            <select v-model="form.motif" required class="input">
              <option value="">Sélectionner un motif</option>
              <option value="absences">Absences répétées</option>
              <option value="retards">Retards fréquents</option>
              <option value="comportement">Comportement inapproprié</option>
              <option value="travail">Non rendu de travail</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label class="label">Description détaillée</label>
            <textarea v-model="form.description" required rows="4" class="input"
              placeholder="Expliquez la raison de l'avertissement..."></textarea>
          </div>

          <div v-if="successMessage"
            class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
            {{ successMessage }}
          </div>

          <button type="submit" :disabled="loading" class="w-full btn btn-primary">
            <IconSend class="w-5 h-5" />
            Envoyer l'avertissement
          </button>
        </form>
      </div>

      <!-- Panneau d'information pour Admin -->
      <div v-else class="card bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <IconInfoCircle class="w-5 h-5" />
          Note
        </h2>
        <div class="prose dark:prose-invert text-sm text-[var(--color-text-secondary)]">
          <p>
            En tant qu'administrateur, vous avez accès à l'historique complet des avertissements émis par les formateurs.
          </p>
          <p class="mt-2">
            Cette interface permet de :
          </p>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li>Surveiller les problèmes disciplinaires</li>
            <li>Suivre les motifs récurrents (Absences, Retards...)</li>
            <li>Intervenir si nécessaire auprès des incubés</li>
          </ul>
          <p class="mt-4 text-xs opacity-75">
            Note : Seuls les formateurs peuvent créer de nouveaux avertissements.
          </p>
        </div>
      </div>

      <!-- Historique -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Historique récent</h2>
        <!-- Filtres -->
        <div class="mb-4 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Recherche Nom -->
            <div class="relative">
              <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="filters.search" type="text" placeholder="Rechercher un incubé..." class="input pl-9 w-full" />
            </div>

            <!-- Filtre Motif -->
            <select v-model="filters.motif" class="input w-full">
               <option value="">Tous les motifs</option>
               <option value="absences">Absences répétées</option>
               <option value="retards">Retards fréquents</option>
               <option value="comportement">Comportement inapproprié</option>
               <option value="travail">Non rendu de travail</option>
               <option value="autre">Autre</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
             <!-- Date Début -->
             <div>
                <input v-model="filters.startDate" type="date" class="input w-full text-xs" />
             </div>
             <!-- Date Fin -->
             <div>
                <input v-model="filters.endDate" type="date" class="input w-full text-xs" />
             </div>
          </div>
          
          <button v-if="hasActiveFilters" @click="resetFilters" class="btn btn-ghost btn-xs w-full text-gray-500">
             <IconFilterOff class="w-3 h-3 mr-1" /> Effacer les filtres
          </button>
        </div>

        <div v-if="formateurStore.loading" class="py-12 flex justify-center">
           <IconLoader class="w-8 h-8 animate-spin text-primary-600" />
        </div>

        <div v-else-if="paginatedWarnings.length > 0" class="space-y-4">
          <div v-for="warning in paginatedWarnings" :key="warning.id"
            class="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                 <NuxtLink :to="`/manage/incubes/${getIncubeId(warning.incube)}`" class="font-medium hover:text-blue-600 hover:underline">
                   {{ getIncubeName(warning.incube) }}
                 </NuxtLink>
                 <StatusBadge :status="warning.motif" type="warning" :show-icon="false" class="text-xs border-0" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-[var(--color-text-secondary)]">{{ formatDate(warning.date) }}</span>
                <NuxtLink :to="`/manage/warnings/${warning.id}`" 
                  class="btn btn-ghost p-1 h-6 w-6 min-h-0 text-blue-600 dark:text-blue-400"
                  title="Voir détails">
                  <IconEye class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
            
            <p class="text-sm text-[var(--color-text-secondary)]">{{ warning.description }}</p>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-ghost btn-sm btn-square" title="Précédent">
                <IconChevronLeft class="w-4 h-4" />
             </button>
             <span class="text-xs font-medium text-gray-500">{{ currentPage }} / {{ totalPages }}</span>
             <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-ghost btn-sm btn-square" title="Suivant">
                <IconChevronRight class="w-4 h-4" />
             </button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-[var(--color-text-secondary)]">
          <p v-if="hasActiveFilters">Aucun résultat trouvé pour ces filtres</p>
          <p v-else>Aucun avertissement envoyé</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useFormateurStore } from '~/stores/formateur';
import { IconAlertTriangle, IconSend, IconEye, IconLoader, IconSearch, IconFilterOff, IconChevronLeft, IconChevronRight, IconInfoCircle } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Avertissements',
  meta: [
    { 
      name: 'description', 
      content: "Envoyer et gérer les avertissements aux incubés." 
    }
  ]
});

const authStore = useAuthStore();
const formateurStore = useFormateurStore();
import { ROLE_GROUPS } from '~/utils/roles';

const isFormateur = computed(() => authStore.hasRole(ROLE_GROUPS.GForms_Role));

const form = ref({
  incubeId: '',
  motif: '',
  description: '',
});

const loading = ref(false);
const successMessage = ref('');

const handleSubmit = async () => {
  if (!authStore.currentUser) return;

  loading.value = true;
  successMessage.value = '';

  try {
    const result = await formateurStore.createWarning({
      incubeId: form.value.incubeId,
      formateurId: authStore.currentUser.id,
      motif: form.value.motif,
      description: form.value.description,
      date: new Date().toISOString(),
    });

    if (result.success) {
      successMessage.value = 'Avertissement envoyé avec succès';
      form.value = { incubeId: '', motif: '', description: '' };
    }
  } finally {
    loading.value = false;
  }
};

const managerStore = useManagerStore();

const filters = ref({
   search: '',
   startDate: '',
   endDate: '',
   motif: ''
});

const currentPage = ref(1);
const itemsPerPage = 5;

const hasActiveFilters = computed(() => {
   return !!filters.value.search || !!filters.value.startDate || !!filters.value.endDate || !!filters.value.motif;
});

const resetFilters = () => {
   filters.value = {
      search: '',
      startDate: '',
      endDate: '',
      motif: ''
   };
   currentPage.value = 1;
};

const filteredWarnings = computed(() => {
   let res = [...formateurStore.warnings];
   
   if (filters.value.search) {
      const q = filters.value.search.toLowerCase();
      res = res.filter(w => {
         const incubeName = getIncubeName(w.incube).toLowerCase();
         return incubeName.includes(q);
      });
   }
   
   if (filters.value.motif) {
      res = res.filter(w => w.motif === filters.value.motif);
   }

   if (filters.value.startDate) {
      res = res.filter(w => w.date >= filters.value.startDate);
   }
   
   if (filters.value.endDate) {
      // Ajouter l'heure maximale à la date de fin pour inclure la journée entière
      const endDate = new Date(filters.value.endDate);
      endDate.setHours(23, 59, 59, 999);
      res = res.filter(w => new Date(w.date) <= endDate);
   }
   
   // Trier par date décroissante
   res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
   
   return res;
});

const totalPages = computed(() => Math.ceil(filteredWarnings.value.length / itemsPerPage));

const paginatedWarnings = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage;
   return filteredWarnings.value.slice(start, start + itemsPerPage);
});

const nextPage = () => {
   if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
   if (currentPage.value > 1) currentPage.value--;
};

// Réinitialiser la page lors du changement des filtres
watch(filters, () => {
   currentPage.value = 1;
}, { deep: true });


const getIncubeId = (incubeOrId: any) => {
  if (!incubeOrId) return '';
  if (typeof incubeOrId === 'object') {
    return incubeOrId.id;
  }
  return incubeOrId;
};

const getIncubeName = (incubeOrId: any) => {
  if (!incubeOrId) return 'Inconnu';
  
  // Si c'est un objet peuplé
  if (typeof incubeOrId === 'object') {
    return `${incubeOrId.prenom || ''} ${incubeOrId.nom || ''}`.trim();
  }
  
  // Si c'est un ID
  if (incubesList.value.length > 0) {
    const found = incubesList.value.find(u => u.id === incubeOrId);
    if (found) return `${found.prenom} ${found.nom}`;
  }

  return 'Inconnu';
};

const entitiesStore = useEntitiesStore();

const incubesList = ref<any[]>([]);

onMounted(async () => {
  await Promise.all([
    entitiesStore.loadEntities(),
    managerStore.loadIncubes({ status: 'active' }).then(res => {
      incubesList.value = res;
    }),
    formateurStore.fetchWarnings()
  ]);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};
</script>
