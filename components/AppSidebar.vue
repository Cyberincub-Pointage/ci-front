<template>
  <aside
    class="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[var(--color-bg-primary)] border-r transition-all duration-300 z-40 flex flex-col"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isCollapsed ? 'w-20' : 'w-64'
    ]">

    <!-- Bouton de bascule -->
    <button @click="toggleCollapse"
      class="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-md text-gray-500 hover:text-primary-600 hidden lg:flex items-center justify-center z-50">
      <IconChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
      <IconChevronRight v-else class="w-4 h-4" />
    </button>

    <div class="flex flex-col h-full overflow-hidden">
      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to"
          @click="closeSidebar"
          class="flex items-center gap-3 px-3 py-3 rounded-lg transition-all group whitespace-nowrap relative" :class="[
            isActive(item.to)
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
          ]" :title="isCollapsed ? item.label : ''">

          <component :is="item.icon" class="w-6 h-6 flex-shrink-0" :class="{ 'mx-auto': isCollapsed }" />

          <span class="font-medium transition-opacity duration-200"
            :class="isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'">
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Pied de page -->
      <div class="p-4 border-t" v-if="!isCollapsed">
        <div
          class="card p-3 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10 border-none">
          <p class="text-xs font-bold text-[var(--color-text-primary)]">Besoin d'aide ?</p>
          <a href="#" class="text-xs text-primary-600 hover:underline mt-1 block">Support technique</a>
        </div>
      </div>
      <div v-else class="p-4 border-t flex justify-center">
        <button class="p-2 text-gray-400 hover:text-primary-500">
          <IconHelpCircle class="w-6 h-6" />
        </button>
      </div>
    </div>
  </aside>

  <!-- Superposition pour mobile -->
  <div v-if="isOpen" @click="closeSidebar" class="fixed inset-0 bg-black/50 z-30 lg:hidden top-16 backdrop-blur-sm" />
</template>

<script setup lang="ts">
import {
  IconLayoutDashboard, IconClipboardCheck, IconHistory, IconCalendarTime, IconSchool,
  IconAlertTriangle, IconUsers, IconInfoCircle, IconUser, IconCash, IconCurrencyEuro, IconChevronLeft, IconChevronRight, IconHelpCircle, IconStack2
} from '@tabler/icons-vue';
import { useAuthStore } from '~/stores/auth';
import { ROLES, ROLE_GROUPS } from '~/utils/roles';

interface MenuItem {
  label: string;
  to: string;
  icon: any;
  roles: string[];
}

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  'update:collapsed': [value: boolean];
}>();

const route = useRoute();
const authStore = useAuthStore();
const isCollapsed = ref(false);

const allMenuItems: MenuItem[] = [
  // Incubé
  { 
    label: 'Tableau de bord', 
    to: '/incube/dashboard', 
    icon: IconLayoutDashboard, 
    roles: [ROLES.Incube_Role] 
  },
  { 
    label: 'Marquer présence', 
    to: '/incube/presence', 
    icon: IconClipboardCheck, 
    roles: [ROLES.Incube_Role] 
  },
  { 
    label: 'Historique', 
    to: '/incube/history', 
    icon: IconHistory, 
    roles: [ROLES.Incube_Role] 
  },
  { 
    label: 'Rétro-présence', 
    to: '/incube/retro', 
    icon: IconCalendarTime, 
    roles: [ROLES.Incube_Role] 
  },
  { 
    label: 'Permissions', 
    to: '/incube/permissions', 
    icon: IconInfoCircle, 
    roles: [ROLES.Incube_Role] 
  },
  { 
    label: 'Avertissements', 
    to: '/incube/warnings', 
    icon: IconAlertTriangle, 
    roles: [ROLES.Incube_Role] 
  },

  // Formateur
  { 
    label: 'Tableau de bord', 
    to: '/formateur/dashboard', 
    icon: IconLayoutDashboard, 
    roles: [ROLES.PForm_Role] 
  },
  { 
    label: 'Gestion formateurs', 
    to: '/manage/formateurs', 
    icon: IconSchool, 
    roles: [ROLES.PForm_Role] 
  },
  { 
    label: 'Gestion des incubés', 
    to: '/manage/incubes', 
    icon: IconUser, 
    roles: ROLE_GROUPS.GForms_Role 
  },
  { 
    label: 'Présences', 
    to: '/formateur/presences', 
    icon: IconClipboardCheck, 
    roles: ROLE_GROUPS.GForms_Role 
  },
  { 
    label: 'Permissions', 
    to: '/formateur/permissions', 
    icon: IconInfoCircle, 
    roles: ROLE_GROUPS.GForms_Role 
  },
  { 
    label: 'Avertissements', 
    to: '/manage/warnings', 
    icon: IconAlertTriangle, 
    roles: ROLE_GROUPS.GForms_Role 
  },
  { 
    label: 'Entités', 
    to: '/manage/entities', 
    icon: IconStack2, 
    roles: ROLE_GROUPS.GForms_Role 
  },

  // Admin
  { 
    label: 'Tableau de bord', 
    to: '/admin/dashboard', 
    icon: IconLayoutDashboard, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
  { 
    label: 'Administrateurs', 
    to: '/admin/admins', 
    icon: IconUsers, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
  { 
    label: 'Formateurs', 
    to: '/manage/formateurs', 
    icon: IconSchool, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
  { 
    label: 'Incubés', 
    to: '/manage/incubes', 
    icon: IconUser, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
  { 
    label: 'Présences', 
    to: '/admin/presences', 
    icon: IconClipboardCheck, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
  { 
    label: 'Paiements', 
    to: '/admin/paiements', 
    icon: IconCash, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
   { 
    label: 'Avertissements', 
    to: '/manage/warnings', 
    icon: IconAlertTriangle, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
  { 
    label: 'Entités', 
    to: '/manage/entities', 
    icon: IconStack2, 
    roles: ROLE_GROUPS.GAdmin_Role 
  },
];

const menuItems = computed(() => {
  if (!authStore.currentUser) return [];
  const userRole = authStore.currentUser.role;
  return allMenuItems.filter(item => item.roles.includes(userRole));
});

// Logique de lien actif
const isActive = (path: string) => {
  if (path === '/' || path === '/admin' || path === '/incube' || path === '/formateur') {
    return route.path === path;
  }
  return route.path.startsWith(path);
};

// Logique de réduction
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar_collapsed', String(isCollapsed.value));
  emit('update:collapsed', isCollapsed.value);
};

onMounted(() => {
  const savedState = localStorage.getItem('sidebar_collapsed');
  if (savedState) {
    isCollapsed.value = savedState === 'true';
    emit('update:collapsed', isCollapsed.value);
  }
});

const closeSidebar = () => {
  emit('close');
};
</script>
