<template>
  <div>
     <AppBreadcrumb :items="[{ label: 'Présences' }]" class="mb-6" />
     
    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Gestion des présences</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Vue globale de toutes les présences</p>
      </div>
      <button @click="exportToCSV" class="btn btn-primary">
        <IconDownload class="w-5 h-5 mr-2" />
        Exporter en CSV
      </button>
    </div>

    <!-- Filtres -->
    <div class="card mb-6 p-4">
      <div class="flex flex-col gap-4">
        <!--Période et actions globales -->
        <div class="flex flex-col xl:flex-row gap-4 items-end justify-between">
            <div class="flex flex-col md:flex-row gap-4 items-end flex-grow w-full">
                <div class="w-full md:w-auto">
                    <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Du</label>
                    <div class="relative">
                        <input type="date" v-model="filters.startDate" class="input pl-10 w-full" />
                        <IconCalendar class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div class="w-full md:w-auto">
                    <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Au</label>
                    <div class="relative">
                        <input type="date" v-model="filters.endDate" class="input pl-10 w-full" />
                         <IconCalendar class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                 <button @click="setToday" class="btn btn-ghost border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 h-[42px] w-full md:w-auto" title="Aujourd'hui">
                    <IconCalendarEvent class="w-5 h-5 text-gray-600 dark:text-gray-300 mx-auto" />
                </button>
            </div>

             <div class="flex items-end w-full xl:w-auto">
                <button @click="resetFilters" class="btn btn-outline border-gray-200 hover:bg-gray-50 text-gray-600 dark:text-gray-400 flex gap-2 items-center w-full justify-center">
                    <IconFilterOff class="w-4 h-4" />
                    <span>Réinitialiser</span>
                </button>
            </div>
        </div>

        <hr class="border-gray-100 dark:border-gray-700">

        <!-- Filtres contextuels -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                 <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Équipe</label>
                 <select v-model="filters.equipeId" class="input">
                    <option value="">Toutes les équipes</option>
                    <option v-for="equipe in entitiesStore.equipes" :key="equipe.id" :value="equipe.id">
                    {{ equipe.nom }}
                    </option>
                </select>
            </div>
             <div>
                <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Statut</label>
                <select v-model="filters.status" class="input">
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="validated">Validée</option>
                    <option value="rejected">Refusée</option>
                </select>
            </div>
        </div>
      </div>
    </div>

    <!-- Résumé -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-800 dark:text-blue-300">Présents</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ filteredPresences.length }}</p>
      </div>

      <div class="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <p class="text-sm text-green-800 dark:text-green-300">Validées</p>
        <p class="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{{ validatedCount }}</p>
      </div>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <div>
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-bg-secondary)] border-b">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium">Incubé</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Équipe</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Arrivée</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="presence in paginatedPresences" :key="presence.id"
                class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td class="px-4 py-3 text-sm font-medium">
                  <NuxtLink :to="`/manage/incubes/${presence.incubeId}`" class="hover:text-blue-600 hover:underline">
                    {{ getIncubeName(presence.incubeId) }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-sm">{{ getIncubeEquipe(presence.incubeId) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatDate(presence.date) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatTime(presence.heureArrivee) }}</td>
                <td class="px-4 py-3 text-sm">
                  <StatusBadge :status="presence.status" type="presence" />
                  <span v-if="presence.isRetro" class="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <IconHistory class="w-3 h-3" /> Rétro
                  </span>
                </td>
                <td class="px-4 py-3 text-sm font-medium">
                  <div class="flex items-center gap-2">
                      {{ formatCurrency(presence.amount) }}
                      <button v-if="presence.status === 'validated' && presence.paymentStatus !== 'paid'" 
                              @click="markPaid(presence.id)"
                              class="btn btn-xs btn-outline-primary" title="Marquer comme payé">
                          <IconCoin class="w-3 h-3" />
                      </button>
                      <IconCheck v-if="presence.paymentStatus === 'paid'" class="w-3 h-3 text-green-500" title="Payé" />
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPresences.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  Aucune présence trouvée pour cette période.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile List -->
        <div class="md:hidden space-y-3 p-4">
           <div v-for="presence in paginatedPresences" :key="presence.id" class="flex flex-col p-4 bg-[var(--color-bg-primary)] dark:bg-slate-700/30 rounded-lg border border-[var(--color-border-primary)] shadow-sm">
              <div class="flex justify-between items-start mb-2">
                 <div class="flex flex-col">
                    <NuxtLink :to="`/manage/incubes/${presence.incubeId}`" class="font-medium hover:text-blue-600">
                      {{ getIncubeName(presence.incubeId) }}
                    </NuxtLink>
                    <span class="text-xs text-[var(--color-text-secondary)]">{{ getIncubeEquipe(presence.incubeId) }}</span>
                 </div>
                 <div class="flex flex-col items-end gap-1">
                    <StatusBadge :status="presence.status" type="presence" size="sm" />
                    <span v-if="presence.isRetro" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      <IconHistory class="w-3 h-3" />
                    </span>
                 </div>
              </div>
              <div class="flex justify-between items-center text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border-secondary)] pt-2 mt-1">
                 <div class="flex gap-3">
                    <span class="flex items-center gap-1"><IconCalendarEvent class="w-3 h-3" /> {{ formatDate(presence.date) }}</span>
                    <span class="flex items-center gap-1"><IconClock class="w-3 h-3" /> {{ formatTime(presence.heureArrivee) }}</span>
                 </div>
                 <div class="flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
                     {{ formatCurrency(presence.amount) }}
                     <button v-if="presence.status === 'validated' && presence.paymentStatus !== 'paid'" 
                              @click="markPaid(presence.id)"
                              class="btn btn-xs btn-outline-primary p-0.5 h-6 w-6 min-h-0" title="Marquer comme payé">
                          <IconCoin class="w-3 h-3" />
                      </button>
                      <IconCheck v-if="presence.paymentStatus === 'paid'" class="w-3 h-3 text-green-500" title="Payé" />
                 </div>
              </div>
           </div>
           
           <div v-if="filteredPresences.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
              Aucune présence trouvée pour cette période.
           </div>
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
  </div>
</template>

<script setup lang="ts">
import { IconFilterOff, IconCheck, IconChevronLeft, IconChevronRight, IconDownload, IconCalendar, IconCoin, IconCalendarEvent, IconHistory } from '@tabler/icons-vue';

// Middleware d'authentification et de rôle
definePageMeta({
  middleware: ['auth', 'role'],
});

// SEO
useHead({
  title: 'Gestion des présences',
  meta: [
    { 
      name: 'description', 
      content: "Suivi des présences journalières des incubés. Historique complet, filtrage par équipe et statistiques." 
    }
  ]
});

const presenceStore = usePresenceStore();
const entitiesStore = useEntitiesStore();
const teamStore = useTeamStore();

const adminStore = useAdminStore();

// Chargement initial
onMounted(async () => {
  await Promise.all([
    adminStore.loadUsers(),
    entitiesStore.loadEntities(),
    presenceStore.fetchPresences(),
    teamStore.fetchTeams()
  ]);
});

const today = new Date().toISOString().split('T')[0];

const filters = ref({
  startDate: today,
  endDate: today,
  equipeId: '',
  status: '',
});

const currentPage = ref(1);
const itemsPerPage = 15;

// Filtrage
const filteredPresences = computed(() => {
  let result = [...presenceStore.presences];
  result = result.filter(p => p.date >= filters.value.startDate && p.date <= filters.value.endDate);

  if (filters.value.equipeId) {
    result = result.filter(p => {
      const user = adminStore.getUserById(p.incubeId);
      return user?.equipeId === filters.value.equipeId;
    });
  }

  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status);
  }

  return result.sort((a, b) => b.date.localeCompare(a.date));
});

const validatedCount = computed(() => {
  return filteredPresences.value.filter(p => p.status === 'validated').length;
});

const totalAmount = computed(() => {
  return filteredPresences.value
    .filter(p => p.status === 'validated')
    .reduce((sum, p) => sum + p.amount, 0);
});

const totalPages = computed(() => {
  return Math.ceil(filteredPresences.value.length / itemsPerPage);
});

// Pagination
const paginatedPresences = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPresences.value.slice(start, end);
});

// Réinitialisation des filtres
const resetFilters = () => {
  filters.value = {
    startDate: today,
    endDate: today,
    equipeId: '',
    status: '',
  };
  currentPage.value = 1;
};

const setToday = () => {
  filters.value.startDate = today;
  filters.value.endDate = today;
  currentPage.value = 1;
};

// Marque une présence comme payée après confirmation
const markPaid = async (presenceId: string) => {
  if (await useConfirm().confirm({
    message: 'Marquer cette présence comme payée ?',
    title: 'Confirmation de paiement',
    type: 'primary'
  })) {
    const result = await presenceStore.markAsPaid(presenceId);
    if (result.success) {
      useToast().success('Présence marquée comme payée');
    } else {
      useToast().error(result.message || 'Erreur lors du marquage');
    }
  }
}

// Récupérer les données des incubés
const getIncubeName = (incubeIdOrObj: any) => {
  if (!incubeIdOrObj) return 'Inconnu';
  if (typeof incubeIdOrObj === 'object') {
    return `${incubeIdOrObj.prenom || ''} ${incubeIdOrObj.nom || ''}`.trim();
  }
  
  // Chercher dans le store de présences
  const presence = presenceStore.presences.find(p => p.incubeId === incubeIdOrObj);
  if (presence?.incube && typeof presence.incube === 'object') {
    return `${presence.incube.prenom || ''} ${presence.incube.nom || ''}`.trim();
  }
  
  // Repli sur adminStore
  const user = adminStore.getUserById(incubeIdOrObj);
  if (user) {
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  }
  
  return 'Inconnu';
};

const getIncubeEquipe = (incubeIdOrObj: any) => {
  if (!incubeIdOrObj) return '-';
  
  // Chercher la présence pour obtenir l'incubé
  const presence = presenceStore.presences.find(p => p.incubeId === incubeIdOrObj);
  if (presence?.incube && typeof presence.incube === 'object') {
    const incube = presence.incube;
    // Si l'équipe est populée
    if (incube.equipe && typeof incube.equipe === 'object') {
      return incube.equipe.nom;
    }
    // Si c'est un ID d'équipe
    const equipeId = incube.equipeId || incube.equipe;
    if (equipeId) {
      const team = teamStore.teams.find(t => t.id === equipeId);
      return team ? team.nom : 'Inconnu';
    }
  }
  return '-';
};

// Exportation des données filtrées au format CSV
const exportToCSV = () => {
  const headers = ['Incubé', 'Équipe', 'Date', 'Arrivée', 'Statut', 'Montant'];
  const rows = filteredPresences.value.map(p => [
    getIncubeName(p.incubeId),
    getIncubeEquipe(p.incubeId),
    formatDate(p.date),
    formatTime(p.heureArrivee),
    p.status,
    p.amount,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `presences_${filters.value.startDate}_${filters.value.endDate}.csv`;
  link.click();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (time: string) => {
  return time.substring(0, 5);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Réinitialiser la pagination lors du changement de filtres
watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });
</script>
