<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Entités', to: '/manage/entities' },
      { label: 'Banques', to: '/manage/entities/banques' },
      { label: bank?.nom || 'Détails' }
    ]" class="mb-6" />

    <!-- En-tête -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600"
            v-if="bank">
            {{ bank.nom }}
          </h1>
          <div v-else class="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <p class="text-gray-500 text-sm mt-1" v-if="bank">Banque partenaire</p>
        </div>
      </div>

      <div class="flex items-center gap-3" v-if="bank && isAdmin">
        <button @click="openEditModal" class="btn btn-outline gap-2">
          <IconEdit class="w-4 h-4" />
          Modifier
        </button>
        <button @click="handleDelete" class="btn btn-error text-white gap-2">
          <IconTrash class="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="py-12 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
      <!-- en tête -->
      <div class="card p-6 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <AppSkeleton type="rect" width="64px" height="64px" class="rounded-xl" />
          <div>
            <AppSkeleton type="text" width="200px" height="24px" class="mb-2" />
            <AppSkeleton type="text" width="150px" height="16px" />
          </div>
        </div>
        <AppSkeleton type="rect" width="100px" height="40px" class="rounded-lg" />
      </div>

      <!-- Contenu -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-6">
            <AppSkeleton type="text" width="120px" height="20px" class="mb-4" />
            <div class="space-y-4">
              <AppSkeleton type="text" width="100%" height="16px" />
              <AppSkeleton type="text" width="90%" height="16px" />
              <AppSkeleton type="text" width="40%" height="16px" />
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="card p-6">
            <AppSkeleton type="text" width="100px" height="20px" class="mb-4" />
            <AppSkeleton type="rect" width="100%" height="200px" class="rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu -->
    <div v-else-if="bank" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
              <IconBuildingBank class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Informations générales</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <label class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Nom de la
                banque</label>
              <p class="font-medium text-lg">{{ bank.nom }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <label class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">
                Code Banque
              </label>
              <div class="flex items-center gap-2">
                <IconCode class="w-5 h-5 text-gray-400" />
                <p class="font-mono text-lg text-primary-600 font-medium">{{ bank.code }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Incubés -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl text-secondary-600">
              <IconUsersGroup class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Incubés associés</h2>
            <span v-if="bank.incubes"
              class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">{{
                bank.incubes.length }}</span>
          </div>

          <div v-if="bank.incubes && bank.incubes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="incube in bank.incubes" :key="incube.id"
              class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900/30">
              <div class="flex items-center gap-4">
                <img
                  :src="incube.photoUrl || `https://ui-avatars.com/api/?name=${incube.prenom}+${incube.nom}&background=random`"
                  :alt="incube.nom" class="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ incube.prenom }} {{ incube.nom }}</h4>
                  <p class="text-sm text-gray-500">{{ incube.email }}</p>
                  <div class="flex gap-2 mt-1">
                    <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md" v-if="incube.projetId">Projet
                      assigné</span>
                  </div>
                </div>
              </div>
              <NuxtLink :to="`/manage/incubes/${incube.id}`" class="btn btn-sm btn-ghost text-primary-600">
                <IconEye class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>Aucun incubé associé à cette banque.</p>
          </div>
        </div>
      </div>

      <!-- Infos métadonnées & Actions rapides / Stats -->
      <div class="space-y-6">
        <!-- Section Paiements et Statistiques Graphiques -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IconCurrencyEuro class="w-5 h-5 text-gray-500" />
            Paiements & statistiques
          </h3>

          <div class="space-y-3 mb-6">
            <div>
              <label class="text-xs uppercase font-semibold text-gray-500 mb-1 block">Début</label>
              <input type="date" v-model="paymentPeriod.start" class="input w-full text-sm" />
            </div>
            <div>
              <label class="text-xs uppercase font-semibold text-gray-500 mb-1 block">Fin</label>
              <input type="date" v-model="paymentPeriod.end" class="input w-full text-sm" />
            </div>
          </div>

          <!-- Cartes de Statistiques financières -->
          <div class="grid grid-cols-1 gap-3 mb-6">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p class="text-xs text-blue-600 dark:text-blue-300 uppercase font-bold">Total Période</p>
              <p class="text-xl font-bold text-blue-900 dark:text-blue-100">{{ formatCurrency(bankStats.total) }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <p class="text-xs text-green-600 dark:text-green-300 uppercase font-bold">Payé</p>
                <p class="text-lg font-bold text-green-900 dark:text-green-100">{{ formatCurrency(bankStats.paid) }}</p>
              </div>
              <div
                class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p class="text-xs text-amber-600 dark:text-amber-300 uppercase font-bold">Reste</p>
                <p class="text-lg font-bold text-amber-900 dark:text-amber-100">{{ formatCurrency(bankStats.unpaid) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Résumé -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Détail par Incubé</h4>
            <div v-if="incubesWithPayments.length > 0" class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div v-for="inc in incubesWithPayments" :key="inc.id"
                class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="truncate mr-2">
                  <p class="font-medium truncate">{{ inc.prenom }} {{ inc.nom }}</p>
                  <p class="text-xs text-gray-500">{{ inc.stats.presences }} présences</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(inc.stats.total) }}</p>
                  <p v-if="inc.stats.unpaid > 0" class="text-xs text-amber-600 font-medium">Reste: {{
                    formatCurrency(inc.stats.unpaid) }}</p>
                  <p v-else class="text-xs text-green-600 font-medium">Ok</p>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-gray-500 italic text-center py-4">Aucune donnée pour cette période</p>
          </div>
        </div>

        <!-- Métadonnées -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">Métadonnées</h3>
          <ul class="space-y-4">
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-2">
                <IconCalendar class="w-4 h-4" /> Créé le
              </span>
              <span class="font-medium">{{ formatDate(bank.createdAt) }}</span>
            </li>
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-2">
                <IconId class="w-4 h-4" /> ID
              </span>
              <span class="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ bank.id
              }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="p-4 bg-gray-100 rounded-full mb-4">
        <IconBuildingBank class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Banque introuvable</h3>
      <p class="text-gray-500 mb-6">La banque que vous recherchez n'existe pas ou a été supprimée.</p>
      <NuxtLink to="/manage/entities/banques" class="btn btn-primary">Retour à la liste</NuxtLink>
    </div>

    <!-- Modale de modification -->
    <AppModal v-model="showEditModal" title="Modifier la Banque" is-form @confirm="updateBank" :loading="isSubmitting"
      submit-label="Enregistrer" :form="editForm" :fields="[
        { name: 'nom', label: 'Nom de la banque', type: 'text', required: true, icon: IconBuildingBank },
        { name: 'code', label: 'Code Banque', type: 'text', required: true, icon: IconCode }
      ]" />
  </div>
</template>

<script setup lang="ts">
import {
  IconBuildingBank, IconCode, IconCalendar, IconId, IconEdit, IconTrash, IconX, IconUsersGroup, IconEye, IconCurrencyEuro, IconClock
} from '@tabler/icons-vue';
import type { Banque } from '~/types';
import { ROLE_GROUPS } from '~/utils/roles';
import { usePresenceStore } from '~/stores/presence';
import { useAdminStore } from '~/stores/admin';

definePageMeta({
  middleware: ['auth', 'role'],
});

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.hasRole(ROLE_GROUPS.GAdmin_Role));

const route = useRoute();
const router = useRouter();
const bankStore = useBankStore();
const presenceStore = usePresenceStore();
const adminStore = useAdminStore();
const bankId = route.params.id as string;

// État de chargement et données
const loading = ref(true);
const isSubmitting = ref(false);
const bank = ref<Banque | null>(null);

// Logique des statistiques de paiement
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

const paymentPeriod = ref({
  start: firstDay,
  end: lastDay
});

const bankStats = computed(() => {
  if (!bank.value || !bank.value.incubes) return { total: 0, paid: 0, unpaid: 0, count: 0 };

  // Récupérer les IDs des incubés pour le filtrage
  const bankIncubeIds = bank.value.incubes.map((i: any) => i.id);

  // Filtrer les présences pour les incubés de cette banque et dans la plage de dates
  const relevantPresences = presenceStore.presences.filter(p => {
    return bankIncubeIds.includes(p.incubeId) &&
      p.status === 'validated' &&
      p.date >= paymentPeriod.value.start &&
      p.date <= paymentPeriod.value.end;
  });

  // Calcul des montants totaux et payés
  const total = relevantPresences.reduce((sum, p) => sum + p.amount, 0);
  const paid = relevantPresences.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return {
    total,
    paid,
    unpaid: total - paid,
    count: relevantPresences.length
  };
});

const incubesWithPayments = computed(() => {
  if (!bank.value || !bank.value.incubes) return [];

  return bank.value.incubes.map((incube: any) => {
    // Filtrer les présences spécifiques à cet incubé
    const userPresences = presenceStore.presences.filter(p => {
      return p.incubeId === incube.id &&
        p.status === 'validated' &&
        p.date >= paymentPeriod.value.start &&
        p.date <= paymentPeriod.value.end;
    });

    const total = userPresences.reduce((sum, p) => sum + p.amount, 0);
    const paid = userPresences.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return {
      ...incube,
      stats: {
        total,
        paid,
        unpaid: total - paid,
        presences: userPresences.length
      }
    };
  }).filter((i: any) => i.stats.total > 0 || i.stats.presences > 0); // Afficher uniquement les actifs
});

useHead({
  title: computed(() => bank.value ? `${bank.value.nom} - Banque` : 'Détails banque'),
  meta: [
    {
      name: 'description',
      content: "Consultez les détails de la banque partenaire et la liste des incubés associés."
    }
  ]
});
// Configuration pour la modale d'édition
const showEditModal = ref(false);
const editForm = ref({ nom: '', code: '' });

// Chargement des données de la banque
const loadBank = async () => {
  loading.value = true;
  try {
    if (bankId) {
      bank.value = await bankStore.fetchBank(bankId);
      await adminStore.loadUsers();
      await presenceStore.fetchPresences();
    }
  } catch (e) {
    console.error('Error fetching bank:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBank();
});

const openEditModal = () => {
  if (bank.value) {
    editForm.value = {
      nom: bank.value.nom,
      code: bank.value.code
    };
    showEditModal.value = true;
  }
};

// Mettre à jour les informations de la banque
const updateBank = async () => {
  if (!bank.value) return;

  isSubmitting.value = true;
  try {
    await bankStore.updateBank(bank.value.id, editForm.value);
    await loadBank();
    useToast().success('Banque mise à jour avec succès');
    showEditModal.value = false;
  } catch (error) {
    useToast().error('Erreur lors de la mise à jour');
  } finally {
    isSubmitting.value = false;
  }
};

// Supprimer la banque
const handleDelete = async () => {
  if (await useConfirm().confirm('Êtes-vous sûr de vouloir supprimer cette banque ? Cette action est irréversible.')) {
    if (bank.value) {
      try {
        await bankStore.deleteBank(bank.value.id);
        useToast().success('Banque supprimée avec succès');
        router.push('/manage/entities/banques');
      } catch (error) {
        useToast().error('Erreur lors de la suppression');
      }
    }
  }
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};
</script>
