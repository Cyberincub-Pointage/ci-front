<template>
  <div>
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Entités', to: '/manage/entities' },
      { label: 'Équipes' }
    ]" class="mb-6" />

    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Gestion des équipes</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Créer et modifier les équipes</p>
      </div>
      <button v-if="isAdmin" @click="openModal()" class="btn btn-primary w-full md:w-auto justify-center">
        <IconPlus class="w-5 h-5 mr-2" />
        Nouvelle Équipe
      </button>
    </div>

    <div v-if="teamStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card h-48 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <AppSkeleton type="rect" width="48px" height="48px" class="rounded-lg" />
          <div class="flex gap-2">
            <AppSkeleton type="circle" width="32px" height="32px" />
            <AppSkeleton type="circle" width="32px" height="32px" />
            <AppSkeleton type="circle" width="32px" height="32px" />
          </div>
        </div>
        <div>
          <AppSkeleton type="text" width="60%" height="24px" class="mb-3" />
          <AppSkeleton type="text" width="90%" height="16px" />
        </div>
        <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
          <AppSkeleton type="text" width="40%" height="14px" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="equipe in teamStore.teams" :key="equipe.id" class="card hover:shadow-md transition-all">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <IconUsersGroup class="w-6 h-6" />
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/manage/entities/equipes/${equipe.id}`" class="btn btn-ghost p-1 text-primary-600">
              <IconEye class="w-5 h-5" />
            </NuxtLink>
            <button v-if="isAdmin" @click="openModal(equipe)" class="btn btn-ghost p-1 text-blue-600">
              <IconEdit class="w-5 h-5" />
            </button>
            <button v-if="isAdmin" @click="deleteEquipe(equipe.id)" class="btn btn-ghost p-1 text-red-600">
              <IconTrash class="w-5 h-5" />
            </button>
          </div>
        </div>

        <h3 class="text-lg font-bold mb-2">{{ equipe.nom }}</h3>
        <p class="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{{ equipe.description }}</p>

        <div class="flex items-center text-sm text-[var(--color-text-secondary)] border-t pt-3">
          <IconCalendar class="w-4 h-4 mr-2" />
          Créée le {{ formatDate(equipe.createdAt) }}
        </div>
      </div>
    </div>

    <div v-if="!teamStore.loading && teamStore.teams.length === 0" class="text-center py-12 text-gray-500">
      Aucune équipe trouvée.
    </div>

    <!-- Modale -->
    <AppModal v-model="showModal" :title="isEditing ? 'Modifier Équipe' : 'Nouvelle Équipe'" is-form @confirm="saveEquipe"
      :loading="isSubmitting" :submit-label="isEditing ? 'Enregistrer' : 'Créer'" :form="form" :fields="[
        { name: 'nom', label: 'Nom de l\'équipe', type: 'text', required: true, icon: IconUsersGroup },
        { name: 'description', label: 'Description', type: 'textarea', icon: IconBook }
      ]" />
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconUsersGroup, IconBook, IconEdit, IconTrash, IconCalendar, IconEye, IconLoader } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.hasRole(ROLE_GROUPS.GAdmin_Role));

useHead({
  title: 'Gestion des équipes',
  meta: [
    { 
      name: 'description', 
      content: "Créez et modifiez les équipes d'incubation, et assignez des formateurs responsables." 
    }
  ]
});

const teamStore = useTeamStore();

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const form = ref({
  nom: '',
  description: '',
  formateurId: 'form-001'
}); // A IMPLEMENTER

onMounted(async () => {
  await teamStore.fetchTeams();
});

const isSubmitting = ref(false);

const openModal = (equipe?: any) => {
  if (equipe) {
    isEditing.value = true;
    editingId.value = equipe.id;
    form.value = { nom: equipe.nom, description: equipe.description, formateurId: equipe.formateurId };
  } else {
    isEditing.value = false;
    editingId.value = '';
    form.value = { nom: '', description: '', formateurId: 'form-001' };
  }
  showModal.value = true;
};

const saveEquipe = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await teamStore.updateTeam(editingId.value, form.value);
      useToast().success('Équipe modifiée avec succès');
    } else {
      await teamStore.createTeam(form.value);
      useToast().success('Équipe créée avec succès');
    }
    showModal.value = false;
  } catch (error) {
    useToast().error('Erreur lors de l\'enregistrement');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteEquipe = async (id: string) => {
  if (await useConfirm().confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
    try {
      await teamStore.deleteTeam(id);
      useToast().success('Équipe supprimée avec succès');
    } catch (error) {
      useToast().error('Erreur lors de la suppression');
    }
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};
</script>
