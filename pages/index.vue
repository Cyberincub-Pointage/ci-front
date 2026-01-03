<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4">
      </div>
      <AppSkeleton type="text" width="120px" height="20px" class="mx-auto" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

useHead({
  title: 'CyberIncub',
  meta: [
    { 
      name: 'description', 
      content: "Plateforme de gestion d'incubation." 
    }
  ]
});

onMounted(() => {
  authStore.loadUser();

  if (authStore.isAuthenticated) {
    navigateTo(authStore.getDashboardRoute());
  } else {
    navigateTo('/auth/login');
  }
});
</script>
