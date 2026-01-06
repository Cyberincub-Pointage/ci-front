<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Marquer ma présence' }]" class="mb-6" />

    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Marquer ma présence</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Pointage géolocalisé</p>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="card mb-8">
        <!-- Vérificateur de géolocalisation -->
        <div class="text-center mb-6">
          <div class="w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center mb-4" :class="{
            'border-green-500 bg-green-50 dark:bg-green-900/20': isInZone && !isChecking,
            'border-red-500 bg-red-50 dark:bg-red-900/20': !isInZone && !isChecking,
            'border-gray-300 bg-gray-50 dark:bg-gray-800': isChecking,
          }">
            <IconLoader v-if="isChecking" class="w-16 h-16 text-gray-400 animate-spin" />
            <IconMapCheck v-else-if="isInZone" class="w-16 h-16 text-green-500" />
            <IconMapX v-else class="w-16 h-16 text-red-500" />
          </div>

          <h2 class="text-xl font-bold mb-2">
            {{ isChecking ? 'Vérification...' : isInZone ? 'Vous êtes dans la zone' : 'Hors zone autorisée' }}
          </h2>

          {{ isChecking ? 'Détection de votre position...' : isInZone ?
            'Vous pouvez marquer votre présence' : 'Veuillez vous rendre sur le site pour pointer' }}

          <div v-if="!isInZone && !isChecking && distanceToZone > 0"
            class="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm inline-block text-left border border-gray-100 dark:border-gray-700">
            <p class="mb-1"><span class="font-semibold">Distance :</span> {{ distanceToZone }}m <span
                class="text-xs text-gray-500">(Autorisé: {{ zoneRadius }}m)</span></p>
            <p><span class="font-semibold">Votre position :

              </span> {{ coordinates.latitude.toFixed(6) }}, {{ coordinates.longitude.toFixed(6) }}</p>
          </div>
        </div>

        <!-- Bouton de vérification -->
        <button v-if="!isChecking" @click="handleCheckLocation" class="w-full btn btn-outline mb-4">
          <IconRefresh class="w-5 h-5 mr-2" />
          Vérifier à nouveau
        </button>

        <!-- Messages de succès/erreur -->
        <div v-if="successMessage"
          class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
          <p class="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <IconCheck class="w-5 h-5" />
            {{ successMessage }}
          </p>
        </div>

        <div v-if="errorMessage"
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <IconAlertCircle class="w-5 h-5" />
            {{ errorMessage }}
          </p>
        </div>

        <!-- Bouton pour marquer la présence -->
        <button @click="handleMarkPresence" :disabled="isSubmitting || !!todayPresence" class="w-full btn btn-primary">
          <IconLoader v-if="isSubmitting" class="w-5 h-5 animate-spin mr-2" />
          <IconClipboardCheck v-else class=" w-5 h-5 mr-2" />
          <span v-if="todayPresence">Présence déjà marquée aujourd'hui</span>
          <span v-else-if="isSubmitting">Enregistrement...</span>
          <span v-else>Marquer ma présence</span>
        </button>

        <!-- Boîte d'information -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 class="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <IconInfoCircle class="w-5 h-5" />
            Informations importantes
          </h3>
          <ul class="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>La géolocalisation doit être activée</li>
            <li>Vous devez être sur site pour pointer</li>
            <li>Une seule présence par jour est autorisée</li>
            <li>La présence sera validée par votre formateur</li>
          </ul>
        </div>
      </div>

      <!-- Section Historique -->
      <div class="mt-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <IconHistory class="w-6 h-6" />
            Historique des présences
          </h2>

          <!-- Filtres de date -->
          <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input type="date" v-model="filters.startDate" class="input py-1 text-sm" />
            <input type="date" v-model="filters.endDate" class="input py-1 text-sm" />
            <button @click="resetDateFilters" class="btn btn-sm btn-ghost" title="Aujourd'hui">
              <IconCalendarBolt class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="card overflow-hidden p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-[var(--color-bg-secondary)] border-b">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th class="px-4 py-3 text-left text-sm font-medium">Arrivée</th>
                  <th class="px-4 py-3 text-left text-sm font-medium">Départ</th>
                  <th class="px-4 py-3 text-left text-sm font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="presence in filteredPresences" :key="presence.id"
                  class="border-b hover:bg-[var(--color-bg-secondary)] transition-colors">
                  <td class="px-4 py-3 text-sm font-medium">{{ formatDate(presence.date) }}</td>
                  <td class="px-4 py-3 text-sm">{{ formatTime(presence.heureArrivee) }}</td>
                  <td class="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    {{ presence.heureDepart ? formatTime(presence.heureDepart) : '-' }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <StatusBadge :status="presence.status" type="presence" />
                  </td>
                </tr>
                <tr v-if="filteredPresences.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    <p>Aucune présence trouvée pour cette période</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { usePresenceStore } from '~/stores/presence';
import { IconMapCheck, IconMapX, IconRefresh, IconCheck, IconAlertCircle, IconClipboardCheck, IconLoader, IconInfoCircle, IconHistory, IconCalendarBolt } from '@tabler/icons-vue';
import { storeToRefs } from 'pinia';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Marquer ma présence',
  meta: [
    {
      name: 'description',
      content: "Pointage géolocalisé pour les incubés."
    }
  ]
});

const authStore = useAuthStore();
const presenceStore = usePresenceStore();

// Déstructuration de l'état réactif du store
const {
  isInAllowedZone: isInZone,
  isCheckingZone: isChecking,
  geoCoordinates: coordinates,
  geoError,
  distanceToZone,
  zoneRadius
} = storeToRefs(presenceStore);

const user = computed(() => authStore.currentUser);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Filtres de date
const today = new Date().toISOString().split('T')[0];
const filters = ref({
  startDate: today,
  endDate: today
});

const todayPresence = computed(() => {
  if (!user.value) return null;
  return presenceStore.presences.find(p => p.date === today);
});

const filteredPresences = computed(() => {
  return presenceStore.presences.filter(p => {
    return p.date >= filters.value.startDate && p.date <= filters.value.endDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const handleCheckLocation = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  await presenceStore.checkGeolocation();
};

onMounted(async () => {
  await presenceStore.checkGeolocation();
  await presenceStore.fetchMyPresences();
});

const { confirm } = useConfirm();

const handleMarkPresence = async () => {
  if (!user.value) return;
  if (!isInZone.value) {
    const isConfirmed = await confirm({
      title: 'Hors zone autorisée',
      message: "Vous êtes hors de la zone autorisée. Votre présence sera marquée comme 'hors site'. Voulez-vous continuer ?",
      type: 'warning',
      confirmLabel: 'Continuer',
      cancelLabel: 'Annuler'
    });

    if (!isConfirmed) return;
  }

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const result = await presenceStore.markPresence(user.value.id);

    if (result.success) {
      successMessage.value = result.message;
    } else {
      errorMessage.value = result.message;
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false;
  }
};

const resetDateFilters = () => {
  filters.value.startDate = today;
  filters.value.endDate = today;
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
</script>
