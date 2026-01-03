import { defineStore } from 'pinia';

export interface Notification {
  id: string;
  admin: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'unread' | 'read';
  link?: string;
  createdAt: number;
  updatedAt: number;
}

export const useNotificationStore = defineStore('notification', () => {
  const api = useAPI();
  const authStore = useAuthStore();

  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const loadingMore = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);

  const getApiPrefix = () => {
    const role = authStore.currentUser?.role;
    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (role === 'formateur' || role === 'formateur_principal') return '/formateur';
    if (role === 'incube') return '/incube';
    return '';
  };

  /**
   * Récupérer les notifications avec pagination et filtres
   */
  const fetchNotifications = async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const prefix = getApiPrefix();
    if (!prefix) return;

    const isLoadMore = params.page && params.page > 1;

    if (isLoadMore) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    try {
      const response: any = await (api as any)(`${prefix}/notifications`, {
        method: 'GET',
        query: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status
        }
      });

      if (isLoadMore) {
        notifications.value = [...notifications.value, ...response.notifications];
      } else {
        notifications.value = response.notifications;
      }

      // Mettre à jour les métadonnées de pagination
      if (response.meta) {
        currentPage.value = response.meta.page;
        totalPages.value = response.meta.totalPages;
        totalItems.value = response.meta.total;
      }

    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  };

  /**
   * Récupérer les notifications récentes (ex: pour le menu déroulant)
   */
  const fetchRecentNotifications = async (limit = 5) => {
    const prefix = getApiPrefix();
    if (!prefix) return [];

    try {
      const response: any = await (api as any)(`${prefix}/notifications`, {
        method: 'GET',
        query: { page: 1, limit }
      });
      return response.notifications || [];
    } catch (error) {
      console.error("Échec de la récupération des récents", error);
      return [];
    }
  };

  /**
   * Obtenir le nombre total de non-lus
   */
  const fetchUnreadCount = async () => {
    const prefix = getApiPrefix();
    if (!prefix) return;

    try {
      const response: any = await (api as any)(`${prefix}/notifications`, {
        method: 'GET',
        query: { page: 1, limit: 1, status: 'unread' }
      });
      if (response.meta) {
        unreadCount.value = response.meta.total;
      }
    } catch (error) {
      console.error("Échec de la récupération du compte de non-lus", error);
    }
  };

  const fetchNotification = async (id: string) => {
    const prefix = getApiPrefix();
    if (!prefix) throw new Error('Role non défini');

    try {
      const response: any = await (api as any)(`${prefix}/notifications/${id}`);
      return response;
    } catch (error) {
      console.error('Échec de la récupération de la notification', error);
      throw error;
    }
  };

  const markAsRead = async (id: string) => {
    const prefix = getApiPrefix();
    if (!prefix) return;

    try {
      const notif = notifications.value.find(n => n.id === id);
      if (notif && notif.status === 'unread') {
        notif.status = 'read';
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }

      await (api as any)(`${prefix}/notifications/${id}`, {
        method: 'GET'
      });

    } catch (error) {
      console.error('Échec du marquage comme lu', error);
    }
  };

  const deleteNotification = async (id: string) => {
    const prefix = getApiPrefix();
    if (!prefix) return;

    try {
      await (api as any)(`${prefix}/notifications/${id}`, {
        method: 'DELETE'
      });
      notifications.value = notifications.value.filter(n => n.id !== id);
      fetchUnreadCount();
    } catch (error) {
      console.error('Échec de la suppression de la notification', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    const prefix = getApiPrefix();
    if (!prefix) return;

    try {
      await (api as any)(`${prefix}/notifications/mark-all-read`, {
        method: 'PATCH'
      });
      notifications.value.forEach(n => n.status = 'read');
      unreadCount.value = 0;
    } catch (error) {
      console.error('Échec du marquage de tout comme lu', error);
      throw error;
    }
  };

  const bulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteNotification(id)));
    } catch (error) {
      console.error('Échec de la suppression groupée', error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    currentPage,
    totalPages,

    fetchNotifications,
    fetchRecentNotifications,
    fetchUnreadCount,
    fetchNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    bulkDelete
  };
});
