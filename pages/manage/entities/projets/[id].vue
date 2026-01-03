<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Entités', to: '/manage/entities' },
      { label: 'Projets', to: '/manage/entities/projets' },
      { label: project?.nom || 'Détails' }
    ]" class="mb-6" />

    <!-- En-tête -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-600 to-teal-600"
            v-if="project">
            {{ project.nom }}
          </h1>
          <div v-else class="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <p class="text-gray-500 text-sm mt-1" v-if="project">Projet incubé</p>
        </div>
      </div>

      <div class="flex items-center gap-3" v-if="project && isAdmin">
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
      <!-- Squelette d'en-tête -->
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

      <!-- Squelette de contenu -->
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
    <div v-else-if="project" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Colonne de gauche : Infos principales -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Carte principale -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl text-secondary-600">
              <IconFolders class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Détails du projet</h2>
          </div>

          <div class="space-y-6">
            <div class="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <label class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ project.description || 'Aucune description disponible.' }}</p>
            </div>
          </div>
        </div>

        <!-- Section Incubés -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-teal-600">
              <IconUsersGroup class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-bold">Incubés sur le projet</h2>
            <span v-if="project.incubes"
              class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">{{
                project.incubes.length }}</span>
          </div>

          <div v-if="project.incubes && project.incubes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="incube in project.incubes" :key="incube.id"
              class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900/30">
              <div class="flex items-center gap-4">
                <img
                  :src="incube.photoUrl || `https://ui-avatars.com/api/?name=${incube.prenom}+${incube.nom}&background=random`"
                  :alt="incube.nom" class="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ incube.prenom }} {{ incube.nom }}</h4>
                  <p class="text-sm text-gray-500">{{ incube.email }}</p>
                </div>
              </div>
              <NuxtLink :to="`/manage/incubes/${incube.id}`" class="btn btn-sm btn-ghost text-primary-600">
                <IconEye class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>Aucun incubé n'est actuellement assigné à ce projet.</p>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : Infos métadonnées & Actions rapides -->
      <div class="space-y-6">
        <!-- Équipe -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IconUsersGroup class="w-5 h-5 text-gray-500" />
            Équipe
          </h3>
          <div v-if="project.equipeId" class="flex items-center justify-between">
            <p class="font-medium text-lg">{{ getEquipeName(project.equipeId) }}</p>
            <NuxtLink :to="`/manage/entities/equipes/${project.equipeId}`"
              class="btn btn-ghost btn-sm text-primary-600">Voir l'équipe</NuxtLink>
          </div>
          <p v-else class="text-gray-500">Aucune équipe</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-4">Informations système</h3>
          <ul class="space-y-4">
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-2">
                <IconCalendar class="w-4 h-4" /> Créé le
              </span>
              <span class="font-medium">{{ formatDate(project.createdAt) }}</span>
            </li>
            <li class="flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-2">
                <IconId class="w-4 h-4" /> ID
              </span>
              <span
                class="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded w-24 truncate text-right">{{
                  project.id }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <div class="p-4 bg-gray-100 rounded-full mb-4">
        <IconFolders class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Projet introuvable</h3>
      <p class="text-gray-500 mb-6">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
      <NuxtLink to="/manage/entities/projets" class="btn btn-primary">Retour à la liste</NuxtLink>
    </div>

    <!-- Modale de modification -->
    <AppModal v-model="showEditModal" title="Modifier le Projet" is-form @confirm="updateProject"
      :loading="isSubmitting" submit-label="Enregistrer" :form="editForm" :fields="[
        { name: 'nom', label: 'Nom du projet', type: 'text', required: true, icon: IconFolders },
        { name: 'equipeId', label: 'Équipe associée', type: 'select', required: true, icon: IconUsersGroup, options: (teamStore.teams || []).map(t => ({ value: t.id, label: t.nom })), placeholder: 'Sélectionner une équipe' },
        { name: 'description', label: 'Description', type: 'textarea', icon: IconBook }
      ]" />
  </div>
</template>

<script setup lang="ts">
import { IconFolders, IconCalendar, IconId, IconEdit, IconTrash, IconUsersGroup, IconBook, IconEye } from '@tabler/icons-vue';
import type { Projet } from '~/types';
import { ROLE_GROUPS } from '~/utils/roles';

definePageMeta({
  middleware: ['auth', 'role'],
});

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.hasRole(ROLE_GROUPS.GAdmin_Role));

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const teamStore = useTeamStore();
const projectId = route.params.id as string;

const loading = ref(true);
const isSubmitting = ref(false);
const project = ref<Projet | null>(null);

useHead({
  title: computed(() => project.value ? `${project.value.nom} - Projet` : 'Détails projet'),
  meta: [
    {
      name: 'description',
      content: "Détails du projet incubé. Équipe assignée, description et incubés participants."
    }
  ]
});
const showEditModal = ref(false);
const editForm = ref({ nom: '', description: '', equipeId: '' });

const loadProject = async () => {
  loading.value = true;
  try {
    await Promise.all([
      teamStore.fetchTeams().catch(err => console.error('Erreur lors de la récupération des équipes', err)),
      (async () => {
        if (projectId) {
          project.value = await projectStore.fetchProject(projectId);
        }
      })()
    ]);
  } catch (e) {
    console.error('Erreur lors de la récupération des données du projet :', e);
  } finally {
    loading.value = false;
  }
};

// Cycle de vie
onMounted(() => {
  loadProject();
});

const openEditModal = () => {
  if (project.value) {
    editForm.value = {
      nom: project.value.nom,
      description: project.value.description,
      equipeId: project.value.equipeId
    };
    showEditModal.value = true;
  }
};

const updateProject = async () => {
  if (!project.value) return;

  isSubmitting.value = true;
  try {
    await projectStore.updateProject(project.value.id, editForm.value);
    await loadProject();
    useToast().success('Projet mis à jour avec succès');
    showEditModal.value = false;
  } catch (error) {
    useToast().error('Erreur lors de la mise à jour');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  if (await useConfirm().confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
    if (project.value) {
      try {
        await projectStore.deleteProject(project.value.id);
        useToast().success('Projet supprimé avec succès');
        router.push('/manage/entities/projets');
      } catch (error) {
        useToast().error('Erreur lors de la suppression');
      }
    }
  }
};

const getEquipeName = (id: string) => {
  const equipe = teamStore.teams.find(t => t.id === id);
  return equipe ? equipe.nom : 'Équipe inconnue';
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
};
</script>
