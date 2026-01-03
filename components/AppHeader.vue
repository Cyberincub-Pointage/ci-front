<template>
  <header class="fixed top-0 w-full z-50 bg-[var(--color-bg-primary)] border-b shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3">
          <img :src="isDark ? '/img/logo-b.png' : '/img/logo-c.png'" alt="CyberIncub" class="h-8 w-auto" />
          <span class="font-bold text-xl hidden sm:block">CyberIncub</span>
        </NuxtLink>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Thème -->
          <button @click="toggleTheme" class="btn-ghost p-2 rounded-lg" aria-label="Toggle theme">
            <IconSun v-if="isDark" class="w-5 h-5" />
            <IconMoon v-else class="w-5 h-5" />
          </button>

          <!-- Notifications -->
          <div v-if="authStore.currentUser" class="relative" ref="notificationMenuRef">
            <button @click="toggleNotifications" class="btn-ghost p-2 rounded-lg relative">
              <IconBell class="w-5 h-5" />
              <span v-if="notificationStore.unreadCount > 0"
                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[var(--color-bg-primary)] flex items-center justify-center text-[10px] font-bold text-white px-1">
                {{ notificationStore.unreadCount > 20 ? '20+' : notificationStore.unreadCount }}
              </span>
            </button>

            <!-- Menu déroulant des notifications -->
            <Transition name="slide-down">
              <div v-if="isNotificationMenuOpen" class="fixed left-4 right-4 top-[4.5rem] mt-0 w-auto sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-80 card shadow-xl overflow-hidden z-20">
                <div class="px-4 py-3 border-b flex justify-between items-center bg-[var(--color-bg-secondary)]">
                  <h3 class="font-bold text-sm">Notifications</h3>
                  <NuxtLink to="/notifications" @click="isNotificationMenuOpen = false"
                    class="text-xs text-primary-600 hover:text-primary-700">Voir tout</NuxtLink>
                </div>

                <div class="max-h-80 overflow-y-auto">
                  <div v-if="loadingNotifications" class="p-4 text-center">
                    <IconLoader class="w-6 h-6 animate-spin mx-auto text-primary-500" />
                  </div>
                  <div v-else-if="recentNotifications.length === 0"
                    class="p-8 text-center text-[var(--color-text-secondary)]">
                    <IconBellOff class="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p class="text-xs">Aucune notification.</p>
                  </div>
                  <div v-else>
                    <NuxtLink v-for="notif in recentNotifications" :key="notif.id" :to="`/notifications/${notif.id}`"
                      @click="handleNotificationClick(notif)"
                      class="block p-4 border-b hover:bg-[var(--color-bg-secondary)] transition-colors relative"
                      :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': notif.status === 'unread' }">
                      <div class="flex gap-3">
                        <div class="mt-1">
                          <div class="w-2 h-2 rounded-full"
                            :class="notif.status === 'unread' ? 'bg-blue-500' : 'bg-transparent'"></div>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium line-clamp-1"
                            :class="{ 'text-blue-700 dark:text-blue-300': notif.status === 'unread' }">{{ notif.title }}
                          </p>
                          <p class="text-xs text-[var(--color-text-secondary)] mb-1 line-clamp-2">{{ notif.content }}
                          </p>
                          <p class="text-[10px] text-[var(--color-text-tertiary)]">{{ formatDate(notif.createdAt) }}</p>
                        </div>
                      </div>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Menu utilisateur -->
          <div v-if="authStore.currentUser" class="relative" ref="userMenuRef">
            <button @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center gap-2 btn-ghost px-3 py-2 rounded-lg">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                <img v-if="authStore.currentUser?.photoUrl" :src="authStore.currentUser.photoUrl" alt="Profile" class="w-full h-full object-cover" />
                <span v-else>{{ userInitials }}</span>
              </div>
              <span class="hidden sm:block font-medium">{{ userName }}</span>
              <IconChevronDown class="w-4 h-4" :class="{ 'rotate-180': isUserMenuOpen }" />
            </button>

            <!-- Menu déroulant -->
            <Transition name="slide-down">
              <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-56 card p-2 shadow-lg z-20">
                <div class="px-3 py-2 border-b mb-2">
                  <p class="font-medium text-sm">{{ userName }}</p>
                  <p class="text-xs text-[var(--color-text-secondary)]">{{ authStore.currentUser.email }}</p>
                  <span class="badge badge-info text-xs mt-1">{{ roleLabel }}</span>
                </div>

                <NuxtLink :to="profileLink"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                  @click="isUserMenuOpen = false">
                  <IconUser class="w-4 h-4" />
                  <span class="text-sm">Mon profil</span>
                </NuxtLink>

                <button @click="handleLogout"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                  <IconLogout class="w-4 h-4" />
                  <span class="text-sm">Déconnexion</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Menu mobile -->
          <button v-if="authStore.currentUser" @click="$emit('toggle-mobile-menu')"
            class="lg:hidden btn-ghost p-2 rounded-lg">
            <IconMenu2 v-if="!isSidebarOpen" class="w-6 h-6" />
            <IconX v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconSun, IconMoon, IconChevronDown, IconUser, IconLogout, IconMenu2, IconX, IconBell, IconBellOff, IconLoader } from '@tabler/icons-vue';
import { onClickOutside } from '@vueuse/core';
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notification';
import { useTheme } from '~/composables/useTheme';

const props = defineProps<{
  isSidebarOpen?: boolean;
}>();

const emit = defineEmits(['toggle-mobile-menu']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { isDark, toggleTheme } = useTheme();
const router = useRouter();

const isUserMenuOpen = ref(false);
const isNotificationMenuOpen = ref(false);
const userMenuRef = ref(null);
const notificationMenuRef = ref(null);

const recentNotifications = ref<any[]>([]);
const loadingNotifications = ref(false);

onClickOutside(userMenuRef, () => {
  isUserMenuOpen.value = false;
});

onClickOutside(notificationMenuRef, () => {
  isNotificationMenuOpen.value = false;
});

// Charger le nombre de non-lus au montage
onMounted(() => {
  if (authStore.currentUser) {
    notificationStore.fetchUnreadCount();
    setInterval(() => notificationStore.fetchUnreadCount(), 60000);
  }
});

const toggleNotifications = async () => {
  isNotificationMenuOpen.value = !isNotificationMenuOpen.value;
  if (isNotificationMenuOpen.value) {
    loadingNotifications.value = true;
    recentNotifications.value = await notificationStore.fetchRecentNotifications(5);
    loadingNotifications.value = false;
  }
};

const handleNotificationClick = (notif: any) => {
  isNotificationMenuOpen.value = false;
  notificationStore.markAsRead(notif.id);
};

const formatDate = (date: number) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const userName = computed(() => {
  if (!authStore.currentUser) return '';
  return `${authStore.currentUser.prenom} ${authStore.currentUser.nom}`;
});

const userInitials = computed(() => {
  if (!authStore.currentUser) return '';
  return `${authStore.currentUser.prenom[0]}${authStore.currentUser.nom[0]}`;
});

const roleLabel = computed(() => {
  if (!authStore.currentUser) return '';
  const labels = {
    'incube': 'Incubé',
    'formateur': 'Formateur',
    'formateur_principal': 'Formateur Principal',
    'admin': 'Administrateur',
    'super_admin': 'Super Administrateur',
  };
  return labels[authStore.currentUser.role] || '';
});

const profileLink = computed(() => {
  if (!authStore.currentUser) return '/';

  switch (authStore.currentUser.role) {
    case 'incube': return '/incube/profile';
    case 'formateur': return '/formateur/profile';
    case 'formateur_principal': return '/formateur/profile';
    case 'admin': return '/admin/profile';
    case 'super_admin': return '/admin/profile';
    default: return '/profile';
  }
});

const handleLogout = async () => {
  await authStore.logout();
  isUserMenuOpen.value = false;
  router.push('/auth/login');
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
