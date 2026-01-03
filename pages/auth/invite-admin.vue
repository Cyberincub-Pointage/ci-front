<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Section gauche : Image/Banner -->
    <div class="relative hidden lg:flex flex-col justify-end p-12 overflow-hidden bg-slate-900">
      <div class="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
          alt="Office Team" class="w-full h-full object-cover opacity-30" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>
      <div class="relative z-10 max-w-lg">
        <img src="/img/logo-b.png" alt="CyberIncub" class="h-12 w-auto mb-8" />
        <blockquote class="text-2xl font-medium text-white mb-6">
          "Bienvenue dans l'équipe d'administration. Ensemble, construisons l'excellence opérationnelle."
        </blockquote>
        <div class="flex items-center gap-4">
          <div class="h-1 w-12 bg-[var(--color-primary)] rounded-full"></div>
          <p class="text-slate-400 font-medium tracking-wide text-sm uppercase">L'équipe Administrative</p>
        </div>
      </div>
    </div>

    <!-- Section droite : Formulaire -->
    <div class="flex flex-col justify-center px-6 lg:px-24 xl:px-32 py-12 bg-white dark:bg-slate-950">
      <div class="w-full max-w-md mx-auto">
        <div class="mb-10 lg:hidden">
          <img src="/img/logo-c.png" alt="CyberIncub" class="h-10 w-auto" />
        </div>

        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Acceptez votre invitation Admin
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Finalisez la configuration de votre compte administrateur en définissant votre mot de passe.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Champs pré-remplis -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
              <input v-model="prenom" type="text"
                class="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
              <input v-model="nom" type="text"
                class="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" disabled />
            </div>
          </div>

          <!-- Mot de passe -->
          <div>
            <label class="label">Définir un mot de passe</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required minlength="8"
                class="input pr-10" placeholder="••••••••" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <IconEye v-if="!showPassword" class="w-5 h-5" />
                <IconEyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Confirmation Mot de passe -->
          <div>
            <label class="label">Confirmer le mot de passe</label>
            <input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" required minlength="8"
              class="input" placeholder="••••••••" />
            <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas.</p>
          </div>

          <button type="submit" class="btn btn-primary w-full py-2.5 shadow-lg shadow-primary-500/20"
            :disabled="loading || passwordMismatch">
            <IconLoader v-if="loading" class="w-5 h-5 animate-spin mx-auto" />
            <span v-else>Activer mon compte Admin</span>
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate-500">
          Problème avec le lien ? <a href="mailto:support@cyberincub.com"
            class="font-medium text-[var(--color-primary)] hover:underline">Contactez le support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconLoader, IconEye, IconEyeOff } from '@tabler/icons-vue';

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const api = useAPI();

useHead({
  title: 'Invitation admin',
  meta: [
    { 
      name: 'description', 
      content: "Acceptez votre invitation pour rejoindre l'équipe d'administration de CyberIncub. Définissez votre mot de passe pour accéder au tableau de bord." 
    }
  ]
});

const loading = ref(false);
const showPassword = ref(false);
const form = ref({
  password: '',
  confirmPassword: ''
});

const token = computed(() => route.query.token as string);

const passwordMismatch = computed(() => {
  return !!(form.value.password && form.value.confirmPassword && form.value.password !== form.value.confirmPassword);
});

const handleSubmit = async () => {
  if (passwordMismatch.value || !token.value) return;

  loading.value = true;
  try {
    const response: any = await (api as any)('/admin/auth/accept-invitation', {
      method: 'POST',
      body: {
        token: token.value,
        password: form.value.password,
        nom: nom.value,
        prenom: prenom.value,
        // Admin controllers might expect photoUrl but it's optional
      }
    });

    if (response.token) {
      const authCookie = useCookie('auth_token');
      authCookie.value = response.token;
      
      // Force refresh user/profile if needed, or just let dashboard load fail if not ready (usually auto-fetched)
      
      useToast().success('Compte Admin activé avec succès !');
      window.location.href = '/admin/dashboard';
    }
  } catch (error: any) {
    useToast().error(error.data?.message || "Une erreur est survenue lors de l'activation.");
  } finally {
    loading.value = false;
  }
};

const prenom = ref('...');
const nom = ref('...');

onMounted(async () => {
  if (!token.value) {
    useToast().error("Lien d'invitation invalide ou manquant.");
    router.push('/auth/login');
    return;
  }

  try {
    const info: any = await (api as any)(`/admin/auth/invitation-info?token=${token.value}`);
    prenom.value = info.prenom;
    nom.value = info.nom;
  } catch (e) {
    useToast().error("Lien d'invitation invalide ou expiré.");
    router.push('/auth/login');
  }
});
</script>
