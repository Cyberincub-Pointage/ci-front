<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <AppToast />
    <AppConfirmModal />

    <!-- Section gauche-->
    <div class="relative hidden lg:flex flex-col justify-end p-12 overflow-hidden bg-slate-900">
      <div class="absolute inset-0">
        <!-- Défaut image -->
        <slot name="image">
          <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop"
            alt="Banner" class="w-full h-full object-cover opacity-30" />
        </slot>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>

      <div class="relative z-10 max-w-lg">
        <img src="/img/logo-b.png" alt="CyberIncub" class="h-12 w-auto mb-8" />

        <slot name="quote">
          <blockquote class="text-2xl font-medium text-white mb-6">
            "La plateforme de gestion intégrée pour votre parcours d'incubation."
          </blockquote>
        </slot>

        <slot name="footer">
          <div class="flex items-center gap-4">
            <div class="h-1 w-12 bg-primary-500 rounded-full"></div>
            <p class="text-slate-400 font-medium tracking-wide text-sm uppercase">CyberIncub Platform</p>
          </div>
        </slot>
      </div>
    </div>

    <!-- Section Formulaire -->
    <div class="flex flex-col justify-center px-6 lg:px-24 xl:px-32 py-12 bg-white dark:bg-slate-950">
      <div class="w-full max-w-md mx-auto">
        <!-- Contenu de base -->
        <div class="mb-10 lg:hidden text-center">
          <img src="/img/logo-c.png" alt="CyberIncub" class="h-12 w-auto mx-auto" />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadUser();
});
</script>
