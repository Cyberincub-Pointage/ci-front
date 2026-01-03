<template>
   <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Formateurs', to: '/manage/formateurs' },
      { label: formateur?.prenom + ' ' + formateur?.nom || 'Détails' }
    ]" class="mb-6" />

  <div v-if="formateur" class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
    <!-- En-tête de profil -->
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 sticky top-24 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 supports-[backdrop-filter]:bg-white/60">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-white dark:ring-slate-800 overflow-hidden">
              <img v-if="formateur.photoUrl" :src="formateur.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else>{{ formateur.prenom[0] }}{{ formateur.nom[0] }}</span>
            </div>
            <!-- Indicateur de statut -->
            <div class="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1 rounded-full">
              <span class="block w-4 h-4 rounded-full" :class="{
                'bg-emerald-500 animate-pulse': formateur.status === 'active',
                'bg-rose-500': formateur.status === 'suspended',
                'bg-amber-500': formateur.status === 'pending'
              }">
              </span>
            </div>
          </div>

          <!-- Identité -->
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              {{ formateur.prenom }} {{ formateur.nom }}
              <IconCertificate v-if="formateur.role === 'formateur_principal'" class="w-5 h-5 text-indigo-500"
                title="Formateur Principal" />
              <span v-if="formateur.id === authStore.currentUser?.id && ['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || '')" class="badge badge-info ml-2 text-sm py-1 px-3">Vous</span>
            </h1>
            <div class="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1.5 break-all">
                <IconMail class="w-4 h-4 shrink-0" />
                {{ formateur.email }}
              </span>
              <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
              <span class="flex items-center gap-1.5">
                <IconPhone class="w-4 h-4 shrink-0" />
                {{ formateur.telephone || 'Non renseigné' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end" v-if="formateur.id !== authStore.currentUser?.id">
          <!-- Renvoyer invitation (En attente seulement) -->
          <button v-if="formateur.status === 'pending'" @click="resendInvite" :disabled="loading"
            class="btn w-full sm:w-auto btn-outline border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30">
            <IconMailForward class="w-4 h-4 mr-2" />
            Renvoyer l'invitation
          </button>

          <!-- Bascule de statut -->
          <button v-if="formateur.status !== 'pending'" @click="toggleStatus"
            class="btn w-full sm:w-auto bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
            :class="{ 'text-rose-600 hover:bg-rose-50 border-rose-200': formateur.status === 'active' }"
            :disabled="loading">
            <IconPower class="w-4 h-4 mr-2" />
            {{ formateur.status === 'active' ? 'Suspendre' : 'Activer' }}
          </button>

          <!-- Bouton d'alerte -->
          <button @click="openAlertModal"
            class="btn w-full sm:w-auto btn-outline border-yellow-200 hover:border-yellow-600 hover:bg-yellow-50 text-yellow-700 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/30">
            <IconAlertTriangle class="w-4 h-4 mr-2" />
            Alerter
          </button>
        </div>
      </div>
    </div>

    <!-- Modale d'alerte -->
    <AppModal v-model="showAlertModal" title="Envoyer une alerte" is-form @confirm="submitAlert"
      submit-label="Envoyer" submit-variant="primary" :form="alertForm" :loading="loading"
      :fields="[
        { name: 'formateurName', label: 'Destinataire', type: 'text', disabled: true, value: `${formateur.prenom} ${formateur.nom}` },
        { name: 'message', label: 'Message d\'alerte *', type: 'textarea', required: true, placeholder: 'Raison de l\'alerte...' }
      ]">
      <template #description>
        <p class="text-sm text-gray-500 mb-4">Envoyez une notification importante à ce formateur.</p>
      </template>
    </AppModal>

    <!-- Grille de contenu -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Gauche : Détails -->
      <div class="space-y-6">
        <!-- Carte d'info -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <IconUserScan class="w-5 h-5 text-indigo-500" />
            Détails du profil
          </h3>

          <div class="space-y-4">
            <div class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Spécialité</p>
              <div
                class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-lg group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 transition-colors">
                <IconBriefcase class="w-4 h-4 text-slate-400" />
                {{ formateur.specialite || '-' }}
              </div>
            </div>

            <div class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Date d'inscription</p>
              <div
                class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-lg group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 transition-colors">
                <IconCalendar class="w-4 h-4 text-slate-400" />
                {{ formatDate(formateur.createdAt) }}
              </div>
            </div>

            <div v-if="formateur.status === 'pending'" class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Token Invitation</p>
              <div
                class="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
                <p class="font-mono text-xs text-amber-700 dark:text-amber-400 break-all select-all">{{
                  formateur.invitationToken }}</p>
                <p class="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-1 flex items-center gap-1">
                  <IconClock class="w-3 h-3" />
                  Expire: {{ formatDate(formateur.invitationTokenExpiresAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestion des rôles -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <IconShieldLock class="w-5 h-5 text-indigo-500" />
            Accès & Rôle
          </h3>
          <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <IconKey class="w-4 h-4" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">Formateur Principal</p>
                <p class="text-xs text-slate-500">Droits de supervision</p>
              </div>
            </div>
            <button v-if="formateur.id !== authStore.currentUser?.id || !['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || '')" @click="togglePrincipalRole"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              :class="formateur.role === 'formateur_principal' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="formateur.role === 'formateur_principal' ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>
      </div>

      <!-- Droite : Équipes -->
      <div class="lg:col-span-2">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 min-h-full">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <IconUsersGroup class="w-5 h-5 text-indigo-500" />
              Équipes assignées
              <span
                class="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-bold">{{
                  formateur.equipes?.length || 0 }}</span>
            </h3>
          </div>

          <div v-if="formateur.equipes && formateur.equipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="equipe in formateur.equipes" :key="equipe.id"
              class="group p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/50">

              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold shadow-sm">
                    {{ equipe.nom[0] }}
                  </div>
                  <div>
                    <h4
                      class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {{ equipe.nom }}</h4>
                    <p class="text-xs text-slate-500">{{ equipe.code || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                {{ equipe.description || 'Aucune description disponible.' }}</p>

              <div class="mt-4 flex justify-end">
                <!-- Lien vers le détail de l'équipe -->
                <button
                  class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  Voir l'équipe
                  <IconArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div v-else
            class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
            <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <IconUsersGroup class="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Aucune équipe assignée</p>
            <p class="text-sm text-slate-400 max-w-xs mt-1">Ce formateur n'a pas encore été assigné à une équipe
              pédagogique.</p>
          </div>

        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 sticky top-24 z-10">
      <div class="flex flex-col md:flex-row gap-6">
        <AppSkeleton type="circle" width="80px" height="80px" />
        <div class="space-y-3 flex-1">
          <AppSkeleton width="200px" height="32px" />
          <div class="flex gap-3">
            <AppSkeleton width="150px" height="20px" />
            <AppSkeleton width="120px" height="20px" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
          <AppSkeleton width="60%" height="24px" class="mb-4" />
          <AppSkeleton width="100%" height="40px" />
          <AppSkeleton width="100%" height="40px" />
        </div>
      </div>
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <AppSkeleton width="40%" height="24px" class="mb-6" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppSkeleton height="160px" class="rounded-xl" />
            <AppSkeleton height="160px" class="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconMail, IconPhone, IconCertificate, IconMailForward, IconPower, IconUserScan, IconBriefcase, IconCalendar, IconClock, IconShieldLock, IconKey, IconUsersGroup, IconArrowRight, IconLoader, IconAlertTriangle, IconSend } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const managerStore = useManagerStore();
const authStore = useAuthStore();

const formateurId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id as string;
const formateur = ref<any>(null);

useHead({
  title: computed(() => formateur.value ? `${formateur.value.prenom} ${formateur.value.nom} - Formateur` : 'Détails formateur'),
  meta: [
    { 
      name: 'description', 
      content: "Détails du profil formateur, équipes assignées et spécialité." 
    }
  ]
});
const loading = ref(false);

const fetchData = async () => {
    loading.value = true;
    try {
      const data = await managerStore.fetchFormateur(formateurId);
      formateur.value = data;
    } catch (error) {
      console.error('Erreur chargement formateur:', error);
    } finally {
      loading.value = false;
    }
};

onMounted(() => {
  fetchData();
});

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const resendInvite = async () => {
  if (await useConfirm().confirm({
    message: `Renvoyer l'invitation à ${formateur.value.prenom} ?`,
    title: 'Renvoyer invitation',
    type: 'primary'
  })) {
    loading.value = true;
    const result = await managerStore.resendInvitation(formateurId);
    loading.value = false;

    if (result.success) {
      useToast().success(result.message);
      fetchData();
    } else {
      useToast().error(result.message);
    }
  }
};

const toggleStatus = async () => {
  if (!formateur.value) return;
  const action = formateur.value.status === 'active' ? 'suspendre' : 'réactiver';

  if (await useConfirm().confirm({
    message: `Êtes-vous sûr de vouloir ${action} ce formateur ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} formateur`,
    type: formateur.value.status === 'active' ? 'danger' : 'primary'
  })) {
    loading.value = true;
    const result = await managerStore.toggleFormStatus(formateurId, formateur.value.status);
    loading.value = false;

    if (result.success) {
      useToast().success(result.message);
      fetchData();
    } else {
      useToast().error(result.message);
    }
  }
};

const togglePrincipalRole = async () => {
  const newRole = formateur.value.role === 'formateur' ? 'formateur_principal' : 'formateur';
  const action = newRole === 'formateur_principal' ? 'promouvoir' : 'rétrograder';

  if (await useConfirm().confirm({
    message: `Voulez-vous ${action} ce formateur ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} formateur`,
    type: 'primary'
  })) {
    loading.value = true;
    const result = await managerStore.updateFormRole(formateurId, newRole as any);
    loading.value = false;

    if (result.success) {
      useToast().success('Rôle mis à jour avec succès');
      fetchData();
    } else {
      useToast().error(result.message);
    }
  }
};

const showAlertModal = ref(false);
const alertForm = ref({ message: '' });

const openAlertModal = () => {
  alertForm.value.message = '';
  (alertForm.value as any).formateurName = `${formateur.value.prenom} ${formateur.value.nom}`;
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
};

const submitAlert = async () => {
  if (!alertForm.value.message) return;
  
  loading.value = true;
  const result = await managerStore.sendFormAlert(formateurId, alertForm.value.message);
  loading.value = false;

  if (result.success) {
    useToast().success('Alerte envoyée avec succès');
    closeAlertModal();
  } else {
    useToast().error(result.message);
  }
};
</script>
