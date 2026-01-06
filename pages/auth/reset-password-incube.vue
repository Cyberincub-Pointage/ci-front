<template>
  <NuxtLayout name="auth">
    <template #image>
      <img src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop"
        class="w-full h-full object-cover opacity-30" />
    </template>
    <template #quote>
      <blockquote class="text-2xl font-medium text-white mb-6">
        "Sécurisez votre compte incubé et reprenez votre progression."
      </blockquote>
    </template>

    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">Réinitialisation Incubé</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">Créez votre nouveau mot de passe incubé</p>
      </div>

      <div class="card">
        <div v-if="success">
          <div class="text-center py-6">
            <div
              class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-xl font-bold mb-2 text-green-700 dark:text-green-400">Succès !</h2>
            <p class="text-[var(--color-text-secondary)] mb-6">{{ message }}</p>

            <NuxtLink to="/auth/login" class="btn btn-primary w-full">
              Se connecter
            </NuxtLink>
          </div>
        </div>

        <div v-else-if="tokenError">
          <div class="text-center py-6">
            <div
              class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconX class="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 class="text-xl font-bold mb-2 text-red-700 dark:text-red-400">Lien invalide</h2>
            <p class="text-[var(--color-text-secondary)] mb-6">Ce lien de réinitialisation est invalide ou a expiré.</p>

            <NuxtLink to="/auth/login" class="btn btn-primary w-full">
              Retour à la connexion
            </NuxtLink>
          </div>
        </div>

        <form v-else @submit.prevent="handleReset" class="space-y-4">
          <div>
            <label class="label">Nouveau mot de passe</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" required class="input pr-10"
                placeholder="••••••••" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                <IconEye v-if="showPassword" class="w-5 h-5" />
                <IconEyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
            <IconAlertCircle class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              Le mot de passe doit contenir au moins 8 caractères, avec 1 majuscule, 1 minuscule, 1 chiffre et 1
              caractère
              spécial.
            </p>
          </div>


          <div>
            <label class="label">Confirmer le mot de passe</label>
            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" required class="input"
              placeholder="••••••••" />
            <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas.</p>
          </div>

          <div v-if="errorMessage"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <button type="submit" :disabled="loading" class="w-full btn btn-primary">
            <IconLoader v-if="loading" class="w-5 h-5 animate-spin" />
            <IconLock v-else class="w-5 h-5" />
            <span>{{ loading ? 'Enregistrement...' : 'Enregistrer' }}</span>
          </button>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { IconLock, IconLoader, IconCheck, IconX, IconEye, IconEyeOff, IconAlertCircle } from '@tabler/icons-vue';

// Désactive le layout par défaut
definePageMeta({
  layout: false,
});

const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();

// SEO
useHead({
  title: 'Réinitialisation Incubé',
  meta: [
    {
      name: 'description',
      content: "Réinitialisez votre mot de passe incubé CyberIncub."
    }
  ]
});

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const success = ref(false);
const message = ref('');
const showPassword = ref(false);
const tokenError = ref(false);

const token = ref('');
const role = 'incube'; // Role fixé

// Vérifie que les deux mots de passe correspondent
const passwordMismatch = computed(() => {
  return !!(password.value && confirmPassword.value && password.value !== confirmPassword.value);
});

// Vérifie si un token est présent dans l'URL à l'ouverture de la page
onMounted(() => {
  const queryToken = route.query.token as string;

  if (!queryToken) {
    tokenError.value = true;
  } else {
    token.value = queryToken;
  }
});

// Enregistre le nouveau mot de passe
const handleReset = async () => {
  if (passwordMismatch.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await authStore.resetPassword(token.value, password.value, role);

    if (result.success) {
      success.value = true;
      message.value = result.message;
    } else {
      if (result.message.includes('invalide')) {
        tokenError.value = true;
      } else {
        errorMessage.value = result.message;
      }
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
</script>
