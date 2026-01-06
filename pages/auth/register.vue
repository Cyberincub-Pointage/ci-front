<template>
  <NuxtLayout name="auth">
    <template #image>
      <img src="https://cybersec-consulting.fr/wp-content/uploads/2023/11/what-is-cybersecurity.jpg"
        class="w-full h-full object-cover opacity-30" />
    </template>
    <template #quote>
      <blockquote class="text-2xl font-medium text-white mb-6">
        "Rejoignez une communauté d'innovateurs et transformez vos idées en réalité."
      </blockquote>
    </template>

    <div class="w-full max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">Inscription Incubé</h1>
        <p class="text-[var(--color-text-secondary)] mt-2">Créez votre compte pour rejoindre le programme</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Prénom *</label>
              <input v-model="form.prenom" type="text" required class="input" />
            </div>
            <div>
              <label class="label">Nom *</label>
              <input v-model="form.nom" type="text" required class="input" />
            </div>
          </div>

          <div>
            <label class="label">Email *</label>
            <input v-model="form.email" type="email" required class="input" />
          </div>

          <div>
            <label class="label">Téléphone *</label>
            <input v-model="form.telephone" type="tel" required class="input" placeholder="+22901XXXXXXXX" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Mot de passe *</label>
              <div class="relative">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="input pr-10"
                  minlength="8" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <IconEye v-if="!showPassword" class="w-5 h-5" />
                  <IconEyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label class="label">Confirmer mot de passe *</label>
              <input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" required class="input"
                minlength="8" />
              <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas.</p>
            </div>
          </div>
          <p class="text-xs text-center text-gray-500 mt-1">8 car. min, 1 maj, 1 min, 1 chiffre, 1 car. spécial</p>

          <div v-if="errorMessage"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note :</strong> Les informations bancaires pourront être ajoutées ultérieurement dans votre
              profil.
            </p>
          </div>

          <button type="submit" :disabled="loading" class="w-full btn btn-primary">
            <IconLoader v-if="loading" class="w-5 h-5 animate-spin" />
            <IconUserPlus v-else class="w-5 h-5" />
            <span>{{ loading ? 'Inscription en cours...' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <div class="mt-6 pt-6 border-t text-center">
          <p class="text-sm text-[var(--color-text-secondary)]">
            Vous avez déjà un compte ?
            <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { IconUserPlus, IconLoader, IconEye, IconEyeOff } from '@tabler/icons-vue';

// Désactive le layout par défaut
definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();

// SEO
useHead({
  title: 'Inscription',
  meta: [
    {
      name: 'description',
      content: "Créez votre compte incubé sur CyberIncub."
    }
  ]
});

const form = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

// Vérifie la validité des mots de passe
const passwordMismatch = computed(() => {
  return !!(form.value.password && form.value.confirmPassword && form.value.password !== form.value.confirmPassword);
});

// Traitement de l'inscription
const handleRegister = async () => {
  errorMessage.value = '';

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    return;
  }

  loading.value = true;

  try {
    const { confirmPassword, ...registerData } = form.value;
    const result = await authStore.register(registerData);

    if (result.success) {
      await router.push('/auth/login');
    } else {
      errorMessage.value = result.message;
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
</script>
