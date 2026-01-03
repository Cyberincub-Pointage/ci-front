<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Entités', to: '/manage/entities' },
      { label: 'Équipes', to: '/manage/entities/equipes' },
      { label: team?.nom || 'Détails' }
    ]" class="mb-6" />

    <!-- En-tête -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600"
            v-if="team">
            {{ team.nom }}
          </h1>
          <div v-else class="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <p class="text-gray-500 text-sm mt-1" v-if="team">Équipe de formation</p>
        </div>
      </div>

      <div class="flex items-center gap-3" v-if="team && isAdmin">
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

    <div v-if="loading" class="py-12 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
      <!-- Chargement -->
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
    <div v-else-if="team" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Infos principales -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
              <IconUsersGroup class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Détails de l'équipe</h2>
          </div>

          <div class="space-y-6">
            <div class="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <label class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ team.description || 'Aucune description disponible.' }}</p>
            </div>
          </div>
        </div>

        <!-- Section Membres -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
              <IconUsersGroup class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Membres de l'équipe</h2>
            <span v-if="team.membres"
              class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
              {{ team.membres.length }}</span>
          </div>

          <div v-if="team.membres && team.membres.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="membre in team.membres" :key="membre.id"
              class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900/30">
              <div class="flex items-center gap-4">
                <img
                  :src="membre.photoUrl || `https://ui-avatars.com/api/?name=${membre.prenom}+${membre.nom}&background=random`"
                  :alt="membre.nom" class="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ membre.prenom }} {{ membre.nom }}</h4>
                  <p class="text-sm text-gray-500">{{ membre.email }}</p>
                </div>
              </div>
              <NuxtLink :to="`/manage/incubes/${membre.id}`" class="btn btn-sm btn-ghost text-primary-600">
                <IconEye class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>Aucun membre dans cette équipe.</p>
          </div>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="space-y-6">
        <!-- Formateur responsable -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
              <IconUserShield class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-gray-900 dark:text-white">Formateur responsable</h3>
          </div>
          <div v-if="team.formateurId" class="flex items-center justify-between">
            <p class="font-medium text-lg">{{ team.formateurId }}</p>
            <NuxtLink :to="`/manage/formateurs/${team.formateurId}`" class="btn btn-ghost btn-sm text-primary-600">Voir
              profil</NuxtLink>
          </div>
          <div v-else class="text-gray-500 text-sm">Non assigné</div>
        </div>

        <!-- Projets liés -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl text-secondary-600">
              <IconFolders class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Projets associés</h2>
          </div>

          <div v-if="team.projets && team.projets.length > 0" class="space-y-4">
            <div v-for="projet in team.projets" :key="projet.id"
              class="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900/30 flex justify-between items-center">
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ projet.nom }}</h4>
                <p class="text-sm text-gray-500 truncate max-w-xs">{{ projet.description }}</p>
              </div>
              <NuxtLink :to="`/manage/entities/projets/${projet.id}`" class="btn btn-sm btn-ghost">Voir</NuxtLink>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            <p>Aucun projet associé à cette équipe.</p>
          </div>
        </div>

        <!-- Infos métadonnées & Actions rapides -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">Informations système</h3>
          <ul class="space-y-4">
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-2">
                <IconCalendar class="w-4 h-4" /> Créée le
              </span>
              <span class="font-medium">{{ formatDate(team.createdAt) }}</span>
            </li>
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-2">
                <IconId class="w-4 h-4" /> ID
              </span>
              <span
                class="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded w-24 truncate text-right">{{
                  team.id }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="p-4 bg-gray-100 rounded-full mb-4">
        <IconUsersGroup class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Équipe introuvable</h3>
      <p class="text-gray-500 mb-6">L'équipe que vous recherchez n'existe pas ou a été supprimée.</p>
      <NuxtLink to="/manage/entities/equipes" class="btn btn-primary">Retour à la liste</NuxtLink>
    </div>

    <!-- Modale de modification -->
    <AppModal v-model="showEditModal" title="Modifier l'Équipe" is-form @confirm="updateTeam" :loading="isSubmitting"
      submit-label="Enregistrer" :form="editForm" :fields="[
        { name: 'nom', label: 'Nom de l\'équipe', type: 'text', required: true, icon: IconUsersGroup },
        { name: 'description', label: 'Description', type: 'textarea', icon: IconBook },
      ]" />
  </div>
</template>

<script setup lang="ts">
import { IconUsersGroup, IconCalendar, IconId, IconEdit, IconTrash, IconX, IconUserShield, IconFolders, IconBook, IconEye } from '@tabler/icons-vue';
import type { Equipe } from '~/types';
import { ROLE_GROUPS } from '~/utils/roles';

definePageMeta({
  middleware: ['auth', 'role'],
});

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.hasRole(ROLE_GROUPS.GAdmin_Role));

const route = useRoute();
const router = useRouter();
const teamStore = useTeamStore();
const teamId = route.params.id as string;

const loading = ref(true);
const isSubmitting = ref(false);
const team = ref<Equipe | null>(null);

useHead({
  title: computed(() => team.value ? `${team.value.nom} - Équipe` : 'Détails équipe'),
  meta: [
    {
      name: 'description',
      content: "Détails de l'équipe d'incubation. Membres, formateur responsable et projets associés."
    }
  ]
});
const showEditModal = ref(false);
const editForm = ref({ nom: '', description: '', formateurId: '' });

const loadTeam = async () => {
  loading.value = true;
  try {
    if (teamId) {
      team.value = await teamStore.fetchTeam(teamId);
    }
  } catch (e) {
    console.error('Error fetching team:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTeam();
});

const openEditModal = () => {
  if (team.value) {
    editForm.value = {
      nom: team.value.nom,
      description: team.value.description,
      formateurId: team.value.formateurId
    };
    showEditModal.value = true;
  }
};

const updateTeam = async () => {
  if (!team.value) return;

  isSubmitting.value = true;
  try {
    await teamStore.updateTeam(team.value.id, editForm.value);
    await loadTeam();
    showEditModal.value = false;
    useToast().success('Équipe mise à jour avec succès');
  } catch (error) {
    useToast().error('Erreur lors de la mise à jour');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  if (await useConfirm().confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
    if (team.value) {
      try {
        await teamStore.deleteTeam(team.value.id);
        useToast().success('Équipe supprimée avec succès');
        router.push('/manage/entities/equipes');
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
</script>
