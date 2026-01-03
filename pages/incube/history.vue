<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Historique des présences' }]" class="mb-6" />

    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Historique des présences</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Consultez vos présences enregistrées</p>
    </div>

    <!-- Filtres -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Mois</label>
          <select v-model="selectedMonth" class="input">
            <option value="">Tous les mois</option>
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="label">Statut</label>
          <select v-model="selectedStatus" class="input">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value=" validated">Validée</option>
            <option value="rejected">Refusée</option>
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

    <!-- Cartes résumé -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div
        class="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-800 dark:text-green-300">Validées</p>
            <p class="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">{{ validatedCount }}</p>
          </div>
          <IconCheck class="w-10 h-10 text-green-500" />
        </div>
      </div>

      <div
        class="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-300">En attente</p>
            <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mt-1">{{ pendingCount }}</p>
          </div>
          <IconClock class="w-10 h-10 text-yellow-500" />
        </div>
      </div>

      <div
        class="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-800 dark:text-blue-300">Total</p>
            <p class="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ filteredPresences.length }}</p>
          </div>
          <IconClipboardList class="w-10 h-10 text-blue-500" />
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <!-- Vue Desktop (Tableau) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--color-bg-secondary)] border-b">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Arrivée</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Départ</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Montant</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Paiement</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="presence in paginatedPresences" :key="presence.id"
              class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
              <td class="px-4 py-3 text-sm">{{ formatDate(presence.date) }}</td>
              <td class="px-4 py-3 text-sm">{{ formatTime(presence.heureArrivee) }}</td>
              <td class="px-4 py-3 text-sm">{{ presence.heureDepart ? formatTime(presence.heureDepart) : '-' }}</td>
              <td class="px-4 py-3 text-sm">
                <StatusBadge :status="presence.status" type="presence" />
                <span v-if="presence.isRetro"
                  class="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <IconHistory class="w-3 h-3" /> Rétro
                </span>
              </td>
              <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(presence.amount) }}</td>
              <td class="px-4 py-3 text-sm">
                <StatusBadge :status="presence.paymentStatus" type="payment" />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredPresences.length === 0" class="text-center py-12 text-[var(--color-text-secondary)]">
          <IconClipboardOff class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune présence trouvée</p>
        </div>
      </div>

      <!-- Vue Mobile (Cartes) -->
      <div class="md:hidden space-y-4 p-4">
        <div v-for="presence in paginatedPresences" :key="presence.id"
          class="p-4 rounded-lg border bg-[var(--color-bg-primary)] dark:border-gray-700 shadow-sm">
          <div class="flex justify-between items-start mb-3">
            <div class="font-medium text-[var(--color-text-primary)]">
              {{ formatDate(presence.date) }}
              <div v-if="presence.isRetro" class="mt-1">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <IconHistory class="w-3 h-3" /> Rétro
                </span>
              </div>
            </div>
            <StatusBadge :status="presence.status" type="presence" />
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm text-[var(--color-text-secondary)] mb-3">
            <div>
              <span class="block text-xs uppercase text-gray-400">Arrivée</span>
              <span class="font-medium text-[var(--color-text-primary)]">{{ formatTime(presence.heureArrivee) }}</span>
            </div>
            <div>
              <span class="block text-xs uppercase text-gray-400">Départ</span>
              <span class="font-medium text-[var(--color-text-primary)]">{{ presence.heureDepart ?
                formatTime(presence.heureDepart) : '-' }}</span>
            </div>
          </div>

          <div class="pt-3 border-t dark:border-gray-700 flex justify-between items-center">
            <div>
              <span class="text-xs uppercase text-gray-400 block">Indemnité</span>
              <span class="font-bold text-[var(--color-text-primary)]">{{ formatCurrency(presence.amount) }}</span>
            </div>
            <StatusBadge :status="presence.paymentStatus" type="payment" />
          </div>
        </div>

        <div v-if="filteredPresences.length === 0" class="text-center py-12 text-[var(--color-text-secondary)]">
          <IconClipboardOff class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune présence trouvée</p>
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
import { useAuthStore } from '~/stores/auth';
import { usePresenceStore } from '~/stores/presence';
import { IconFilterOff, IconCheck, IconClock, IconClipboardList, IconClipboardOff, IconChevronLeft, IconChevronRight, IconHistory } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Historique des présences',
  meta: [
    {
      name: 'description',
      content: "Consultez vos présences enregistrées."
    }
  ]
});

const authStore = useAuthStore();
const presenceStore = usePresenceStore();
const user = computed(() => authStore.currentUser);

const selectedMonth = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const months = computed(() => {
  const result = [];
  const date = new Date();
  const startDate = new Date(2025, 10, 1); // 1er Novembre 2025

  let d = new Date(date.getFullYear(), date.getMonth(), 1);

  while (d >= startDate) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');

    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    result.push({
      value: `${year}-${month}`,
      label: label.charAt(0).toUpperCase() + label.slice(1)
    });

    d.setMonth(d.getMonth() - 1);
  }
  return result;
});

onMounted(async () => {
  if (user.value) {
    await presenceStore.fetchMyPresences();
  }
});

const filteredPresences = computed(() => {
  let result = [...presenceStore.presences];

  if (selectedMonth.value) {
    result = result.filter(p => p.date.startsWith(selectedMonth.value));
  }

  if (selectedStatus.value) {
    result = result.filter(p => p.status === selectedStatus.value);
  }

  return result.sort((a, b) => b.date.localeCompare(a.date));
});

const validatedCount = computed(() => {
  return filteredPresences.value.filter(p => p.status === 'validated').length;
});

const pendingCount = computed(() => {
  return filteredPresences.value.filter(p => p.status === 'pending').length;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPresences.value.length / itemsPerPage);
});

const paginatedPresences = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPresences.value.slice(start, end);
});

const resetFilters = () => {
  selectedMonth.value = '';
  selectedStatus.value = '';
  currentPage.value = 1;
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

watch([selectedMonth, selectedStatus], () => {
  currentPage.value = 1;
});
</script>
