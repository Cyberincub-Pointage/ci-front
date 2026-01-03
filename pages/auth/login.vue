<template>
  <NuxtLayout name="auth">
    <template #image>
      <img v-if="selectedRole === 'incube'" src="https://humanfocus.co.uk/wp-content/uploads/what-is-cyber-security.jpg"
        class="w-full h-full object-cover opacity-50" />
      <img v-else-if="selectedRole === 'formateur'"
        src="https://www.telefonica.com/en/wp-content/uploads/sites/5/2023/11/Cybersecurity-policies-what-is-coming-next.jpg?w=1200&h=673&crop=1"
        class="w-full h-full object-cover opacity-50" />
      <img v-else
        src="https://eu-images.contentstack.com/v3/assets/blt69509c9116440be8/blt8ffb90a2f64bacfa/6776f4544b281ca5e2bc465a/cybersecurity_NicoElNino-AlamyStockPhoto.jpg?disable=upscale&width=1200&height=630&fit=crop"
        class="w-full h-full object-cover opacity-50" />
    </template>

    <template #quote>
      <blockquote class="text-2xl font-medium text-white mb-6" v-if="selectedRole === 'incube'">
        "Suivez votre progression, marquez vos présences et accédez à vos ressources."
      </blockquote>
      <blockquote class="text-2xl font-medium text-white mb-6" v-else-if="selectedRole === 'formateur'">
        "Gérez vos sessions, évaluez les incubés et suivez les performances."
      </blockquote>
      <blockquote class="text-2xl font-medium text-white mb-6" v-else>
        "Supervision globale, gestion des utilisateurs et configuration de la plateforme."
      </blockquote>
    </template>

    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Connexion</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">Accédez à votre espace sécurisé</p>
      </div>

      <!-- Sélecteur de rôle -->
      <div class="flex p-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button v-for="role in roles" :key="role.value" @click="selectRole(role.value)"
          class="relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200" :class="[
            selectedRole === role.value
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]">
          {{ role.label }}
          <!-- Badge dernier accès -->
          <span v-if="lastUsedRole === role.value && selectedRole !== role.value"
            class="absolute -top-3 -right-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 z-10">
            Dernier
          </span>
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="label mb-1.5 block">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconMail class="h-5 w-5 text-gray-400" />
            </div>
            <input v-model="form.email" type="email" required class="input pl-10" :placeholder="emailPlaceholder" />
          </div>
        </div>

        <div>
          <label class="label mb-1.5 block">Mot de passe</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconLock class="h-5 w-5 text-gray-400" />
            </div>
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="input pl-10 pr-10"
              placeholder="••••••••" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
              <IconEye v-if="showPassword" class="w-5 h-5" />
              <IconEyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <div class="flex justify-end mt-2">
            <button type="button" @click="showForgotModal = true"
              class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage"
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <IconAlertCircle class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full btn btn-primary py-3 text-base flex justify-center items-center gap-2 group">
          <span v-if="!loading">Se connecter</span>
          <span v-else>Connexion...</span>
          <IconLogin v-if="!loading" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <IconLoader v-else class="w-5 h-5 animate-spin" />
        </button>
      </form>

      <div class="mt-8 text-center" v-if="selectedRole === 'incube'">
        <p class="text-sm text-[var(--color-text-secondary)]">
          Pas encore de compte ?
          <NuxtLink to="/auth/register" class="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
            S'inscrire
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- Modal Mot de passe oublié -->
    <div v-if="showForgotModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-scale-in">
        <div class="text-center mb-6">
          <div
            class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
            <IconKey class="w-6 h-6" />
          </div>
          <h3 class="text-2xl font-bold mb-2">Mot de passe oublié</h3>
          <p class="text-sm text-[var(--color-text-secondary)]">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <div>
            <label class="label mb-1.5 block">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconMail class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="forgotEmail" type="email" required class="input pl-10" placeholder="votre@email.com" />
            </div>
          </div>

          <div v-if="forgotMessage" class="p-3 rounded-lg text-sm font-medium"
            :class="forgotSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
            {{ forgotMessage }}
          </div>

          <div class="flex gap-3">
            <button type="button" @click="closeForgotModal" class="btn btn-outline flex-1">Annuler</button>
            <button type="submit" :disabled="forgotLoading" class="btn btn-primary flex-1">
              {{ forgotLoading ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

import { IconLogin, IconLoader, IconEye, IconEyeOff, IconMail, IconLock, IconAlertCircle, IconKey } from '@tabler/icons-vue';
import type { UserRole } from '~/types';

// Layout désactivé pour la page de connexion
definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();

// SEO
useHead({
  title: 'Connexion',
  meta: [
    { 
      name: 'description', 
      content: 'Connectez-vous à votre espace sécurisé.' 
    }
  ]
});

const roles: { label: string; value: UserRole }[] = [
  { label: 'Incubé', value: 'incube' },
  { label: 'Formateur', value: 'formateur' },
  { label: 'Admin', value: 'admin' },
];

const selectedRole = ref<UserRole>('incube');
const lastUsedRole = ref<UserRole | null>(null);

const emailPlaceholder = computed(() => {
  switch (selectedRole.value) {
    case 'admin': return 'admin@adpme.bj';
    case 'formateur': return 'formateur@envol.com';
    default: return 'incube@gmail.com';
  }
});

const form = ref({
  email: '',
  password: '',
});

const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

// Récupération du dernier rôle utilisé
onMounted(() => {
  const savedRole = localStorage.getItem('last_role') as UserRole | null;
  if (savedRole && roles.some(r => r.value === savedRole)) {
    selectedRole.value = savedRole;
    lastUsedRole.value = savedRole;
  }
});

const selectRole = (role: UserRole) => {
  selectedRole.value = role;
};

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    // Connexion avec le rôle choisi
    const result = await authStore.login(form.value.email, form.value.password, selectedRole.value);

    if (result.success) {
      // Mémorise le rôle pour la prochaine fois
      localStorage.setItem('last_role', selectedRole.value);

      const dashboardRoute = authStore.getDashboardRoute();
      await router.push(dashboardRoute);
    } else {
      errorMessage.value = result.message;
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
const showForgotModal = ref(false);
const forgotEmail = ref('');
const forgotLoading = ref(false);
const forgotMessage = ref('');
const forgotSuccess = ref(false);

const closeForgotModal = () => {
  showForgotModal.value = false;
  forgotEmail.value = '';
  forgotMessage.value = '';
  forgotSuccess.value = false;
};

const handleForgotPassword = async () => {
  forgotLoading.value = true;
  forgotMessage.value = '';
  forgotSuccess.value = false;

  try {
    const result = await authStore.forgotPassword(forgotEmail.value, selectedRole.value);
    forgotMessage.value = result.message;
    forgotSuccess.value = result.success;
    if (result.success) {
      setTimeout(() => {
        closeForgotModal();
      }, 3000);
    }
  } catch (e) {
    forgotMessage.value = 'Une erreur est survenue';
  } finally {
    forgotLoading.value = false;
  }
};
</script>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
