<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Avertissements', to: '/manage/warnings' }, { label: 'Détail' }]" class="mb-6" />

    <div v-if="loading" class="card max-w-3xl mx-auto space-y-6">
       <!-- En-tête -->
       <div class="flex justify-between items-start border-b pb-4">
          <div>
             <AppSkeleton type="text" width="200px" height="32px" className="mb-2" />
             <AppSkeleton type="text" width="150px" height="16px" />
          </div>
          <AppSkeleton type="rect" width="100px" height="40px" />
       </div>

       <!-- Grille -->
       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center gap-3">
             <AppSkeleton type="circle" width="3rem" height="3rem" />
             <div class="flex-1">
                <AppSkeleton type="text" width="80%" height="20px" className="mb-1" />
                <AppSkeleton type="text" width="40%" height="12px" />
             </div>
          </div>
          <div>
             <AppSkeleton type="text" width="30%" height="14px" className="mb-2" />
             <AppSkeleton type="rect" width="120px" height="28px" className="rounded-full" />
          </div>
       </div>

       <!-- Description -->
       <div class="p-6 rounded-lg border border-gray-100 dark:border-gray-700 h-32">
          <AppSkeleton type="text" width="40%" height="14px" className="mb-4" />
          <AppSkeleton type="text" width="100%" height="14px" className="mb-2" />
          <AppSkeleton type="text" width="90%" height="14px" className="mb-2" />
          <AppSkeleton type="text" width="60%" height="14px" />
       </div>
    </div>

    <div v-else-if="warning" class="card max-w-3xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <IconAlertTriangle class="w-8 h-8 text-yellow-500" />
            Détail de l'avertissement
          </h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Émis le {{ formatDate(warning.date) }}
          </p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <NuxtLink to="/manage/warnings" class="btn btn-outline w-full md:w-auto justify-center">
            Retour
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Incubé concerné</h3>
          <NuxtLink :to="`/manage/incubes/${warning.incube.id || warning.incube}`" class="flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -ml-2 rounded-lg transition-colors">
             <div class="relative w-12 h-12">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                   <img v-if="warning.incube && warning.incube.photoUrl" :src="warning.incube.photoUrl" alt="" class="w-full h-full object-cover" />
                   <span v-else>{{ getInitials(warning.incube) }}</span>
                </div>
             </div>
             <div>
                <p class="font-medium text-lg group-hover:text-primary-600 transition-colors">{{ getName(warning.incube) }}</p>
                <p class="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                   Voir le profil <IconExternalLink class="w-3 h-3" />
                </p>
             </div>
          </NuxtLink>
        </div>
        <div>
           <h3 class="text-sm font-semibold text-[var(--color-text-secondary)] uppercase mb-1">Motif</h3>
           <StatusBadge :status="warning.motif" type="warning" :show-icon="false" class="text-lg px-3 py-1 h-auto" />
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">Description / Raison</h3>
        <p class="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{{ warning.description }}</p>
      </div>

      <div class="mt-6 text-xs text-right text-gray-400">
        ID: {{ warning.id }}
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p>Avertissement introuvable.</p>
      <NuxtLink to="/manage/warnings" class="btn btn-primary mt-4">Retour à la liste</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconExternalLink } from '@tabler/icons-vue';
import { useFormateurStore } from '~/stores/formateur';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const formateurStore = useFormateurStore();
const warning = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    try {
      warning.value = await formateurStore.fetchWarningDetails(id);
    } catch (e) {
      useToast().error('Erreur lors du chargement de l\'avertissement');
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getName = (user: any) => {
  if (user && typeof user === 'object') {
    return `${user.prenom} ${user.nom}`;
  }
  return 'Utilisateur inconnu';
};

const getInitials = (user: any) => {
  if (user && typeof user === 'object') {
    return `${user.prenom ? user.prenom[0] : ''}${user.nom ? user.nom[0] : ''}`;
  }
  return '?';
};
</script>
