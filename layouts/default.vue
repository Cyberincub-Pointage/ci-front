<template>
  <div class="min-h-screen bg-[var(--color-bg-secondary)] pt-16">
    <AppHeader :isSidebarOpen="isSidebarOpen" @toggle-mobile-menu="isSidebarOpen = !isSidebarOpen" />
    <div class="flex">
      <AppToast />
      <AppConfirmModal />
      <AppSidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" @update:collapsed="handleSidebarCollapse" />

      <main class="flex-1 p-4 md:p-6 transition-all duration-300" :class="isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { usePresenceStore } from '~/stores/presence';
import { useEntitiesStore } from '~/stores/entities';

// Ouverture et réduction de la barre latérale
const isSidebarOpen = ref(false); // Mobile
const isSidebarCollapsed = ref(false); // Desktop

// Initialisation des stores
const authStore = useAuthStore();
const presenceStore = usePresenceStore();
const entitiesStore = useEntitiesStore();

// Gestionnaire pour la réduction de la barre latérale
const handleSidebarCollapse = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed;
};

// Chargement des données initiales
onMounted(async () => {
  authStore.loadUser();
  presenceStore.fetchPresences();
  await entitiesStore.loadEntities();

  // Restauration de l'état de la barre latérale depuis le localStorage
  const savedState = localStorage.getItem('sidebar_collapsed');
  if (savedState === 'true') {
    isSidebarCollapsed.value = true;
  }
});
</script>
