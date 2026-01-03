<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
          Mon Compte
        </h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Gérez vos informations personnelles et votre sécurité</p>
      </div>
      <div
        class="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-2 rounded-full shadow-sm border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
        <IconUserCircle class="w-4 h-4" />
        <span>{{ (user as any)?.role === 'formateur_principal' ? 'Formateur Principal' : 'Formateur' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Colonne Gauche : Identité & Statut -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Carte d'identité -->
        <div class="card p-6 text-center border-t-4 border-t-emerald-500 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <IconId class="w-40 h-40" />
          </div>

          <div class="relative z-10 transition-all duration-300">
            <div
              class="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-1 mb-4 shadow-xl relative group">
              <div v-if="user?.photoUrl"
                class="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                <img :src="user.photoUrl" class="w-full h-full object-cover" alt="Profile" />
              </div>
              <div v-else
                class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <span
                  class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                  {{ userInitials }}
                </span>
              </div>
              
              <!-- Bouton pour changer la photo -->
              <button @click="openPhotoModal" 
                class="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Modifier la photo">
                 <IconCamera class="w-4 h-4" />
              </button>

              <!-- Bouton de suppression de photo -->
              <button v-if="user?.photoUrl" @click="deletePhoto" 
                class="absolute bottom-0 left-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-red-500 hover:text-red-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Supprimer la photo">
                 <IconTrash class="w-4 h-4" />
              </button>
            </div>

            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ user?.prenom }} {{ user?.nom }}</h2>
            <p class="text-[var(--color-text-secondary)] font-medium mb-4">{{ user?.email }}</p>

            <div class="flex flex-wrap justify-center gap-2 mb-6">
              <span
                class="badge badge-success text-emerald-800 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">Formateur</span>
              <span v-if="user?.specialite"
                class="badge badge-outline border-gray-200 text-gray-600 dark:text-gray-400">{{ user.specialite
                }}</span>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                <p class="text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1 font-semibold">
                  Équipes</p>
                <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ user?.equipes?.length || 0 }}
                </p>
              </div>
              <div class="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                <p class="text-xs text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1 font-semibold">
                  Statut</p>
                <p class="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize">{{ user?.status || 'Active' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Carte des équipes -->
        <div
          class="card p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900/50 border-none">
          <h3 class="font-bold flex items-center gap-2 mb-4">
            <IconUsersGroup class="w-5 h-5 text-indigo-500" />
            Équipes Assignées
          </h3>
          <div v-if="user?.equipes?.length" class="space-y-3">
            <div v-for="team in user.equipes" :key="team.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <div
                class="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase">
                {{ team.nom.substring(0, 2) }}
              </div>
              <div>
                <p class="font-medium text-sm text-gray-900 dark:text-white">{{ team.nom }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-sm text-[var(--color-text-secondary)] italic">Aucune équipe assignée</p>
          </div>
        </div>
      </div>

      <!-- Colonne Droite : Formulaires de configuration -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Informations générales -->
        <div class="card overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconId class="w-5 h-5 text-emerald-500" />
              Informations Personnelles
            </h3>
            <button @click="openProfileModal"
              class="btn btn-sm btn-ghost hover:bg-white dark:hover:bg-gray-700 text-emerald-600 shadow-none hover:shadow-sm transition-all">
              <IconEdit class="w-4 h-4 mr-1.5" />
              Modifier
            </button>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Prénom -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Prénom</label>
                <div
                  class="text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  {{ user?.prenom }}
                </div>
              </div>

              <!-- Nom -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Nom</label>
                <div
                  class="text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  {{ user?.nom }}
                </div>
              </div>

              <!-- Téléphone -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Téléphone</label>
                <div
                  class="flex items-center text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconPhone class="w-4 h-4 text-gray-400 mr-2" />
                  {{ user?.telephone || 'Non renseigné' }}
                </div>
              </div>

              <!-- Spécialité -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Spécialité</label>
                <div
                  class="flex items-center text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconBriefcase class="w-4 h-4 text-gray-400 mr-2" />
                  {{ user?.specialite || 'Non renseignée' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="card overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconLock class="w-5 h-5 text-red-500" />
              Sécurité & Connexion
            </h3>
          </div>
          <div class="p-6">
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800/50 transition-colors">
              <div class="flex items-start gap-4 mb-4 sm:mb-0">
                <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                  <IconKey class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">Mot de passe</h4>
                  <p class="text-sm text-[var(--color-text-secondary)]">Pour protéger votre compte, utilisez un mot de
                    passe fort.</p>
                </div>
              </div>
              <button @click="openPasswordModal"
                class="btn btn-outline border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:border-gray-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 w-full sm:w-auto">
                Modifier le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition de profil -->
    <AppModal v-model="showProfileModal" title="Modifier mes informations" is-form @confirm="saveProfile"
      :loading="isSubmitting" submit-label="Enregistrer les modifications" submit-variant="success" :form="profileForm"
      :grid-cols="2" :fields="[
        { name: 'prenom', label: 'Prénom', type: 'text', required: true },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '+229...', fullWidth: true },
        { name: 'specialite', label: 'Spécialité', type: 'text', placeholder: 'Ex: Développement Web', fullWidth: true }
      ]" />

    <!-- Modal photo -->
    <AppModal v-model="showPhotoModal" title="Modifier ma photo" is-form @confirm="savePhoto"
      :loading="isSubmitting" submit-label="Enregistrer" submit-variant="primary"
      :form="photoForm" :fields="[
        { name: 'photoUrl', label: 'URL de la photo', type: 'url', required: false, placeholder: 'https://...', fullWidth: true, icon: IconCamera }
      ]" />

    <!-- Modal mot de passe -->
    <AppModal v-model="showPasswordModal" title="Modifier le mot de passe" is-form @confirm="savePassword"
      :loading="passwordLoading" submit-label="Modifier le mot de passe" submit-variant="danger"
      :disabled="!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
      description="Pour votre sécurité, vous serez déconnecté après la modification." description-type="danger"
      :form="passwordForm" :fields="[
        { name: 'currentPassword', label: 'Mot de passe actuel', type: 'password', required: true, icon: IconLock },
        { name: 'newPassword', label: 'Nouveau mot de passe', type: 'password', required: true, minlength: 8, icon: IconKey },
        { name: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', required: true, icon: IconKey, error: (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) ? 'Les mots de passe ne correspondent pas' : '' }
      ]" />

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import {
  IconEdit, IconUserCircle, IconId, IconCamera, IconTrash,
  IconPhone, IconBriefcase, IconLock, IconKey, IconUsersGroup
} from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Mon compte formateur',
  meta: [
    { 
      name: 'description', 
      content: "Gérez vos informations personnelles et votre sécurité." 
    }
  ]
});

const authStore = useAuthStore();
const toast = useToast();

const user = computed(() => authStore.currentUser as any);

// État local
const showProfileModal = ref(false);
const showPhotoModal = ref(false);
const showPasswordModal = ref(false);
const isSubmitting = ref(false);
const passwordLoading = ref(false);
const showPassword = ref(false);

const profileForm = ref({
  nom: '',
  prenom: '',
  telephone: '',
  specialite: ''
});

const photoForm = ref({
  photoUrl: ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Cycle de vie
onMounted(() => {
  authStore.fetchProfile();
});

// Propriétés calculées
const userInitials = computed(() => {
  if (!user.value) return 'U';
  return `${user.value.prenom?.[0] || ''}${user.value.nom?.[0] || ''}`.toUpperCase();
});

// Actions
const openProfileModal = () => {
  if (!user.value) return;
  profileForm.value = {
    nom: user.value.nom || '',
    prenom: user.value.prenom || '',
    telephone: user.value.telephone || '',
    specialite: user.value.specialite || ''
  };
  showProfileModal.value = true;
};

const openPhotoModal = () => {
  if (!user.value) return;
  photoForm.value = {
    photoUrl: user.value.photoUrl || ''
  };
  showPhotoModal.value = true;
};

const openPasswordModal = () => {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  showPassword.value = false;
  showPasswordModal.value = true;
};

// Enregistre les modifications du profil
const saveProfile = async () => {
  isSubmitting.value = true;
  try {
    const result = await authStore.updateProfile(profileForm.value);
    if (result.success) {
      toast.success('Profil mis à jour avec succès');
      showProfileModal.value = false;
    } else {
       toast.error(result.message);
    }
  } catch (error: any) {
    toast.error('Erreur lors de la mise à jour');
  } finally {
    isSubmitting.value = false;
  }
};

// Met à jour la photo de profil
const savePhoto = async () => {
  isSubmitting.value = true;
  try {
    const result = await authStore.updateProfile({ photoUrl: photoForm.value.photoUrl });
    if (result.success) {
      showPhotoModal.value = false;
      toast.success('Photo de profil mise à jour');
    } else {
      toast.error(result.message);
    }
  } catch (e) {
    toast.error('Erreur lors de la mise à jour de la photo');
  } finally {
    isSubmitting.value = false;
  }
};

// Supprime la photo de profil après confirmation
const deletePhoto = async () => {
    const { confirm } = useConfirm();
    const confirmed = await confirm({
        title: 'Supprimer la photo',
        message: 'Voulez-vous vraiment supprimer votre photo de profil ?',
        type: 'danger',
        confirmLabel: 'Supprimer',
        cancelLabel: 'Annuler'
    });

    if (confirmed) {
         photoForm.value.photoUrl = '';
         await savePhoto();
    }
};

// Change le mot de passe
const savePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) return;

  passwordLoading.value = true;
  try {
    const result = await authStore.updatePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword);
    if (result.success) {
      toast.success('Mot de passe mis à jour. Veuillez vous reconnecter.');
      showPasswordModal.value = false;
      await authStore.logout();
      navigateTo('/auth/login');
    } else {
       toast.error(result.message);
    }
  } catch (error: any) {
    toast.error('Erreur lors de la modification');
  } finally {
    passwordLoading.value = false;
  }
};
</script>
