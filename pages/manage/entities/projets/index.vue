<template>
  <div>
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Entités', to: '/manage/entities' },
      { label: 'Projets' }
    ]" class="mb-6" />

    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Gestion des projets</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Suivi des projets incubés</p>
      </div>
      <button v-if="isAdmin" @click="openModal()" class="btn btn-primary w-full md:w-auto justify-center">
        <IconPlus class="w-5 h-5 mr-2" />
        Nouveau Projet
      </button>
    </div>

    <div v-if="projectStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card h-56 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <AppSkeleton type="rect" width="48px" height="48px" class="rounded-lg" />
          <div class="flex gap-2">
            <AppSkeleton type="circle" width="32px" height="32px" />
            <AppSkeleton type="circle" width="32px" height="32px" />
            <AppSkeleton type="circle" width="32px" height="32px" />
          </div>
        </div>
        <div>
          <AppSkeleton type="text" width="70%" height="24px" class="mb-2" />
          <AppSkeleton type="rect" width="100px" height="24px" class="mb-3 rounded" />
          <AppSkeleton type="text" width="90%" height="16px" />
        </div>
        <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
          <AppSkeleton type="text" width="40%" height="14px" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="projet in projectStore.projects" :key="projet.id" class="card hover:shadow-md transition-all">
        <div class="flex justify-between items-start mb-4">
          <div
            class="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400">
            <IconFolders class="w-6 h-6" />
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/manage/entities/projets/${projet.id}`" class="btn btn-ghost p-1 text-primary-600">
              <IconEye class="w-5 h-5" />
            </NuxtLink>
            <button v-if="isAdmin" @click="openModal(projet)" class="btn btn-ghost p-1 text-blue-600">
              <IconEdit class="w-5 h-5" />
            </button>
            <button v-if="isAdmin" @click="deleteProjet(projet.id)" class="btn btn-ghost p-1 text-red-600">
              <IconTrash class="w-5 h-5" />
            </button>
          </div>
        </div>

        <h3 class="text-lg font-bold mb-1">{{ projet.nom }}</h3>
        <span
          class="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-[var(--color-text-secondary)] mb-3 inline-block">
          {{ getEquipeName(projet.equipeId) }}
        </span>
        <p class="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{{ projet.description }}</p>

        <div class="flex items-center text-sm text-[var(--color-text-secondary)] border-t pt-3">
          <IconCalendar class="w-4 h-4 mr-2" />
          Créé le {{ formatDate(projet.createdAt) }}
        </div>
      </div>
    </div>

    <div v-if="!projectStore.loading && projectStore.projects.length === 0" class="text-center py-12 text-gray-500">
      Aucun projet trouvé.
    </div>

    <!-- Modale -->
    <AppModal v-model="showModal" :title="isEditing ? 'Modifier Projet' : 'Nouveau Projet'" is-form @confirm="saveProjet"
      :loading="isSubmitting" :submit-label="isEditing ? 'Enregistrer' : 'Créer'" :form="form" :fields="[
        { name: 'nom', label: 'Nom du projet', type: 'text', required: true, icon: IconFolders },
        { name: 'equipeId', label: 'Équipe associée', type: 'select', required: true, icon: IconUsersGroup, options: (teamStore.teams || []).map(t => ({ value: t.id, label: t.nom })), placeholder: 'Sélectionner une équipe' },
        { name: 'description', label: 'Description', type: 'textarea', icon: IconBook }
      ]" />
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconFolders, IconUsersGroup, IconBook, IconEdit, IconTrash, IconCalendar, IconEye } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.hasRole(ROLE_GROUPS.GAdmin_Role));

useHead({
  title: 'Gestion des projets',
  meta: [
    { 
      name: 'description', 
      content: "Suivi des projets incubés. Assignation aux équipes, gestion des descriptions et statuts." 
    }
  ]
});

const projectStore = useProjectStore();
const teamStore = useTeamStore();

// Gestion de la modale (création/édition)
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const form = ref({
  nom: '',
  description: '',
  equipeId: ''
});

// Chargement initial des données
onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects(),
    teamStore.fetchTeams()
  ]);
});

const isSubmitting = ref(false);

// Ouvrir la modale (vide pour créer, pré-remplie pour éditer)
const openModal = (projet?: any) => {
  if (projet) {
    isEditing.value = true;
    editingId.value = projet.id;
    form.value = { nom: projet.nom, description: projet.description, equipeId: projet.equipeId };
  } else {
    isEditing.value = false;
    editingId.value = '';
    form.value = { nom: '', description: '', equipeId: '' };
  }
  showModal.value = true;
};

// Enregistrer le projet (création ou mise à jour)
const saveProjet = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await projectStore.updateProject(editingId.value, form.value);
      useToast().success('Projet modifié avec succès');
    } else {
      await projectStore.createProject(form.value);
      useToast().success('Projet créé avec succès');
    }
    showModal.value = false;
  } catch (error) {
    useToast().error('Erreur lors de l\'enregistrement');
  } finally {
    isSubmitting.value = false;
  }
};

// Supprimer un projet
const deleteProjet = async (id: string) => {
  if (await useConfirm().confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
    try {
      await projectStore.deleteProject(id);
      useToast().success('Projet supprimé avec succès');
    } catch (error) {
      useToast().error('Erreur lors de la suppression');
    }
  }
};

// Utilitaires d'affichage
const getEquipeName = (id: string) => {
  const equipe = teamStore.teams.find(t => t.id === id);
  return equipe ? equipe.nom : 'Équipe inconnue';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};
</script>
