<template>
  <div>
    <AppBreadcrumb :items="[
      {
        label: 'Gestion des permissions',
        to: '/formateur/permissions'
      },
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

      <!-- Actions -->
      <div v-if="permission.status === 'pending' || permission.status === 'viewed'" class="card">
        <h2 class="text-lg font-semibold mb-4">Actions</h2>
        <div class="flex gap-3">
          <button @click="approvePermission" class="btn btn-primary">
            <IconCheck class="w-5 h-5" />
            Approuver
          </button>
          <button @click="showRejectModal = true" class="btn btn-danger">
            <IconX class="w-5 h-5" />
            Rejeter
          </button>
        </div>
      </div>

      <!-- Infos sur l'incubé -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Incubé</h2>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <IconUser class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="font-medium text-lg">{{ getIncubeName() }}</p>
            <NuxtLink v-if="getIncubeId()" :to="`/manage/incubes/${getIncubeId()}`"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Voir le profil
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Détails de la demande -->
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

      <!-- Historique du traitement -->
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
              <p class="font-medium">Demande vue</p>
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

      <!-- Motif du rejet (si rejetée) -->
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
      <NuxtLink to="/formateur/permissions" class="btn btn-primary mt-4">
        Retour à la liste
      </NuxtLink>
    </div>

    <!-- Modal de rejet -->
    <AppModal v-model="showRejectModal" title="Rejeter la demande" :is-form="true" :loading="rejectLoading"
      submit-label="Rejeter" submit-variant="danger" :fields="rejectModalFields" :form="rejectForm"
      @confirm="confirmRejection">
      <template #icon>
        <IconAlertTriangle class="w-5 h-5 text-red-500" />
      </template>
      <p class="text-sm text-[var(--color-text-secondary)] mb-4">
        Veuillez indiquer le motif du rejet pour l'incubé
        <strong>{{ getIncubeName() }}</strong>.
      </p>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from '~/stores/permission';
import { IconArrowLeft, IconUser, IconFileText, IconEye, IconCheck, IconX, IconAlertTriangle, IconAlertCircle } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const router = useRouter();
const permissionStore = usePermissionStore();

const permissionId = computed(() => route.params.id as string);
const permission = computed(() => permissionStore.currentPermission);

const showRejectModal = ref(false);
const rejectLoading = ref(false);
const rejectForm = ref({
  reason: ''
});

const rejectModalFields = [
  {
    name: 'reason',
    label: 'Motif du rejet',
    type: 'textarea',
    required: true,
    placeholder: 'Ex: Justificatif manquant, hors délai...',
    minlength: 5
  }
];

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
      content: "Détails de la demande de permission."
    }
  ]
});

onMounted(async () => {
  if (permissionId.value) {
    try {
      // Charge la permission (marque comme vue auto si en attente)
      await permissionStore.fetchPermissionAsFormateur(permissionId.value);
    } catch (error) {
      console.error('Error loading permission:', error);
    }
  }
});

const getIncubeId = () => {
  if (!permission.value) return null;
  if (typeof permission.value.incube === 'object' && permission.value.incube) {
    return permission.value.incube.id;
  }
  return permission.value.incube;
};

// Récupère le nom complet de l'incubé
const getIncubeName = () => {
  if (!permission.value) return 'Inconnu';
  if (typeof permission.value.incube === 'object' && permission.value.incube) {
    return `${permission.value.incube.prenom} ${permission.value.incube.nom}`;
  }
  return 'Inconnu';
};

const { success, error } = useToast();

// Valide la permission
const approvePermission = async () => {
  if (!permission.value) return;

  const result = await permissionStore.processPermission(permission.value.id, true);
  if (result.success) {
    success('Permission approuvée avec succès.', 'Validée');
    // Retour à la liste après validation
    router.push('/formateur/permissions');
  } else {
    error(result.message || 'Erreur lors de l\'approbation.', 'Erreur');
  }
};

const confirmRejection = async () => {
  if (!permission.value) return;

  rejectLoading.value = true;
  try {
    const result = await permissionStore.processPermission(
      permission.value.id,
      false,
      rejectForm.value.reason
    );

    if (result.success) {
      success('Permission rejetée avec succès.', 'Rejetée');
      showRejectModal.value = false;
      // Retour à la liste
      router.push('/formateur/permissions');
    } else {
      error(result.message || 'Erreur lors du rejet.', 'Erreur');
    }
  } catch (e: any) {
    console.error('Error rejecting permission:', e);
    error(e.message || 'Une erreur est survenue.', 'Erreur');
  } finally {
    rejectLoading.value = false;
  }
};
</script>
