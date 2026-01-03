<template>
  <AppBreadcrumb :items="[{ label: 'Notifications' }]" class="mb-6" />

  <div class="space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 sticky top-20 z-10 border border-gray-100 dark:border-gray-700 gap-4"
      v-if="selectedNotifications.size > 0">
      <div class="flex items-center gap-4">
        <span class="font-medium">{{ selectedNotifications.size }} sélectionné(s)</span>
        <button @click="clearSelection" class="btn btn-ghost btn-sm">Annuler</button>
      </div>
      <button @click="handleBulkDelete" class="btn btn-error btn-sm text-white gap-2 w-full md:w-auto justify-center">
        <IconTrash class="w-4 h-4" />
        Supprimer la sélection
      </button>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" v-else>
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">Notifications</h1>
        <p class="text-[var(--color-text-secondary)] mt-1">Gérez vos alertes et messages système</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <button @click="markAllRead" class="btn btn-ghost btn-sm w-full sm:w-auto justify-center" v-if="hasUnread">
          <IconCheck class="w-4 h-4 mr-1" /> Tout marquer comme lu
        </button>
        <div class="relative group w-full sm:w-auto">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconFilter class="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
          </div>
          <select v-model="filterStatus" @change="refresh"
            class="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm cursor-pointer w-full sm:w-[200px]">
            <option value="">Tous</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <IconChevronDown class="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="notificationStore.loading" class="space-y-4">
      <div v-for="i in 5" :key="i"
        class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <AppSkeleton type="circle" class="w-10 h-10" />
        <div class="flex-1 space-y-2">
          <AppSkeleton class="w-3/4 h-4" />
          <AppSkeleton class="w-1/2 h-3" />
        </div>
      </div>
    </div>

    <!-- Liste -->
    <div v-else-if="notificationStore.notifications.length > 0"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- En-tête de liste (optionnel pour sélection multiple) -->
      <div v-for="notif in notificationStore.notifications" :key="notif.id"
        class="group relative border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': notif.status === 'unread' }">

        <div class="flex items-center p-3 sm:p-4 gap-3 sm:gap-4 cursor-pointer" @click="navigateTo(notif)">
          <!-- Case à cocher de sélection -->
          <div class="flex items-center justify-center -ml-1 sm:ml-0" @click.stop>
            <label class="cursor-pointer p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <input type="checkbox" :checked="selectedNotifications.has(notif.id)" @change="toggleSelection(notif.id)"
                class="checkbox checkbox-sm checkbox-primary rounded w-4 h-4 sm:w-5 sm:h-5" />
            </label>
          </div>

          <!-- Icône de type/priorité -->
          <div class="flex-shrink-0"
            :class="{ 'text-blue-500': notif.priority === 'normal', 'text-amber-500': notif.priority === 'high', 'text-red-500': notif.priority === 'urgent', 'text-gray-400': notif.priority === 'low' }">
            <IconInfoCircle v-if="notif.priority === 'normal'" class="w-5 h-5 sm:w-6 sm:h-6" />
            <IconAlertTriangle v-else-if="notif.priority === 'high'" class="w-5 h-5 sm:w-6 sm:h-6" />
            <IconAlertCircle v-else-if="notif.priority === 'urgent'" class="w-5 h-5 sm:w-6 sm:h-6" />
            <IconInfoCircle v-else class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <!-- Content -->
          <div
            class="flex-1 min-w-0 pr-0 md:pr-0 grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-4 items-start md:items-center">
            <div class="font-medium truncate md:col-span-1"
              :class="{ 'text-gray-900 dark:text-white font-bold': notif.status === 'unread', 'text-gray-700 dark:text-gray-300': notif.status === 'read' }">
              {{ notif.title }}
            </div>
            <div class="text-sm text-[var(--color-text-secondary)] truncate md:col-span-2 order-last md:order-none">
              {{ notif.content }}
            </div>
            <div class="text-xs text-[var(--color-text-tertiary)] md:text-right md:col-span-1 whitespace-nowrap">
              {{ formatDate(notif.createdAt) }}
            </div>
          </div>

          <!-- Actions rapides (Visible au survol sur Desktop) -->
          <div
            class="hidden sm:flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur pl-2">
            <button v-if="notif.status === 'unread'" @click.stop="handleRead(notif)"
              class="btn btn-ghost btn-sm btn-circle" title="Marquer comme lu">
              <IconCheck class="w-4 h-4 text-gray-500 hover:text-primary-600" />
            </button>
            <button @click.stop="handleDelete(notif.id)"
              class="btn btn-ghost btn-sm btn-circle text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Supprimer">
              <IconTrash class="w-4 h-4" />
            </button>
            <button class="btn btn-ghost btn-sm btn-circle text-gray-400 hover:text-primary-600" title="Voir">
              <IconArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else
      class="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
      <IconBellOff class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-medium text-[var(--color-text-primary)]">Aucune notification</h3>
      <p class="text-[var(--color-text-secondary)] mt-1">Vous n'avez pas de notifications pour le moment.</p>
    </div>

    <!-- Pagination / Charger plus -->
    <div v-if="notificationStore.totalPages > 1" class="flex justify-center pt-6">
      <div class="join">
        <button class="join-item btn" :disabled="page === 1" @click="changePage(page - 1)">«</button>
        <button class="join-item btn">Page {{ page }}</button>
        <button class="join-item btn" :disabled="page >= notificationStore.totalPages"
          @click="changePage(page + 1)">»</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconInfoCircle, IconAlertTriangle, IconAlertCircle, IconCheck, IconTrash, IconArrowRight, IconBellOff, IconFilter, IconChevronDown } from '@tabler/icons-vue';

import type { Notification as AppNotification } from '@/stores/notification';

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['admin', 'super_admin', 'formateur', 'formateur_principal', 'incube']
});

useHead({
  title: 'Notifications',
  meta: [
    {
      name: 'description',
      content: "Gérez vos alertes et messages système."
    }
  ]
});

const notificationStore = useNotificationStore();
const filterStatus = ref('');
const page = ref(1);
const selectedNotifications = ref(new Set<string>());

const hasUnread = computed(() => {
  return notificationStore.notifications.some(n => n.status === 'unread');
});

onMounted(() => {
  refresh();
});

const refresh = () => {
  page.value = 1;
  clearSelection();
  loadData();
};

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > notificationStore.totalPages) return;
  page.value = newPage;
  loadData();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const loadData = () => {
  notificationStore.fetchNotifications({
    page: page.value,
    limit: 10,
    status: filterStatus.value || undefined
  });
};

const handleRead = (notif: AppNotification) => {
  if (notif.status === 'unread') {
    notificationStore.markAsRead(notif.id);
  }
};

const markAllRead = async () => {
  try {
    await notificationStore.markAllAsRead();
    useToast().success('Toutes les notifications ont été marquées comme lues');
  } catch (e) {
    useToast().error('Erreur lors de l\'opération');
  }
};

const handleDelete = async (id: string) => {
  if (await useConfirm().confirm('Supprimer cette notification ?')) {
    try {
      await notificationStore.deleteNotification(id);
      useToast().success('Notification supprimée');
    } catch (e) {
      useToast().error('Erreur lors de la suppression');
    }
  }
};

const toggleSelection = (id: string) => {
  if (selectedNotifications.value.has(id)) {
    selectedNotifications.value.delete(id);
  } else {
    selectedNotifications.value.add(id);
  }
};

const clearSelection = () => {
  selectedNotifications.value.clear();
};

const handleBulkDelete = async () => {
  if (selectedNotifications.value.size === 0) return;

  if (await useConfirm().confirm(`Supprimer ces ${selectedNotifications.value.size} notifications ?`)) {
    try {
      await notificationStore.bulkDelete(Array.from(selectedNotifications.value));
      useToast().success(`${selectedNotifications.value.size} notifications supprimées`);
      clearSelection();
    } catch (e) {
      useToast().error('Erreur lors de la suppression groupée');
    }
  }
};

const navigateTo = (notif: AppNotification) => {
  handleRead(notif);
  useRouter().push(`/notifications/${notif.id}`);
};

const formatDate = (date: number) => {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
};
</script>
