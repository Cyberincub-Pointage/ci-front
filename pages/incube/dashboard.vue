<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
      <p class="text-[var(--color-text-secondary)] mt-1">Bienvenue {{ userName }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AppStatsCard label="Présences ce mois" :value="monthlyPresences" :icon="IconClipboardCheck" variant="primary" />
      <AppStatsCard label="Taux d'assiduité" :value="attendanceRate" :icon="IconChartLine" variant="success"
        format="percentage" />
      <AppStatsCard label="Montant gagné" :value="totalEarned" :icon="IconWallet" variant="secondary"
        format="currency" />
      <AppStatsCard label="En attente" :value="statsPending" :icon="IconClock" variant="warning" />
    </div>

    <!-- Actions principales -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Marquer la présence -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <IconClipboardCheck class="w-5 h-5 text-primary-600" />
          Présence du jour
        </h2>

        <div v-if="todayPresence">
          <div class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p class="font-medium text-green-900 dark:text-green-300">Présence marquée</p>
              <p class="text-sm text-green-700 dark:text-green-400 my-1">{{ formatTime(todayPresence.heureArrivee) }}
              </p>
              <StatusBadge :status="todayPresence.status" type="presence" />
            </div>
            <IconCheck class="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div v-else>
          <div class="text-center py-6">
            <IconMapPin class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p class="text-[var(--color-text-secondary)] mb-4">Vous n'avez pas encore marqué votre présence aujourd'hui
            </p>
            <NuxtLink to="/incube/presence" class="btn btn-primary">
              <IconClipboardCheck class="w-5 h-5" />
              Marquer ma présence
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Informations rapides -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <IconInfoCircle class="w-5 h-5 text-primary-600" />
          Informations
        </h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <IconUsersGroup class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p class="text-xs text-[var(--color-text-secondary)]">Équipe</p>
                <p class="font-medium">{{ equipe?.nom || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
                <IconFolders class="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <p class="text-xs text-[var(--color-text-secondary)]">Projet</p>
                <p class="font-medium">{{ projet?.nom || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <IconBuildingBank class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-xs text-[var(--color-text-secondary)]">Banque</p>
                <p class="font-medium">{{ banque?.nom || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Activité récente -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <IconHistory class="w-5 h-5 text-primary-600" />
          Présences récentes
        </h2>
        <NuxtLink to="/incube/history" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Voir tout
        </NuxtLink>
      </div>

      <div v-if="recentPresences.length > 0" class="space-y-2">
        <div v-for="presence in recentPresences" :key="presence.id"
          class="flex items-center justify-between p-3 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
          <div class="flex items-center gap-3">
            <IconCalendar class="w-5 h-5 text-[var(--color-text-secondary)]" />
            <div>
              <p class="font-medium">{{ formatDate(presence.date) }}</p>
              <p class="text-sm text-[var(--color-text-secondary)]">{{ formatTime(presence.heureArrivee) }}</p>
            </div>
          </div>
          <StatusBadge :status="presence.status" type="presence" />
          <span v-if="presence.isRetro"
            class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <IconHistory class="w-3 h-3" />
            Retro
          </span>
        </div>
      </div>

      <div v-else class="text-center py-6 text-[var(--color-text-secondary)]">
        Aucune présence enregistrée
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { usePresenceStore } from '~/stores/presence';
import { useEntitiesStore } from '~/stores/entities';
import { useProjectStore } from '~/stores/project';
import { useBankStore } from '~/stores/bank';
import { useTeamStore } from '~/stores/team';
import { IconClipboardCheck, IconChartLine, IconWallet, IconClock, IconCheck, IconMapPin, IconInfoCircle, IconUsersGroup, IconFolders, IconBuildingBank, IconHistory, IconCalendar } from '@tabler/icons-vue';
import type { Presence } from '~/types';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Tableau de bord Incubé',
  meta: [
    {
      name: 'description',
      content: "Suivi de présence et statistiques."
    }
  ]
});

const authStore = useAuthStore();
const presenceStore = usePresenceStore();
const entitiesStore = useEntitiesStore();
const projectStore = useProjectStore();
const bankStore = useBankStore();
const teamStore = useTeamStore();

onMounted(async () => {
  await Promise.all([
    presenceStore.fetchMyPresences(),
    authStore.fetchProfile(),
    entitiesStore.loadEntities(),
    teamStore.fetchTeams(),
    projectStore.fetchProjects(),
    bankStore.fetchBanks()
  ]);
});

const user = computed(() => authStore.currentUser as any);
const userName = computed(() => `${user.value?.prenom} ${user.value?.nom}`);

const myPresences = computed(() => presenceStore.presences);
const todayPresence = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return myPresences.value.find((p: Presence) => p.date === today);
});

const recentPresences = computed(() => {
  return [...myPresences.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
});

const monthlyPresences = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return myPresences.value.filter((p: Presence) => {
    const date = new Date(p.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
});

const attendanceRate = computed(() => {
  const validated = myPresences.value.filter((p: Presence) => p.status === 'validated').length;
  const total = myPresences.value.length;
  return total > 0 ? Math.round((validated / total) * 100) : 0;
});

const totalEarned = computed(() => {
  if (!user.value) return 0;
  return presenceStore.getTotalAmountByIncube(user.value.id);
});

const statsPending = computed(() => {
  return myPresences.value.filter((p: Presence) => p.status === 'pending').length;
});
const equipe = computed(() => {
  if (!user.value) return null;
  const equipeId = typeof user.value.equipe === 'object' ? user.value.equipe?.id : (user.value.equipeId || user.value.equipe);
  if (!equipeId) return null;
  return entitiesStore.getEquipeById(equipeId) || teamStore.teams.find(t => t.id == equipeId) || (typeof user.value.equipe === 'object' ? user.value.equipe : null);
});

const projet = computed(() => {
  if (!user.value) return null;
  const projetId = typeof user.value.projet === 'object' ? user.value.projet?.id : (user.value.projetId || user.value.projet);

  if (projetId) {
    return entitiesStore.getProjetById(projetId) || projectStore.projects.find(p => p.id == projetId) || (typeof user.value.projet === 'object' ? user.value.projet : null);
  }
  // Repli via l'équipe
  if (equipe.value) {
    return projectStore.projects.find(p => p.equipeId == equipe.value.id) ||
      projectStore.projects.find(p => p.equipe && p.equipe.id == equipe.value.id);
  }
  return null;
});

const banque = computed(() => {
  if (!user.value) return null;
  const banqueId = typeof user.value.banque === 'object' ? user.value.banque?.id : (user.value.banqueId || user.value.banque);
  if (!banqueId) return null;
  return entitiesStore.getBanqueById(banqueId) || bankStore.banks.find(b => b.id == banqueId) || (typeof user.value.banque === 'object' ? user.value.banque : null);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (time: string) => {
  return time.substring(0, 5);
};
</script>
