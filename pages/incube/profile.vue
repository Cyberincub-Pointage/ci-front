<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
          Mon Compte
        </h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Gérez vos informations personnelles et bancaires</p>
      </div>
      <div
        class="text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-4 py-2 rounded-full shadow-sm border border-amber-100 dark:border-amber-800 flex items-center gap-2">
        <IconUserStar class="w-4 h-4" />
        <span>Compte Incubé</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Colonne Gauche : Identité & Stats -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Carte d'identité -->
        <div class="card p-6 text-center border-t-4 border-t-amber-500 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <IconUserStar class="w-40 h-40" />
          </div>

          <div class="relative z-10 transition-all duration-300">
            <div
              class="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 mb-4 shadow-xl relative group">
              <div v-if="user?.photoUrl" class="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                <img :src="user.photoUrl" class="w-full h-full object-cover" alt="Profile" />
              </div>
              <div v-else
                class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <span
                  class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                  {{ userInitials }}
                </span>
              </div>

              <!-- Bouton photo -->
              <button @click="openPhotoModal"
                class="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Modifier la photo">
                <IconCamera class="w-4 h-4" />
              </button>

              <!-- Bouton suppression photo -->
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
                class="badge badge-warning text-amber-800 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">Incubé</span>
              <span v-if="equipe"
                class="badge badge-outline border-blue-200 text-blue-700 dark:text-blue-300 dark:border-blue-800">{{
                  equipe.nom }}</span>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                <p class="text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1 font-semibold">
                  Présences</p>
                <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ validatedPresences }}</p>
              </div>
              <div class="text-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/10">
                <p class="text-xs text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1 font-semibold">
                  Gains</p>
                <p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ formatCurrency(totalEarned) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Carte Projet -->
        <div class="card p-5 relative overflow-hidden">
          <div class="absolute right-0 top-0 p-3 opacity-5">
            <IconBriefcase class="w-24 h-24" />
          </div>

          <h3 class="font-bold flex items-center gap-2 mb-4 relative z-10">
            <IconRocket class="w-5 h-5 text-indigo-500" />
            Mon Projet
          </h3>

          <div class="relative z-10 space-y-4">
            <div v-if="projet">
              <h4 class="font-bold text-lg text-indigo-700 dark:text-indigo-300">{{ projet.nom }}</h4>
              <p class="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-3">
                {{ projet.description || 'Aucune description disponible' }}</p>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-sm text-[var(--color-text-secondary)] italic">Aucun projet assigné</p>
            </div>
          </div>
        </div>

        <!-- Configuration Équipe -->
        <div class="card overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconUsers class="w-5 h-5 text-blue-500" />
              Mon Équipe
            </h3>
            <button @click="openTeamModal"
              class="btn btn-sm btn-ghost hover:bg-white dark:hover:bg-gray-700 text-blue-600 shadow-none hover:shadow-sm transition-all"
              :title="teamRequestPending ? 'Demande en cours' : 'Modifier / Rejoindre'">
              <IconEdit v-if="!teamRequestPending" class="w-4 h-4 mr-1.5" />
              <IconClock v-else class="w-4 h-4 mr-1.5" />
              {{ teamRequestPending ? 'En attente' : (equipe ? 'Modifier' : 'Rejoindre') }}
            </button>
          </div>

          <div class="p-6">
            <div v-if="equipe">
              <div class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div
                  class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                  {{ equipe.nom.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ equipe.nom }}</h4>
                  <p class="text-sm text-[var(--color-text-secondary)]">Membre de l'équipe</p>
                </div>
              </div>

              <div v-if="teamRequestPending"
                class="mt-4 p-3 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-lg text-sm flex items-center gap-2">
                <IconClock class="w-5 h-5" />
                <span>Votre demande de changement d'équipe est en cours de validation.</span>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <div
                class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800/50 mb-3">
                <IconUsers class="w-6 h-6 text-gray-400" />
              </div>
              <p class="text-gray-500 text-sm">Vous ne faites partie d'aucune équipe pour le moment.</p>
              <button @click="openTeamModal" class="btn btn-sm btn-primary mt-3">Rejoindre une équipe</button>

              <div v-if="teamRequestPending"
                class="mt-4 p-3 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-lg text-sm flex items-center gap-2 text-left">
                <IconClock class="w-5 h-5 shrink-0" />
                <span>Demande de changement d'équipe en attente de validation.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="card overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconLock class="w-5 h-5 text-red-500" />
              Sécurité
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
                  <p class="text-sm text-[var(--color-text-secondary)]">Protégez votre compte.</p>
                </div>
              </div>
              <button @click="openPasswordModal"
                class="btn btn-outline border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:border-gray-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 w-full sm:w-auto">
                Modifier
              </button>
            </div>
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
              <IconId class="w-5 h-5 text-indigo-500" />
              Informations Personnelles
            </h3>
            <button @click="openProfileModal"
              class="btn btn-sm btn-ghost hover:bg-white dark:hover:bg-gray-700 text-indigo-600 shadow-none hover:shadow-sm transition-all">
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

              <!-- Email -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Email</label>
                <div
                  class="flex items-center text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                  <IconMail class="w-4 h-4 text-gray-400 mr-2" />
                  {{ user?.email }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations Bancaires -->
        <div class="card overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[var(--color-bg-secondary)]">
            <h3 class="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <IconBuildingBank class="w-5 h-5 text-emerald-500" />
              Informations Bancaires
            </h3>

            <button v-if="hasBankInfo" @click="requestBankInfoEdit"
              class="btn btn-sm btn-ghost hover:bg-white dark:hover:bg-gray-700 text-emerald-600 shadow-none hover:shadow-sm transition-all"
              :title="editRequestPending ? 'Demande en cours' : 'Demander modification'">
              <IconEdit v-if="!editRequestPending" class="w-4 h-4 mr-1.5" />
              <IconClock v-else class="w-4 h-4 mr-1.5" />
              {{ editRequestPending ? 'En attente' : 'Modifier' }}
            </button>
            <button v-else @click="showBankModal = true"
              class="btn btn-sm btn-primary bg-emerald-600 hover:bg-emerald-700 border-none">
              <IconPlus class="w-4 h-4 mr-1.5" />
              Ajouter
            </button>
          </div>

          <div class="p-6">
            <div v-if="hasBankInfo">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1.5">
                  <label
                    class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Banque</label>
                  <div
                    class="text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-transparent flex items-center gap-2">
                    <IconBuildingBank class="w-5 h-5 text-emerald-600" />
                    {{ banque?.nom || 'Banque inconnue' }}
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Code
                    Banque</label>
                  <div
                    class="text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent font-mono">
                    {{ banque?.code || '---' }}
                  </div>
                </div>
                <div class="space-y-1.5 md:col-span-2">
                  <label
                    class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">RIB</label>
                  <div
                    class="text-gray-900 dark:text-white font-medium p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent font-mono tracking-wider">
                    {{ user?.rib }}
                  </div>
                </div>
              </div>

              <div v-if="editRequestPending"
                class="mt-4 p-3 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-lg text-sm flex items-center gap-2">
                <IconClock class="w-5 h-5" />
                <span>Votre demande de modification est en cours de traitement par l'administration.</span>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <div
                class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <IconBuildingBank class="w-8 h-8 text-gray-400" />
              </div>
              <h4 class="font-bold text-gray-700 dark:text-gray-300">Aucune information bancaire</h4>
              <p class="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto mt-2">Ajoutez votre RIB et vos
                informations bancaires pour recevoir vos paiements d'indemnités.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition de profil -->
    <AppModal v-model="showProfileModal" title="Modifier mes informations" is-form @confirm="saveProfile"
      :loading="isSubmitting" submit-label="Enregistrer les modifications" submit-variant="info" :form="profileForm"
      :grid-cols="2" :fields="[
        { name: 'prenom', label: 'Prénom', type: 'text', required: true },
        { name: 'nom', label: 'Nom', type: 'text', required: true },
        { name: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '+229...', fullWidth: true }
      ]" />

    <AppModal v-model="showPhotoModal" title="Modifier ma photo" is-form @confirm="savePhoto" :loading="isSubmitting"
      submit-label="Enregistrer" submit-variant="primary" :form="photoForm" :fields="[
        { name: 'photoUrl', label: 'URL de la photo', type: 'url', required: false, placeholder: 'https://...', fullWidth: true, icon: IconCamera }
      ]" />

    <!-- Modal Infos Bancaires -->
    <AppModal v-model="showBankModal" title="Ajouter mes informations bancaires" is-form @confirm="saveBankInfo"
      :loading="bankLoading" submit-label="Enregistrer" submit-variant="success"
      description="Veuillez saisir vos informations avec soin. Toute modification ultérieure devra être validée par l'administration."
      description-type="info" :form="bankForm" :fields="[
        { name: 'banqueId', label: 'Banque *', type: 'select', required: true, options: bankStore.banks.map(b => ({ value: b.id, label: b.nom })), placeholder: 'Sélectionnez votre banque' },
        { name: 'rib', label: 'RIB *', type: 'text', required: true, placeholder: 'SN00...', pattern: '[A-Z0-9]+', class: 'uppercase font-mono' }
      ]">
      <div v-if="bankError" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
        {{ bankError }}
      </div>
    </AppModal>

    <!-- Modal Équipe -->
    <AppModal v-model="showTeamModal" :title="equipe ? 'Changer d\'équipe' : 'Rejoindre une équipe'" is-form
      @confirm="saveTeam" :loading="teamLoading" submit-label="Enregistrer" submit-variant="primary"
      :description="equipe ? 'Votre changement d\'équipe devra être validé par un formateur.' : 'Sélectionnez votre équipe parmi la liste.'"
      description-type="info" :form="teamForm" :fields="[
        { name: 'equipeId', label: 'Équipe', type: 'select', required: true, options: teamStore.teams.map(e => ({ value: e.id, label: e.nom })), placeholder: 'Sélectionnez une équipe' }
      ]" />

    <!-- Modal Mot de passe -->
    <AppModal v-model="showPasswordModal" title="Modifier le mot de passe" is-form @confirm="savePassword"
      :loading="passwordLoading" submit-label="Modifier le mot de passe" submit-variant="danger"
      :disabled="!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
      description="Pour votre sécurité, vous serez déconnecté après la modification. Requis: 8+ car, 1 Maj, 1 min, 1 chiffre, 1 spécial."
      description-type="danger" :form="passwordForm" :fields="[
        { name: 'currentPassword', label: 'Mot de passe actuel', type: 'password', required: true, icon: IconLock },
        { name: 'newPassword', label: 'Nouveau mot de passe', type: 'password', required: true, minlength: 8, icon: IconKey },
        { name: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', required: true, icon: IconKey, error: (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) ? 'Les mots de passe ne correspondent pas' : '' }
      ]" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { usePresenceStore } from '~/stores/presence';
import { useBankStore } from '~/stores/bank';
import { useTeamStore } from '~/stores/team';
import { useProjectStore } from '~/stores/project';
import {
  IconUserStar, IconBriefcase, IconBuildingBank, IconId, IconEdit,
  IconClock, IconLock, IconPlus, IconPhone, IconMail, IconRocket, IconKey, IconUsers, IconCamera, IconTrash
} from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Mon compte incubé',
  meta: [
    {
      name: 'description',
      content: "Gérez vos informations personnelles et bancaires."
    }
  ]
});

const authStore = useAuthStore();
const presenceStore = usePresenceStore();
const bankStore = useBankStore();
const teamStore = useTeamStore();
const projectStore = useProjectStore();
const toast = useToast();
const user = computed(() => authStore.currentUser as any);

// État pour Modal Profil
const showProfileModal = ref(false);
const isSubmitting = ref(false);
const profileForm = ref({
  nom: '',
  prenom: '',
  telephone: ''
});

// État pour Modal Photo
const showPhotoModal = ref(false);
const photoForm = ref({
  photoUrl: ''
});

// État pour Infos Bancaires
const showBankModal = ref(false);
const editRequestPending = ref(false);
const bankLoading = ref(false);
const bankError = ref('');
const bankForm = ref({
  banqueId: '',
  rib: '',
});

// État pour Équipe
const showTeamModal = ref(false);
const teamLoading = ref(false);
const teamError = ref('');
const teamRequestPending = ref(false);
const teamForm = ref({
  equipeId: ''
});

// État pour Modal Mot de passe
const showPasswordModal = ref(false);
const passwordLoading = ref(false);
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const showPassword = ref(false);

// Cycle de vie
onMounted(async () => {
  await Promise.all([
    authStore.fetchProfile(),
    bankStore.fetchBanks(),
    teamStore.fetchTeams(),
    projectStore.fetchProjects()
  ]);

  if (user.value) {
    editRequestPending.value = !!(user.value.pendingRib || user.value.pendingBanque);
    teamRequestPending.value = !!user.value.pendingEquipe;
  }
});

// Aides pour données calculées
const userInitials = computed(() => {
  if (!user.value) return 'U';
  return `${user.value.prenom?.[0] || ''}${user.value.nom?.[0] || ''}`.toUpperCase();
});

const hasBankInfo = computed(() => {
  const hasBanque = !!user.value?.banqueId || (user.value?.banque && (typeof user.value.banque === 'object' || typeof user.value.banque === 'string'));
  return hasBanque && !!user.value?.rib;
});

const equipe = computed(() => {
  if (!user.value) return null;
  const equipeId = typeof user.value.equipe === 'object' ? user.value.equipe?.id : (user.value.equipeId || user.value.equipe);
  if (!equipeId) return null;
  return teamStore.teams.find(t => t.id == equipeId) || (typeof user.value.equipe === 'object' ? user.value.equipe : null);
});

const projet = computed(() => {
  if (!user.value) return null;

  // Essayer de trouver l'ID du projet depuis l'utilisateur
  const projetId = typeof user.value.projet === 'object' ? user.value.projet?.id : (user.value.projetId || user.value.projet);

  if (projetId) {
    return projectStore.projects.find(p => p.id == projetId) || (typeof user.value.projet === 'object' ? user.value.projet : null);
  }

  // Repli : Si l'utilisateur a une équipe, trouver le projet associé
  if (equipe.value) {
    return projectStore.projects.find(p => p.equipeId == equipe.value.id) ||
      projectStore.projects.find(p => p.equipe && p.equipe.id == equipe.value.id);
  }

  return null;
});

const banque = computed(() => {
  if (!user.value) return null;
  const banqueId = typeof user.value.banque === 'object' ? user.value.banque?.id : (user.value.banqueId || user.value.banque);
  if (!banqueId) return null;
  return bankStore.banks.find(b => b.id == banqueId) || (typeof user.value.banque === 'object' ? user.value.banque : null);
});

const validatedPresences = computed(() => {
  if (!user.value) return 0;
  return presenceStore.getPresencesByIncube(user.value.id).filter(p => p.status === 'validated').length;
});

const totalEarned = computed(() => {
  if (!user.value) return 0;
  return presenceStore.getTotalAmountByIncube(user.value.id);
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};


// Actions - Profil
const openProfileModal = () => {
  if (!user.value) return;
  profileForm.value = {
    nom: user.value.nom || '',
    prenom: user.value.prenom || '',
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

const saveProfile = async () => {
  isSubmitting.value = true;
  try {
    const result = await authStore.updateProfile(profileForm.value);
    if (result.success) {
      showProfileModal.value = false;
      toast.success('Profil mis à jour avec succès');
    } else {
      toast.error(result.message);
    }
  } catch (e) {
    toast.error('Erreur lors de la mise à jour');
  } finally {
    isSubmitting.value = false;
  }
};

// Actions - Banque
const saveBankInfo = async () => {
  bankLoading.value = true;
  bankError.value = '';

  try {
    const result = await authStore.updateBankInfo({
      rib: bankForm.value.rib,
      banque: bankForm.value.banqueId
    });

    if (result.success) {
      if (result.status === 'pending') {
        editRequestPending.value = true;
        toast.success("Demande de modification envoyée à l'administration.");
      } else {
        toast.success("Informations bancaires mises à jour.");
      }
      showBankModal.value = false;
    } else {
      bankError.value = result.message;
      toast.error(result.message);
    }
  } catch (error: any) {
    bankError.value = 'Erreur lors de l\'enregistrement';
  } finally {
    bankLoading.value = false;
  }
};

const requestBankInfoEdit = async () => {
  if (user.value) {
    bankForm.value = {
      banqueId: banque.value?.id || '',
      rib: user.value.rib || ''
    };
    showBankModal.value = true;
  }
};

// Actions - Équipe
const openTeamModal = () => {
  if (user.value) {
    teamForm.value = {
      equipeId: equipe.value?.id || ''
    };
    showTeamModal.value = true;
  }
};

const saveTeam = async () => {
  teamLoading.value = true;
  teamError.value = '';

  try {
    const result = await authStore.updateTeam(teamForm.value.equipeId);

    if (result.success) {
      if (result.status === 'pending') {
        teamRequestPending.value = true;
        toast.success("Demande de changement d'équipe envoyée.");
      } else {
        toast.success("Équipe mise à jour avec succès.");
      }
      showTeamModal.value = false;
    } else {
      toast.error(result.message);
    }
  } catch (e) {
    toast.error("Erreur lors de la mise à jour de l'équipe");
  } finally {
    teamLoading.value = false;
  }
};

// Actions - Mot de passe
const openPasswordModal = () => {
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  showPassword.value = false;
  showPasswordModal.value = true;
};

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
  } catch (e) {
    toast.error('Erreur lors de la modification');
  } finally {
    passwordLoading.value = false;
  }
};
</script>
