<template>
  <div class="max-w-3xl mx-auto">
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Notifications', to: '/notifications' },
      { label: notification?.title || 'Détails' }
    ]" class="mb-6" />

    <!-- État de chargement -->
    <div v-if="loading" class="py-20 flex flex-col gap-4 max-w-2xl mx-auto">
      <AppSkeleton class="w-full h-8" />
      <AppSkeleton class="w-1/2 h-4" />
      <AppSkeleton class="w-full h-32 mt-4" />
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="card p-8 text-center border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
      <IconAlertCircle class="w-12 h-12 mx-auto mb-4 text-red-500" />
      <h3 class="text-xl font-bold text-red-700 dark:text-red-400">Erreur</h3>
      <p class="text-[var(--color-text-secondary)] mt-2">{{ error }}</p>
      <button @click="router.push('/notifications')" class="btn btn-outline mt-6">Retour</button>
    </div>

    <!-- Contenu de la notification -->
    <div v-else-if="notification" class="card overflow-hidden">
      <div class="border-b bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-between items-start">
        <div class="flex flex-col sm:flex-row gap-4 w-full">
          <div class="p-3 rounded-xl self-start" :class="getPriorityClasses(notification.priority)">
            <IconInfoCircle v-if="notification.priority === 'normal'" class="w-6 h-6" />
            <IconAlertTriangle v-else-if="notification.priority === 'high'" class="w-6 h-6" />
            <IconAlertCircle v-else-if="notification.priority === 'urgent'" class="w-6 h-6" />
            <IconInfoCircle v-else class="w-6 h-6" />
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold mb-2 break-words">{{ notification.title }}</h1>
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center text-sm text-[var(--color-text-secondary)] gap-2 sm:gap-4">
              <span class="flex items-center">
                <IconCalendar class="w-4 h-4 mr-1" /> {{ formatDate(notification.createdAt) }}
              </span>
              <span v-if="notification.status === 'read'" class="badge badge-success text-xs">Lu</span>
              <span v-else class="badge badge-warning text-xs">Non lu</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8">
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-lg whitespace-pre-wrap">{{ notification.content }}</p>

          <div class="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div v-if="notification.link" class="w-full sm:w-auto">
              <NuxtLink :to="notification.link" class="btn btn-primary w-full sm:w-auto justify-center">
                Voir le détail
                <IconArrowRight class="w-4 h-4 ml-2" />
              </NuxtLink>
            </div>
            <div v-else></div> <!-- Espaceur -->

            <button @click="handleDelete" class="btn btn-error text-white w-full sm:w-auto justify-center">
              <IconTrash class="w-4 h-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconLoader, IconAlertCircle, IconInfoCircle, IconAlertTriangle, IconCalendar, IconArrowRight, IconTrash } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['admin', 'super_admin', 'formateur', 'formateur_principal', 'incube']
});

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const loading = ref(true);
const error = ref('');
const notification = ref<any>(null);

useHead({
  title: computed(() => notification.value ? `${notification.value.title} - Notification` : 'Détails notification'),
  meta: [
    {
      name: 'description',
      content: "Détails de la notification système."
    }
  ]
});

onMounted(async () => {
  const id = route.params.id as string;
  if (!id) {
    error.value = "Identifiant manquant";
    loading.value = false;
    return;
  }

  try {
    // Récupérer les détails via le store qui gère les préfixes dynamiquement
    const data = await notificationStore.fetchNotification(id);
    notification.value = data;

    // Mettre à jour l'état du store
    if (data.status === 'unread') {
      const storeNotif = notificationStore.notifications.find(n => n.id === id);
      if (storeNotif) {
        storeNotif.status = 'read';
        notificationStore.unreadCount = Math.max(0, notificationStore.unreadCount - 1);
      } else {
        // Optionnel: rafraîchir le compteur si la notif n'est pas dans la liste actuelle
        notificationStore.fetchUnreadCount();
      }
    }

  } catch (e: any) {
    error.value = e.message || "Impossible de charger la notification";
  } finally {
    loading.value = false;
  }
});

const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'normal': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'high': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'urgent': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'low': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

const formatDate = (date: number) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
const handleDelete = async () => {
  if (await useConfirm().confirm({
    message: 'Voulez-vous vraiment supprimer cette notification ?',
    type: 'danger',
    confirmLabel: 'Supprimer',
    title: 'Suppression'
  })) {
    try {
      await notificationStore.deleteNotification(route.params.id as string);
      useToast().success('Notification supprimée');
      router.push('/notifications');
    } catch (e) {
      useToast().error('Erreur lors de la suppression');
    }
  }
};
</script>
