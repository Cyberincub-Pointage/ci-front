import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Charger l'utilisateur
  if (!authStore.currentUser) {
    authStore.loadUser();
  }

  // Vérifier le rôle selon la route
  const path = to.path;

  if (path.startsWith('/incube') && !authStore.hasRole(ROLES.Incube_Role)) {
    return navigateTo('/auth/login');
  }

  if (path.startsWith('/formateur') && !authStore.hasRole(ROLE_GROUPS.GForms_Role)) {
    return navigateTo('/auth/login');
  }

  if (path.startsWith('/admin') && !authStore.hasRole(ROLE_GROUPS.GAdmin_Role)) {
    return navigateTo('/auth/login');
  }

  if (path.startsWith('/manage') && !authStore.hasRole(ROLE_GROUPS.Managers_Role)) {
    return navigateTo('/auth/login');
  }
});
