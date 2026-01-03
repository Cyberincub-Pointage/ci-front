<template>
  <nav class="flex w-full" aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-y-2 gap-x-1 md:gap-x-2">
      <li class="inline-flex items-center">
        <NuxtLink :to="dashboardPath" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
          <IconHome class="w-3 h-3 me-2.5" />
          {{ dashboardLabel }}
        </NuxtLink>
      </li>
      <li v-for="(item, index) in items" :key="index">
        <div class="flex items-center">
          <IconChevronRight class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" />
          <NuxtLink v-if="item.to" :to="item.to" class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">{{ item.label }}</NuxtLink>
          <span v-else class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">{{ item.label }}</span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { ROLES } from '~/utils/roles';
import { IconHome, IconChevronRight } from '@tabler/icons-vue';

// Liste des éléments du fil d'Ariane
defineProps<{
  items: { label: string; to?: string }[];
}>();

// Utilisation du store d'authentification pour récupérer le rôle de l'utilisateur
const authStore = useAuthStore();
const role = computed(() => authStore.currentUser?.role);

//Chemin du tableau de bord en fonction du rôle de l'utilisateur
const dashboardPath = computed(() => {
  const userRole = role.value;
  if (!userRole) return '/';

  if ([ROLES.SAdmin_Role, ROLES.Admin_Role].includes(userRole)) {
    return '/admin/dashboard';
  }
  if (userRole === ROLES.PForm_Role) {
    return '/formateur/dashboard';
  }
  if (userRole === ROLES.Form_Role) {
    return '/formateur/dashboard';
  }
  if (userRole === ROLES.Incube_Role) {
    return '/incube/dashboard';
  }
  return '/';
});

// Libellé du lien vers le tableau de bord
const dashboardLabel = computed(() => {
  // if (role.value === ROLES.PForm_Role) return 'Supervision';
  return 'Tableau de bord';
});
</script>
