<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Paiements' }]" class="mb-6" />

    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Paiements</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Validation et suivi des paiements</p>
      </div>
      <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
         <NuxtLink v-if="isSuperAdmin" to="/admin/paiements/amount" class="btn btn-outline border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 w-full md:w-auto justify-center">
           <IconCurrencyEuro class="w-5 h-5 mr-2" />
           Per diem
         </NuxtLink>
         <button @click="exportToCSV" class="btn btn-primary w-full md:w-auto justify-center">
           <IconDownload class="w-5 h-5 mr-2" />
           Exporter en CSV
         </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="md:col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label class="label">Du</label>
            <input type="date" v-model="filters.startDate" class="input" />
          </div>
          <div>
            <label class="label">Au</label>
            <input type="date" v-model="filters.endDate" class="input" />
          </div>
        </div>

        <div>
          <label class="label">Équipe</label>
          <select v-model="filters.equipeId" class="input">
            <option value="">Toutes les équipes</option>
            <option v-for="equipe in entitiesStore.equipes" :key="equipe.id" :value="equipe.id">
              {{ equipe.nom }}
            </option>
          </select>
        </div>

        <div>
          <label class="label">Banque</label>
          <select v-model="filters.banqueId" class="input">
            <option value="">Toutes les banques</option>
            <option v-for="banque in entitiesStore.banques" :key="banque.id" :value="banque.id">
              {{ banque.nom }}
            </option>
          </select>
        </div>

        <div class="flex items-end">
          <button @click="resetFilters" class="btn btn-outline w-full">
            <IconFilterOff class="w-5 h-5 mr-2" />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Résumé des statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-800 dark:text-blue-300">Total Incubés Filtrés</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ filteredPayments.length }}</p>
      </div>
      <div class="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <p class="text-sm text-green-800 dark:text-green-300">Montant total période</p>
        <p class="text-xl font-bold text-green-900 dark:text-green-200 mt-1">{{ formatCurrency(totalAmount) }}</p>
      </div>
      <div class="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
        <p class="text-sm text-purple-800 dark:text-purple-300">Montant total (global)</p>
        <p class="text-xl font-bold text-purple-900 dark:text-purple-200 mt-1">{{ formatCurrency(globalTotalAmount) }}
        </p>
      </div>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--color-bg-secondary)] border-b">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium">Incubé</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Équipe</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Banque / RIB</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-center">Présences</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Montant Total</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Payé</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Reste à payer</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
              <th class="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in paginatedPayments" :key="payment.incubeId"
              class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
              <td class="px-4 py-3 text-sm font-medium">
                <NuxtLink :to="`/manage/incubes/${payment.incubeId}`" class="hover:text-blue-600 hover:underline">
                  {{ payment.nom }}
                </NuxtLink>
              </td>
              <td class="px-4 py-3 text-sm">{{ payment.equipe }}</td>
              <td class="px-4 py-3 text-sm">
                <div v-if="payment.banque && payment.rib">
                  <p class="font-medium">{{ payment.banque }}</p>
                  <p class="text-xs font-mono text-[var(--color-text-secondary)]">{{ payment.rib }}</p>
                </div>
                <span v-else class="text-xs text-red-500 italic">Non renseigné</span>
              </td>
              <td class="px-4 py-3 text-sm text-center">{{ payment.presences }}</td>
              <td class="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(payment.total) }}</td>
              <td class="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">{{ formatCurrency(payment.paid) }}</td>
              <td class="px-4 py-3 text-sm font-bold text-amber-600 dark:text-amber-400">{{ formatCurrency(payment.unpaid) }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  payment.status === 'Payé'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                ]">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-right">
                <div class="flex justify-end gap-2">
                  <button v-if="payment.canValidate" @click="validatePayment(payment)" class="btn btn-sm btn-primary"
                    :title="payment.unpaid === 0 ? 'Aucun montant à payer' : 'Valider le paiement'"
                    :disabled="payment.unpaid === 0">
                    <IconCheck class="w-4 h-4 mr-1" />
                    Valider
                  </button>
                  <button v-else @click="notifyIncube(payment)"
                    class="btn btn-sm btn-outline border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    title="Notifier l'incubé">
                    <IconBell class="w-4 h-4 mr-1" />
                    Notifier
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="9" class="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                Aucun paiement trouvé pour cette période.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="md:hidden space-y-3 p-4">
         <div v-for="payment in paginatedPayments" :key="payment.incubeId" class="flex flex-col p-4 bg-[var(--color-bg-primary)] dark:bg-slate-700/30 rounded-lg border border-[var(--color-border-primary)] shadow-sm">
            <div class="flex justify-between items-start mb-2">
               <div class="flex flex-col">
                  <NuxtLink :to="`/manage/incubes/${payment.incubeId}`" class="font-medium hover:text-blue-600">
                    {{ payment.nom }}
                  </NuxtLink>
                  <span class="text-xs text-[var(--color-text-secondary)]">{{ payment.equipe }}</span>
               </div>
               <span :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-medium',
                  payment.status === 'Payé'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                ]">
                  {{ payment.status }}
                </span>
            </div>
            
            <div class="text-sm text-[var(--color-text-secondary)] mb-3 space-y-1">
               <div class="flex justify-between">
                  <span>Infos bancaires:</span>
                  <span v-if="payment.banque && payment.rib" class="font-mono text-xs">{{ payment.rib.substring(0, 10) }}...</span>
                  <span v-else class="text-red-500 italic text-xs">Manquant</span>
               </div>
               <div class="flex justify-between">
                  <span>Présences:</span>
                  <span>{{ payment.presences }}</span>
               </div>
            </div>

            <div class="flex justify-between items-center text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border-secondary)] pt-2 mt-1">
               <div class="flex flex-col">
                  <span class="text-xs">Reste à payer</span>
                  <span class="font-bold text-amber-600 dark:text-amber-400">{{ formatCurrency(payment.unpaid) }}</span>
               </div>
               <div>
                  <button v-if="payment.canValidate" @click="validatePayment(payment)" class="btn btn-sm btn-primary"
                    :title="payment.unpaid === 0 ? 'Aucun montant à payer' : 'Valider le paiement'"
                    :disabled="payment.unpaid === 0">
                    <IconCheck class="w-4 h-4 mr-1" />
                    Valider
                  </button>
                  <button v-else @click="notifyIncube(payment)"
                    class="btn btn-sm btn-outline border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    title="Notifier l'incubé">
                    <IconBell class="w-4 h-4 mr-1" />
                    Notifier
                  </button>
               </div>
            </div>
         </div>
         
         <div v-if="filteredPayments.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
            Aucun paiement trouvé pour cette période.
         </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between p-4 border-t">
        <p class="text-sm text-[var(--color-text-secondary)]">Page {{ currentPage }} sur {{ totalPages }}</p>
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
import { IconDownload, IconFilterOff, IconChevronLeft, IconChevronRight, IconCheck, IconBell, IconCurrencyEuro } from '@tabler/icons-vue';
import { useAuthStore } from '~/stores/auth';

// Définition des métadonnées de la page
definePageMeta({
  middleware: ['auth', 'role'],
});

// Configuration du titre et de la description pour le SEO
useHead({
  title: 'Paiements',
  meta: [
    { 
      name: 'description', 
      content: "Gestion des paiements des incubés. Validation des montants, suivi des états de paiement et export des données." 
    }
  ]
});

const adminStore = useAdminStore();
const presenceStore = usePresenceStore();
const entitiesStore = useEntitiesStore();
const authStore = useAuthStore();
const isSuperAdmin = computed(() => authStore.currentUser?.role === 'super_admin');

// Dates par défaut : Mois en cours
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
// Dernier jour du mois en cours (gère 28, 29, 30, 31)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

const filters = ref({
  startDate: firstDay,
  endDate: lastDay,
  equipeId: '',
  banqueId: '',
});

// Gestion de la pagination
const currentPage = ref(1);
const itemsPerPage = 15;

onMounted(async () => {
  await adminStore.loadUsers();
  await entitiesStore.loadEntities();
  await presenceStore.fetchPresences();
});

// Liste complète des paiements pour chaque incubé
const allPayments = computed(() => {
  return adminStore.getIncubes.map((incube: any) => {
    const userPresences = presenceStore.presences.filter(p => {
      const isUser = p.incubeId === incube.id;
      const isValidated = p.status === 'validated';
      const inDateRange = p.date >= filters.value.startDate && p.date <= filters.value.endDate;
      return isUser && isValidated && inDateRange;
    });

    const total = userPresences.reduce((sum, p) => sum + p.amount, 0);
    const paid = userPresences.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const unpaid = total - paid;
    const status = unpaid > 0 ? 'Non payé' : 'Payé';

    const equipeObj = (incube.equipe && typeof incube.equipe === 'object') 
      ? incube.equipe 
      : entitiesStore.getEquipeById(incube.equipeId || '');
      
    const banqueObj = (incube.banque && typeof incube.banque === 'object') 
      ? incube.banque 
      : entitiesStore.getBanqueById(incube.banqueId || '');
      
    const rib = incube.rib || (incube.banque && typeof incube.banque === 'object' ? incube.banque.rib : null) || incube.rib; 

    const hasBankInfo = !!(banqueObj || incube.banqueId) && !!rib;

    return {
      incubeId: incube.id,
      nom: `${incube.prenom} ${incube.nom}`,
      equipe: equipeObj?.nom || 'N/A',
      equipeId: equipeObj?.id || incube.equipeId,
      banque: banqueObj?.nom || 'N/A',
      banqueId: banqueObj?.id || incube.banqueId,
      rib: rib,
      presences: userPresences.length,
      total,
      paid,
      unpaid,
      status,
      canValidate: hasBankInfo
    };
  });
});

// Filtrage des paiements selon les critères sélectionnés
const filteredPayments = computed(() => {
  let result = allPayments.value;

  if (filters.value.equipeId) {
    result = result.filter(p => p.equipeId === filters.value.equipeId);
  }

  if (filters.value.banqueId) {
    result = result.filter(p => p.banqueId === filters.value.banqueId);
  }

  return result;
});

// Présences validées, ignorant la plage de dates
const globalTotalAmount = computed(() => {
  let validPresences = presenceStore.presences.filter(p => p.status === 'validated');

  if (filters.value.equipeId) {
    const teamIncubeIds = adminStore.getIncubes
      .filter(u => u.equipeId === filters.value.equipeId)
      .map(u => u.id);

    validPresences = validPresences.filter(p => teamIncubeIds.includes(p.incubeId));
  }

  return validPresences.reduce((sum, p) => sum + p.amount, 0);
});

const totalAmount = computed(() => filteredPayments.value.reduce((sum, p) => sum + p.total, 0));
const unpaidAmount = computed(() => filteredPayments.value.reduce((sum, p) => sum + p.unpaid, 0));

const totalPages = computed(() => Math.ceil(filteredPayments.value.length / itemsPerPage));

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPayments.value.slice(start, start + itemsPerPage);
});

const resetFilters = () => {
  filters.value.equipeId = '';
  filters.value.banqueId = '';
  filters.value.startDate = firstDay;
  filters.value.endDate = lastDay;
  currentPage.value = 1;
};

// Valide le paiement pour un incubé donné
const validatePayment = async (payment: any) => {
  if (await useConfirm().confirm({
    message: `Valider le paiement de ${formatCurrency(payment.unpaid)} pour ${payment.nom} ?`,
    title: 'Confirmation de validation',
    type: 'primary'
  })) {
    // Récupérer toutes les présences
    const unpaidPresences = presenceStore.presences.filter(p => {
      const isUser = p.incubeId === payment.incubeId;
      const isValidated = p.status === 'validated';
      const isUnpaid = p.paymentStatus !== 'paid';
      const inDateRange = p.date >= filters.value.startDate && p.date <= filters.value.endDate;
      return isUser && isValidated && isUnpaid && inDateRange;
    });

    if (unpaidPresences.length === 0) {
      useToast().warning('Aucune présence à valider pour ce paiement');
      return;
    }

    // Marquer toutes les présences non payées comme payées
    let successCount = 0;
    let errorCount = 0;

    for (const presence of unpaidPresences) {
      const result = await presenceStore.markAsPaid(presence.id);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (errorCount === 0) {
      useToast().success(`Paiement validé avec succès (${successCount} présence(s))`);
    } else {
      useToast().warning(`Paiement partiellement validé : ${successCount} succès, ${errorCount} erreur(s)`);
    }
  }
};

// Envoie une notification à l'incubé pour demander les informations bancaires manquantes.
const notifyIncube = async (payment: any) => {
  if (await useConfirm().confirm({
    message: `Envoyer un rappel urgent à ${payment.nom} pour renseigner ses informations bancaires ?`,
    title: 'Notifier l\'incubé',
    type: 'warning'
  })) {
    const res = await adminStore.notifyPaymentInfo(payment.incubeId);
    if (res.success) {
      useToast().success(res.message);
    } else {
      useToast().error(res.message);
    }
  }
};

// Exportation des données filtrées au format CSV
const exportToCSV = () => {
  const headers = ['Incubé', 'Équipe', 'Statut', 'Présences', 'Montant Total', 'Reste à Payer'];
  const rows = filteredPayments.value.map(p => [
    p.nom,
    p.equipe,
    p.status,
    p.presences,
    p.total,
    p.unpaid,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `paiements_${filters.value.startDate}_${filters.value.endDate}.csv`;
  link.click();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};
</script>
