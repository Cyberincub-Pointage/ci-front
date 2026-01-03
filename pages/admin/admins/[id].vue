<template>
  <div v-if="admin" class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Administrateurs', to: '/admin/admins' },
      { label: admin.prenom + ' ' + admin.nom || 'Détails' }
    ]" class="mb-6" />

    <!-- En-tête de profil -->
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 sticky top-24 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 supports-[backdrop-filter]:bg-white/60">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-white dark:ring-slate-800 overflow-hidden">
              <img v-if="admin.photoUrl" :src="admin.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else>{{ admin.prenom[0] }}{{ admin.nom[0] }}</span>
            </div>
            <div class="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1 rounded-full">
              <span class="block w-4 h-4 rounded-full" :class="{
                'bg-emerald-500 animate-pulse': admin.status === 'active',
                'bg-rose-500': admin.status === 'suspended',
                'bg-amber-500': admin.status === 'pending'
              }">
              </span>
            </div>
          </div>

          <!-- Identité -->
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              {{ admin.prenom }} {{ admin.nom }}
              <IconCertificate v-if="admin.role === 'super_admin'" class="w-5 h-5 text-indigo-500"
                title="Super Admin" />
              <span v-if="admin.id === authStore.currentUser?.id" class="badge badge-info ml-2 text-sm py-1 px-3">Vous</span>
            </h1>
            <div class="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1.5 break-all">
                <IconMail class="w-4 h-4 shrink-0" />
                {{ admin.email }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end" v-if="isSuperAdmin && admin.id !== authStore.currentUser?.id">
          <!-- Renvoyer invitation (En attente seulement) -->
          <button v-if="admin.status === 'pending'" @click="resendInvite" :disabled="loading"
            class="btn w-full sm:w-auto btn-outline border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30">
            <IconMailForward class="w-4 h-4 mr-2" />
            Renvoyer l'invitation
          </button>

          <!-- Bascule de statut -->
          <button v-if="admin.status !== 'pending'" @click="toggleStatus"
            class="btn w-full sm:w-auto bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
            :class="{ 'text-rose-600 hover:bg-rose-50 border-rose-200': admin.status === 'active' }"
            :disabled="loading">
            <IconPower class="w-4 h-4 mr-2" />
            {{ admin.status === 'active' ? 'Suspendre' : 'Activer' }}
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
        { name: 'adminName', label: 'Destinataire', type: 'text', disabled: true, value: `${admin.prenom} ${admin.nom}` },
        { name: 'message', label: 'Message d\'alerte *', type: 'textarea', required: true, placeholder: 'Raison de l\'alerte...' }
      ]">
      <template #description>
        <p class="text-sm text-gray-500 mb-4">Envoyez une notification importante à cet administrateur.</p>
      </template>
    </AppModal>

    <!-- Grille de contenu -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Colonne Gauche -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Carte Permissions -->
        <div class="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-lg">
          <h3 class="font-bold flex items-center gap-2 mb-4">
            <IconKey class="w-5 h-5 text-yellow-400" />
            Permissions système
          </h3>
          <ul class="space-y-3 text-sm text-slate-300">
            <li class="flex items-start gap-3">
              <div class="mt-0.5 p-0.5 rounded-full bg-green-500/20 text-green-400">
                <IconCheck class="w-3 h-3" />
              </div>
              <span>Gestion des utilisateurs (Incubés, Formateurs)</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 p-0.5 rounded-full bg-green-500/20 text-green-400">
                <IconCheck class="w-3 h-3" />
              </div>
              <span>Validation des présences et paiements</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 p-0.5 rounded-full bg-green-500/20 text-green-400">
                <IconCheck class="w-3 h-3" />
              </div>
              <span>Configuration globale</span>
            </li>
            <li v-if="admin.role === 'super_admin'" class="flex items-start gap-3">
              <div class="mt-0.5 p-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                <IconCheck class="w-3 h-3" />
              </div>
              <span class="text-yellow-100 font-medium">Gestion des administrateurs</span>
            </li>
          </ul>
        </div>

        <!-- Carte Métadonnées -->
        <div class="card p-6">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <IconActivity class="w-5 h-5 text-indigo-500" />
            Activité & Statut
          </h3>
          
          <div class="space-y-4">
            <div class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Date d'inscription</p>
              <div class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <IconCalendar class="w-4 h-4 text-slate-400" />
                {{ formatDate(admin.createdAt) }}
              </div>
            </div>

            <div v-if="admin.status === 'pending'" class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Token Invitation</p>
              <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
                <p class="font-mono text-xs text-amber-700 dark:text-amber-400 break-all select-all">
                  {{ admin.invitationToken }}
                </p>
                <p class="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-1 flex items-center gap-1">
                  <IconClock class="w-3 h-3" />
                  Expire: {{ formatDate(admin.invitationTokenExpiresAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Droite -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Informations Générales -->
        <div class="card overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[var(--color-bg-secondary)] flex justify-between items-center">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconId class="w-5 h-5 text-blue-500" />
              Informations Personnelles
            </h3>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Prénom -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Prénom</label>
                <div class="text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  {{ admin.prenom }}
                </div>
              </div>

              <!-- Nom -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Nom</label>
                <div class="text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  {{ admin.nom }}
                </div>
              </div>

              <!-- Téléphone -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Téléphone</label>
                <div class="flex items-center text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconPhone class="w-4 h-4 text-gray-400 mr-2" />
                  {{ admin.telephone || 'Non renseigné' }}
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Email</label>
                <div class="flex items-center text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconMail class="w-4 h-4 text-gray-400 mr-2" />
                  {{ admin.email }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestion des Rôles (Super Admin) -->
        <div v-if="isSuperAdmin" class="card overflow-hidden border-indigo-100 dark:border-indigo-900/30">
           <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10">
            <h3 class="font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <IconShieldLock class="w-5 h-5 text-indigo-500" />
              Administration du Rôle
            </h3>
          </div>
          <div class="p-6">
             <div class="flex items-center justify-between p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 bg-white dark:bg-transparent">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    <IconCertificate class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white">Privilèges Super Admin</p>
                    <p class="text-sm text-slate-500">Accès complet à la gestion des administrateurs et configurations sensibles.</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                   <span class="text-sm font-medium" :class="admin.role === 'super_admin' ? 'text-indigo-600' : 'text-slate-400'">
                      {{ admin.role === 'super_admin' ? 'Activé' : 'Désactivé' }}
                   </span>
                   <button v-if="admin.id !== authStore.currentUser?.id" @click="toggleSuperAdminRole"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    :class="admin.role === 'super_admin' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                      :class="admin.role === 'super_admin' ? 'translate-x-6' : 'translate-x-1'" />
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
    <!-- Header Skeleton -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 sticky top-24 z-10">
      <div class="flex flex-col md:flex-row gap-6">
        <AppSkeleton type="circle" width="80px" height="80px" />
        <div class="space-y-3 flex-1">
          <AppSkeleton width="200px" height="32px" />
          <div class="flex gap-3">
            <AppSkeleton width="150px" height="20px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Grid Skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-4 space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-48">
          <AppSkeleton width="70%" height="24px" class="mb-4" />
          <div class="space-y-3">
             <AppSkeleton width="100%" height="20px" />
             <AppSkeleton width="100%" height="20px" />
             <AppSkeleton width="80%" height="20px" />
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 h-40">
           <AppSkeleton width="60%" height="24px" class="mb-4" />
           <AppSkeleton width="100%" height="40px" />
        </div>
      </div>

      <!-- Right Column -->
      <div class="lg:col-span-8 space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <AppSkeleton width="50%" height="24px" class="mb-6" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
               <AppSkeleton width="30%" height="16px" />
               <AppSkeleton width="100%" height="40px" />
            </div>
            <div class="space-y-2">
               <AppSkeleton width="30%" height="16px" />
               <AppSkeleton width="100%" height="40px" />
            </div>
            <div class="space-y-2">
               <AppSkeleton width="30%" height="16px" />
               <AppSkeleton width="100%" height="40px" />
            </div>
            <div class="space-y-2">
               <AppSkeleton width="30%" height="16px" />
               <AppSkeleton width="100%" height="40px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconMail, IconCertificate, IconMailForward, IconPower, IconCalendar, IconClock, IconShieldLock, IconKey, IconLoader, IconAlertTriangle, IconActivity, IconCheck, IconId, IconPhone } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const api = useAPI();
const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

// Super admin
const isSuperAdmin = computed(() => authStore.currentUser?.role === 'super_admin');

// ID depuis l'URL
const adminId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id as string;
const admin = ref<any>(null);

useHead({
  title: computed(() => admin.value ? `${admin.value.prenom} ${admin.value.nom} - Administrateur` : 'Détails administrateur'),
  meta: [
    { 
      name: 'description', 
      content: "Consultez et gérez le profil détaillé de l'administrateur. Permissions, activité et informations de contact." 
    }
  ]
});
const loading = ref(false);

// Chargement des données de l'administrateur
const fetchData = async () => {
  try {
    const data = await api(`/admin/admins/${adminId}`);
    admin.value = data;
  } catch (error) {
    // Gestion d'erreur et redirection si introuvable
    console.error('Erreur chargement admin:', error);
    toast.error("Impossible de charger l'administrateur");
    navigateTo('/admin/admins');
  }
};

onMounted(() => {
  fetchData();
});

// Formatage de la date
const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Renvoyer l'invitation
const resendInvite = async () => {
  if (await confirm.confirm({
    message: `Renvoyer l'invitation à ${admin.value.prenom} ?`,
    title: 'Renvoyer invitation',
    type: 'primary'
  })) {
    loading.value = true;
    try {
        await api(`/admin/resend-admin-invite/${adminId}`, { method: 'POST' });
        toast.success("Invitation renvoyée avec succès");
    } catch (e: any) {
        toast.error(e.message || "Erreur lors de l'envoi");
    }
    loading.value = false;
  }
};

// Activer ou suspendre un administrateur
const toggleStatus = async () => {
  if (!admin.value) return;
  const action = admin.value.status === 'active' ? 'suspendre' : 'réactiver';
  const newStatus = admin.value.status === 'active' ? 'suspended' : 'active';

  if (await confirm.confirm({
    message: `Êtes-vous sûr de vouloir ${action} cet administrateur ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} administrateur`,
    type: admin.value.status === 'active' ? 'danger' : 'primary'
  })) {
    loading.value = true;
    try {
      await api(`/admin/update-admin-status/${adminId}`, { 
          method: 'PATCH',
          body: { status: newStatus }
      });
      toast.success(`Statut mis à jour : ${newStatus}`);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour du statut");
    }
    loading.value = false;
  }
};

// Promouvoir ou rétrograder (Super Admin)
const toggleSuperAdminRole = async () => {
  const newRole = admin.value.role === 'admin' ? 'super_admin' : 'admin';
  const action = newRole === 'super_admin' ? 'promouvoir' : 'rétrograder';

  if (await confirm.confirm({
    message: `Voulez-vous ${action} cet administrateur ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} administrateur`,
    type: 'primary'
  })) {
    loading.value = true;
     try {
      await api(`/admin/update-admin-role/${adminId}`, { 
          method: 'PATCH',
          body: { role: newRole }
      });
      toast.success('Rôle mis à jour avec succès');
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour du rôle");
    }
    loading.value = false;
  }
};

const showAlertModal = ref(false);
const alertForm = ref({ message: '' });

const openAlertModal = () => {
  alertForm.value.message = '';
  (alertForm.value as any).adminName = `${admin.value.prenom} ${admin.value.nom}`;
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
};

// Envoyer une alerte à l'administrateur
const submitAlert = async () => {
  if (!alertForm.value.message) return;
  
  loading.value = true;
  try {
     await api(`/admin/admin/${adminId}/alert`, {
        method: 'POST',
        body: { message: alertForm.value.message }
     });
     toast.success('Alerte envoyée avec succès');
     closeAlertModal();
  } catch (e: any) {
     toast.error(e.message || "Erreur lors de l'envoi de l'alerte");
  }
  loading.value = false;
};
</script>
