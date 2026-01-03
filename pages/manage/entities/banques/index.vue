<template>
  <div>
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Entités', to: '/manage/entities' },
      { label: 'Banques' }
    ]" class="mb-6" />

    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Gestion des banques</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Partenaires bancaires</p>
      </div>
      <button v-if="isAdmin" @click="openModal()" class="btn btn-primary w-full md:w-auto justify-center">
        <IconPlus class="w-5 h-5 mr-2" />
        Nouvelle Banque
      </button>
    </div>

    <div v-if="bankStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <AppSkeleton type="text" width="70%" height="24px" class="mb-3" />
          <AppSkeleton type="text" width="40%" height="16px" />
        </div>
        <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
          <AppSkeleton type="text" width="50%" height="14px" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="banque in bankStore.banks" :key="banque.id" class="card hover:shadow-md transition-all">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <IconBuildingBank class="w-6 h-6" />
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/manage/entities/banques/${banque.id}`" class="btn btn-ghost p-1 text-primary-600">
              <IconEye class="w-5 h-5" />
            </NuxtLink>
            <button v-if="isAdmin" @click="openModal(banque)" class="btn btn-ghost p-1 text-blue-600">
              <IconEdit class="w-5 h-5" />
            </button>
            <button v-if="isAdmin" @click="deleteBanque(banque.id)" class="btn btn-ghost p-1 text-red-600">
              <IconTrash class="w-5 h-5" />
            </button>
          </div>
        </div>

        <h3 class="text-lg font-bold mb-2">{{ banque.nom }}</h3>
        <div class="flex items-center text-sm text-[var(--color-text-secondary)] mb-1">
          <IconCode class="w-4 h-4 mr-2" />
          Code: {{ banque.code }}
        </div>

        <div class="flex items-center text-sm text-[var(--color-text-secondary)] border-t pt-3 mt-3">
          <IconCalendar class="w-4 h-4 mr-2" />
          Ajoutée le {{ formatDate(banque.createdAt) }}
        </div>
      </div>
    </div>

    <div v-if="!bankStore.loading && bankStore.banks.length === 0" class="text-center py-12 text-gray-500">
      Aucune banque trouvée.
    </div>

    <!-- Modale -->
    <AppModal v-model="showModal" :title="isEditing ? 'Modifier Banque' : 'Nouvelle Banque'" is-form @confirm="saveBanque"
      :loading="isSubmitting" :submit-label="isEditing ? 'Enregistrer' : 'Créer'" :form="form" :fields="[
        { name: 'nom', label: 'Nom de la banque', type: 'text', required: true, icon: IconBuildingBank },
        { name: 'code', label: 'Code Banque', type: 'text', required: true, icon: IconCode }
      ]" />
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconBuildingBank, IconEdit, IconTrash, IconCalendar, IconCode, IconEye } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.hasRole(ROLE_GROUPS.GAdmin_Role));

useHead({
  title: 'Gestion des banques',
  meta: [
    { 
      name: 'description', 
      content: "Gérez les banques partenaires et leurs codes associés pour les paiements des incubés." 
    }
  ]
});

const bankStore = useBankStore();

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const form = ref({
  nom: '',
  code: ''
});

onMounted(async () => {
  await bankStore.fetchBanks();
});

const isSubmitting = ref(false);

const openModal = (banque?: any) => {
  if (banque) {
    isEditing.value = true;
    editingId.value = banque.id;
    form.value = { nom: banque.nom, code: banque.code };
  } else {
    isEditing.value = false;
    editingId.value = '';
    form.value = { nom: '', code: '' };
  }
  showModal.value = true;
};

const saveBanque = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await bankStore.updateBank(editingId.value, form.value);
      useToast().success('Banque modifiée avec succès');
    } else {
      await bankStore.createBank(form.value);
      useToast().success('Banque créée avec succès');
    }
    showModal.value = false;
  } catch (error) {
    useToast().error('Erreur lors de l\'enregistrement');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteBanque = async (id: string) => {
  if (await useConfirm().confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) {
    try {
      await bankStore.deleteBank(id);
      useToast().success('Banque supprimée avec succès');
    } catch (error) {
      useToast().error('Erreur lors de la suppression');
    }
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};
</script>
