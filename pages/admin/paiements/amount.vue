<template>
  <div class="space-y-6">
     <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Paiements', to: '/admin/paiements' },
      { label: 'Per diem' }
    ]" class="mb-6" />
    
    <!-- En-tête -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Per diem</h1>
      <p class="text-[var(--color-text-secondary)] mt-2 text-lg">Gestion des montants alloués aux incubés.</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Chargement -->
      <div class="card p-6 h-64 flex flex-col justify-between">
        <div class="flex items-center gap-4">
          <AppSkeleton type="circle" width="48px" height="48px" />
          <div class="space-y-2">
            <AppSkeleton type="text" width="150px" height="24px" />
            <AppSkeleton type="text" width="200px" height="16px" />
          </div>
        </div>
        <div class="space-y-4">
          <AppSkeleton type="rect" height="40px" class="w-full" />
          <AppSkeleton type="rect" height="40px" class="w-full" />
          <AppSkeleton type="rect" height="40px" class="w-full" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Paramètres -->
      <div class="xl:col-span-2 space-y-8">
        <!-- Montant journalier -->
        <section class="card overflow-hidden">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 class="text-xl font-bold flex items-center gap-3">
              <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                <IconCoin class="w-6 h-6" />
              </div>
              Forfait en cours
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)] mt-1 ml-14">
              Configuration des montants alloués aux incubés.
            </p>
          </div>

          <div class="p-6">
            <div class="flex flex-col gap-6 mb-8">
              <!-- Valeur actuelle -->
              <div
                class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div class="relative z-10">
                  <p class="text-blue-100 font-medium mb-1">Montant Journalier Actuel</p>
                  <div class="text-4xl font-bold tracking-tight">
                    {{ formatCurrency(presenceStore.currentDailyAmount) }}
                  </div>
                  <div class="mt-2 flex items-center gap-2 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-lg w-fit">
                    <IconCheck class="w-4 h-4" />
                    Actif pour aujourd'hui
                  </div>
                </div>

                <div
                  class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <IconCurrencyEuro class="w-32 h-32" />
                </div>

                <!-- Bouton Modifier -->
                <button @click="openModal" class="btn bg-white text-blue-600 hover:bg-blue-50 border-none relative z-10 shadow-md w-full md:w-auto">
                  <IconEdit class="w-5 h-5 mr-2" />
                  Définir le montant
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <!-- Info -->
        <div
          class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-4 items-start">
          <IconInfoCircle class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-800 dark:text-blue-300">
            <p class="font-bold mb-1">Information importante</p>
            <p>La modification du montant journalier n'affecte pas les présences déjà validées. Elle s'appliquera
              uniquement aux nouvelles validations ou aux régularisations effectuées à partir de la date d'effet
              choisie.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique des montants -->
    <section class="card overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <h2 class="text-xl font-bold flex items-center gap-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <IconHistory class="w-6 h-6" />
          </div>
          Historique des Per diems
        </h2>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1 ml-14">
          Historique des modifications des per diems.
        </p>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Montant
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date
                d'effet</th>
              <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date de
                création</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="history in paginatedHistory" :key="history.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                {{ formatCurrency(history.amount) }}
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ formatDate(history.effectiveDate) }}
              </td>
              <td class="px-6 py-4 text-gray-500 text-sm">
                {{ formatDate(history.createdAt) }}
              </td>
            </tr>
            <tr v-if="paginatedHistory.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                Aucun historique disponible.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="md:hidden space-y-3 p-4">
         <div v-for="history in paginatedHistory" :key="history.id" class="p-4 bg-[var(--color-bg-primary)] dark:bg-slate-700/30 rounded-lg border border-[var(--color-border-primary)] shadow-sm flex justify-between items-center">
             <div>
                <p class="text-xs text-[var(--color-text-secondary)] mb-1">Effectif le {{ formatDate(history.effectiveDate) }}</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(history.amount) }}</p>
                <p class="text-[10px] text-[var(--color-text-tertiary)] mt-1">Créé le {{ formatDate(history.createdAt) }}</p>
             </div>
             <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <IconCurrencyEuro class="w-5 h-5 text-purple-600 dark:text-purple-400" />
             </div>
         </div>
         <div v-if="paginatedHistory.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
            Aucun historique disponible.
         </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700">
        <p class="text-xs text-[var(--color-text-secondary)]">Page {{ currentPage }} sur {{ totalPages }}</p>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="btn btn-ghost btn-sm px-2">
            <IconChevronLeft class="w-4 h-4" />
          </button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn btn-ghost btn-sm px-2">
            <IconChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>

    <!-- Modale de Définition du Montant -->
    <AppModal v-model="showModal" title="Définir Nouveau Montant" is-form @confirm="updateAmount"
      :loading="submitting" submit-label="Enregistrer" :form="form" :fields="[
        { name: 'amount', label: 'Nouveau montant (FCFA)', type: 'number', required: true, min: 0, step: 100, icon: IconCurrencyEuro },
        { name: 'effectiveDate', label: 'Date d\'effet', type: 'date', required: true, min: new Date().toISOString().split('T')[0], icon: IconCalendar }
      ]" description="La modification du montant journalier s'appliquera uniquement aux nouvelles validations à partir de la date d'effet choisie." />
  </div>
</template>

<script setup lang="ts">
import {
  IconCoin, IconCurrencyEuro, IconLoader, IconCalendar, IconDeviceFloppy,
  IconCheck, IconInfoCircle, IconHistory, IconEdit, IconChevronLeft, IconChevronRight
} from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Per diem',
  meta: [
    { 
      name: 'description', 
      content: "Gestion des per diem. Définissez le montant journalier et consultez l'historique des modifications." 
    }
  ]
});

const presenceStore = usePresenceStore();
const api = useAPI();
const loading = ref(true);
const submitting = ref(false);
const showModal = ref(false);

const form = ref({
  amount: 4500,
  effectiveDate: new Date().toISOString().split('T')[0]
});

const openModal = () => {
  form.value.amount = presenceStore.currentDailyAmount;
  form.value.effectiveDate = new Date().toISOString().split('T')[0];
  showModal.value = true;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = 5;

const sortedHistory = computed(() => {
  return [...presenceStore.dailyAmountHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const totalPages = computed(() => Math.ceil(sortedHistory.value.length / itemsPerPage));

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedHistory.value.slice(start, end);
});

onMounted(async () => {
  try {
    await Promise.all([
      presenceStore.fetchCurrentDailyAmount(),
      presenceStore.fetchDailyAmountHistory()
    ]);
    form.value.amount = presenceStore.currentDailyAmount;
  } finally {
    setTimeout(() => {
      loading.value = false;
    });
  }
});

const updateAmount = async () => {
  submitting.value = true;
  try {
    await (api as any)('/admin/set-daily-amount', {
      method: 'POST',
      body: {
        amount: form.value.amount,
        effectiveDate: form.value.effectiveDate
      }
    });
    useToast().success('Montant mis à jour avec succès.');
    // Actualiser le montant et l'historique
    await Promise.all([
      presenceStore.fetchCurrentDailyAmount(),
      presenceStore.fetchDailyAmountHistory()
    ]);
    showModal.value = false;
  } catch (e: any) {
    useToast().error(e.data?.message || 'Erreur lors de la mise à jour.');
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    dateStyle: 'long'
  });
};
</script>
