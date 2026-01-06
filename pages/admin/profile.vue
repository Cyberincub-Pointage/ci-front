<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Mon Compte
        </h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Administration et paramètres de sécurité</p>
      </div>
      <div
        class="text-sm text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
        <IconShieldCheck class="w-4 h-4" />
        <span>{{ (user as any)?.role === 'super_admin' ? 'Super Administrateur' : 'Administrateur' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Colonne de gauche : Identité & Statut -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Carte d'identité -->
        <div class="card p-6 text-center border-t-4 border-t-blue-500 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <IconUserShield class="w-40 h-40" />
          </div>

          <div class="relative z-10">
            <div
              class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mb-4 shadow-xl group relative">
              <div v-if="user?.photoUrl" class="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                <img :src="user.photoUrl" class="w-full h-full object-cover" alt="Profile" />
              </div>
              <div v-else
                class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <span class="text-4xl font-bold text-gray-400">{{ userInitials }}</span>
              </div>

              <!-- Bouton icône appareil photo -->
              <button @click="openPhotoModal"
                class="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Modifier la photo">
                <IconCamera class="w-4 h-4" />
              </button>

              <!-- Bouton icône suppression -->
              <button v-if="user?.photoUrl" @click="deletePhoto"
                class="absolute bottom-0 left-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-red-500 hover:text-red-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Supprimer la photo">
                <IconTrash class="w-4 h-4" />
              </button>
            </div>

            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ user?.prenom }} {{ user?.nom }}</h2>
            <p class="text-[var(--color-text-secondary)] font-medium mb-4">{{ user?.email }}</p>

            <div
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mb-6">
              <span class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Compte Actif
            </div>

            <div class="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="text-center">
                <p class="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Dernière connexion
                </p>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Aujourd'hui</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Membres gérés</p>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Global</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Carte des permissions -->
        <div class="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
          <h3 class="font-bold flex items-center gap-2 mb-3">
            <IconKey class="w-5 h-5 text-yellow-400" />
            Vos Permissions
          </h3>
          <ul class="space-y-2 text-sm text-slate-300">
            <li class="flex items-start gap-2">
              <IconCheck class="w-4 h-4 text-green-400 mt-0.5" />
              <span>Gestion des utilisateurs (Incubés, Formateurs)</span>
            </li>
            <li class="flex items-start gap-2">
              <IconCheck class="w-4 h-4 text-green-400 mt-0.5" />
              <span>Validation des présences et paiements</span>
            </li>
            <li class="flex items-start gap-2">
              <IconCheck class="w-4 h-4 text-green-400 mt-0.5" />
              <span>Configuration globale de la plateforme</span>
            </li>
            <li v-if="(user as any)?.role === 'super_admin'" class="flex items-start gap-2">
              <IconCheck class="w-4 h-4 text-yellow-400 mt-0.5" />
              <span class="text-yellow-100">Gestion des administrateurs</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Colonne de droite : Formulaires de paramètres -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Informations générales -->
        <div class="card overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconId class="w-5 h-5 text-blue-500" />
              Informations Générales
            </h3>

            <button @click="openProfileModal"
              class="btn btn-sm btn-ghost hover:bg-white dark:hover:bg-gray-700 text-blue-600 shadow-none hover:shadow-sm transition-all">
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
                  class="text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent transition-all">
                  {{ user?.prenom }}
                </div>
              </div>

              <!-- Nom -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Nom</label>
                <div
                  class="text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent transition-all">
                  {{ user?.nom }}
                </div>
              </div>

              <!-- Téléphone -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Téléphone</label>
                <div
                  class="flex items-center text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconPhone class="w-4 h-4 text-gray-400 mr-2" />
                  {{ user?.telephone || 'Non renseigné' }}
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-1.5">
                <div class="flex justify-between items-center mb-1">
                  <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Adresse
                    Email</label>
                  <button @click="openEmailModal" class="text-xs text-blue-600 hover:underline font-medium">Modifier
                    l'email</button>
                </div>

                <div
                  class="flex items-center text-gray-900 dark:text-white font-medium p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconMail class="w-4 h-4 text-gray-400 mr-2.5" />
                  {{ user?.email }}
                  <span
                    class="ml-auto text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Vérifié</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="card overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconLock class="w-5 h-5 text-emerald-500" />
              Sécurité & Authentification
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <!-- Ligne Mot de passe -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors bg-white dark:bg-transparent">
              <div class="flex items-start gap-4 mb-4 sm:mb-0">
                <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                  <IconPassword class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">Mot de passe</h4>
                  <p class="text-sm text-[var(--color-text-secondary)]">Dernière modification : Inconnue</p>
                </div>
              </div>
              <button @click="openPasswordModal"
                class="btn btn-outline border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:border-gray-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300 w-full sm:w-auto">
                Modifier le mot de passe
              </button>
            </div>

            <!-- Ligne 2FA -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20 opacity-75">
              <div class="flex items-start gap-4 mb-4 sm:mb-0">
                <div class="p-3 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg">
                  <IconDeviceMobile class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">Authentification à deux facteurs</h4>
                  <p class="text-sm text-[var(--color-text-secondary)]">Ajoutez une couche de sécurité supplémentaire
                    (Bientôt
                    disponible)</p>
                </div>
              </div>
              <div class="flex items-center">
                <span class="badge badge-outline text-gray-400 border-gray-200">Bientôt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal modification informations générales -->
    <AppModal v-model="showProfileModal" title="Modifier mes informations" is-form @confirm="saveProfile"
      :loading="isSubmitting" submit-label="Enregistrer les modifications" :form="profileForm" :grid-cols="2" :fields="[
        { name: 'prenom', label: 'Prénom', type: 'text', required: true },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '+229...', fullWidth: true }
      ]" />

    <!-- Modal Photo -->
    <AppModal v-model="showPhotoModal" title="Modifier ma photo" is-form @confirm="savePhoto" :loading="isSubmitting"
      submit-label="Enregistrer" submit-variant="primary" :form="photoForm" :fields="[
        { name: 'photoUrl', label: 'URL de la photo', type: 'url', required: false, placeholder: 'https://...', fullWidth: true, icon: IconCamera }
      ]" />

    <!-- Modal modification email -->
    <AppModal v-model="showEmailModal" title="Modifier l'adresse email" is-form @confirm="updateEmail"
      :loading="isSubmitting" :submit-label="isSubmitting ? 'Enregistrement...' : 'Enregistrer'"
      description="<strong>Attention:</strong> Modifier votre email changera votre identifiant de connexion. Vous devrez peut-être confirmer la nouvelle adresse."
      description-type="warning" :form="emailForm" :fields="[
        { name: 'email', label: 'Nouvel Email', type: 'email', required: true, placeholder: 'admin@example.com', icon: IconMail }
      ]" />

    <!-- Modal modification mot de passe -->
    <AppModal v-model="showPasswordModal" title="Modifier le mot de passe" is-form @confirm="updatePassword"
      :loading="isSubmitting" submit-label="Définir le mot de passe" submit-variant="success"
      :disabled="passwordForm.newPassword !== passwordForm.confirmPassword"
      description="Pour votre sécurité, vous serez déconnecté après la modification. Requis: 12+ car, 2 Maj, 2 min, 2 chiffres, 2 spéciaux."
      description-type="info" :form="passwordForm" :fields="[
        { name: 'currentPassword', label: 'Mot de passe actuel', type: 'password', required: true, icon: IconPassword },
        { name: 'newPassword', label: 'Nouveau mot de passe', type: 'password', required: true, minlength: 8, icon: IconKey },
        { name: 'confirmPassword', label: 'Confirmer nouveau mot de passe', type: 'password', required: true, icon: IconKey, error: (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) ? 'Les mots de passe ne correspondent pas' : '' }
      ]" />

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { useAPI } from '~/composables/useAPI';
import {
  IconEdit, IconShieldCheck, IconKey, IconLock, IconPassword, IconDeviceMobile,
  IconMail, IconUserShield, IconCheck, IconId, IconCamera, IconTrash, IconPhone
} from '@tabler/icons-vue';

// Middleware d'authentification et de rôle
definePageMeta({
  middleware: ['auth', 'role'],
});

// SEO
useHead({
  title: 'Mon compte administrateur',
  meta: [
    {
      name: 'description',
      content: "Gérez vos informations personnelles, votre mot de passe et vos préférences de sécurité."
    }
  ]
});

const authStore = useAuthStore();
const toast = useToast();
const api = useAPI();
const user = computed(() => authStore.currentUser);
const isSubmitting = ref(false);

const showProfileModal = ref(false);
const showPhotoModal = ref(false);
const showEmailModal = ref(false);
const showPasswordModal = ref(false);
const showPassword = ref(false);

// Formulaires
const profileForm = ref({ prenom: '', nom: '', telephone: '' });
const photoForm = ref({ photoUrl: '' });
const emailForm = ref({ email: '' });
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });

const userInitials = computed(() => {
  const p = user.value?.prenom;
  const n = user.value?.nom;
  if (!p && !n) return 'A';
  return `${p?.charAt(0) || ''}${n?.charAt(0) || ''}`.toUpperCase();
});

onMounted(() => {
  authStore.fetchProfile();
});

// Modification du profil
const openProfileModal = () => {
  if (!user.value) return;
  profileForm.value = {
    prenom: user.value.prenom || '',
    nom: user.value.nom || '',
    telephone: user.value.telephone || ''
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
    toast.error('Erreur lors de la mise à jour du profil');
  } finally {
    isSubmitting.value = false;
  }
};

const savePhoto = async () => {
  isSubmitting.value = true;
  try {
    const result = await authStore.updateProfile({ photoUrl: photoForm.value.photoUrl });
    if (result.success) {
      toast.success('Photo de profil mise à jour');
      showPhotoModal.value = false;
    } else {
      toast.error(result.message);
    }
  } catch (e) {
    toast.error('Erreur lors de la mise à jour de la photo');
  } finally {
    isSubmitting.value = false;
  }
};

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

// Modification de l'email
const openEmailModal = () => {
  emailForm.value = { email: user.value?.email || '' };
  showEmailModal.value = true;
};

const updateEmail = async () => {
  isSubmitting.value = true;
  try {
    await api('/admin/profile/email', {
      method: 'PATCH',
      body: emailForm.value
    });
    toast.success('Email mis à jour avec succès');
    await authStore.fetchProfile();
    showEmailModal.value = false;
  } catch (error: any) {
    toast.error(error.data?.message || 'Erreur lors de la mise à jour de l\'email');
  } finally {
    isSubmitting.value = false;
  }
};

// Modification du mot de passe
const openPasswordModal = () => {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  showPassword.value = false;
  showPasswordModal.value = true;
};

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) return;

  isSubmitting.value = true;
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
    toast.error('Erreur lors de la mise à jour du mot de passe');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
