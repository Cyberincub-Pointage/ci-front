import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  if (!authStore.currentUser) {
    await authStore.loadUser();
  }

  // Pages publiques
  const publicPages = ['/auth/login', '/auth/register'];
  const isPublicPage = publicPages.includes(to.path);

  if (!authStore.isAuthenticated && !isPublicPage) {
    return navigateTo('/auth/login');
  }

  if (authStore.isAuthenticated && isPublicPage) {
    return navigateTo(authStore.getDashboardRoute());
  }
});
