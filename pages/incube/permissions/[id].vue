<template>
  <div>
    <AppBreadcrumb :items="[
      { label: 'Mes permissions', to: '/incube/permissions' },
      { label: 'Détails' }
    ]" class="mb-6" />

    <div v-if="permissionStore.loading" class="flex items-center justify-center py-12">
      <AppLoader />
    </div>

    <div v-else-if="permission" class="space-y-6">
      <!-- En-tête -->
      <div class="card">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 class="text-2xl font-bold mb-2">Demande de permission</h1>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium"
              :class="getTypeClass(permission.type)">
              {{ getTypeLabel(permission.type) }}
            </span>
            <StatusBadge :status="permission.status" type="permission" />
          </div>
        </div>
      </div>

      <!-- Détails -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Informations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-[var(--color-text-secondary)]">Date de début</p>
            <p class="font-medium">{{ formatDate(permission.dateDebut) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--color-text-secondary)]">Date de fin</p>
            <p class="font-medium">{{ permission.dateFin ? formatDate(permission.dateFin) : 'Non spécifiée' }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-[var(--color-text-secondary)] mb-2">Motif</p>
            <p class="font-medium bg-[var(--color-bg-secondary)] p-3 rounded">{{ permission.motif }}</p>
          </div>
        </div>
      </div>

      <!-- Historique -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Historique</h2>
        <div class="space-y-4">
          <!-- Création -->
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IconFileText class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium">Demande créée</p>
              <p class="text-sm text-[var(--color-text-secondary)]">{{ formatDateTime(permission.createdAt) }}</p>
            </div>
          </div>

          <!-- Vue -->
          <div v-if="permission.viewedAt" class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <IconEye class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium">Demande vue par un formateur</p>
              <p class="text-sm text-[var(--color-text-secondary)]">{{ formatDateTime(permission.viewedAt) }}</p>
            </div>
          </div>

          <!-- Traitée -->
          <div v-if="permission.processedAt" class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="permission.status === 'approved'
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-red-100 dark:bg-red-900/30'">
              <IconCheck v-if="permission.status === 'approved'" class="w-5 h-5 text-green-600 dark:text-green-400" />
              <IconX v-else class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium">
                {{ permission.status === 'approved' ? 'Demande approuvée' : 'Demande rejetée' }}
              </p>
              <p class="text-sm text-[var(--color-text-secondary)]">{{ formatDateTime(permission.processedAt) }}</p>
              <div v-if="permission.processedBy && typeof permission.processedBy === 'object'" class="mt-1">
                <p class="text-sm">
                  Par: <span class="font-medium">{{ permission.processedBy.prenom }} {{ permission.processedBy.nom
                  }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Motif du rejet -->
      <div v-if="permission.status === 'rejected' && permission.rejectionReason"
        class="card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
        <div class="flex items-start gap-3">
          <IconAlertTriangle class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 class="font-semibold text-red-900 dark:text-red-200 mb-2">Motif du rejet</h3>
            <p class="text-red-800 dark:text-red-300">{{ permission.rejectionReason }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card text-center py-12">
      <IconAlertCircle class="w-16 h-16 mx-auto mb-4 opacity-50 text-[var(--color-text-secondary)]" />
      <p class="text-[var(--color-text-secondary)]">Permission non trouvée</p>
      <NuxtLink to="/incube/permissions" class="btn btn-primary mt-4">
        Retour à la liste
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from '~/stores/permission';
import { IconArrowLeft, IconFileText, IconEye, IconCheck, IconX, IconAlertTriangle, IconAlertCircle } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const permissionStore = usePermissionStore();

const permissionId = computed(() => route.params.id as string);
const permission = computed(() => permissionStore.currentPermission);

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    absence: 'Absence',
    retard: 'Retard',
    sortie_anticipee: 'Sortie anticipée',
    autre: 'Autre'
  };
  return labels[type] || type;
};

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    absence: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    retard: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    sortie_anticipee: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    autre: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };
  return classes[type] || classes.autre;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

useHead({
  title: computed(() => permission.value ? `Permission - ${getTypeLabel(permission.value.type)}` : 'Détails permission'),
  meta: [
    {
      name: 'description',
      content: "Détails de votre demande de permission."
    }
  ]
});

onMounted(async () => {
  if (permissionId.value) {
    try {
      await permissionStore.fetchPermission(permissionId.value);
    } catch (error) {
      console.error('Error loading permission:', error);
    }
  }
});
</script>
