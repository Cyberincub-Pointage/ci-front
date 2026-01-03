import { defineStore } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import type { PermissionRequest } from '~/types';

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<PermissionRequest[]>([]);
  const currentPermission = ref<PermissionRequest | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ============================================
  // ACTIONS INCUBÉ
  // ============================================

  /**
   * Récupérer toutes les permissions de l'incubé connecté
   */
  const fetchMyPermissions = async () => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const data = await (api as any)('/incube/permission/my');
      permissions.value = data as PermissionRequest[];
    } catch (e: any) {
      console.error('Error fetching my permissions', e);
      error.value = e.data?.message || 'Erreur lors du chargement des permissions';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer une permission spécifique de l'incubé
   */
  const fetchPermission = async (id: string) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const data = await (api as any)(`/incube/permission/${id}`);
      currentPermission.value = data as PermissionRequest;
      return data;
    } catch (e: any) {
      console.error('Error fetching permission', e);
      error.value = e.data?.message || 'Erreur lors du chargement de la permission';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Créer une nouvelle demande de permission
   */
  const requestPermission = async (data: {
    type: string;
    motif: string;
    dateDebut: string;
    dateFin?: string;
  }) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const result = await (api as any)('/incube/permission/request', {
        method: 'POST',
        body: data
      });

      // Rafraîchir la liste
      await fetchMyPermissions();

      return { success: true, message: 'Demande de permission créée avec succès', data: result };
    } catch (e: any) {
      console.error('Error requesting permission', e);
      error.value = e.data?.message || 'Erreur lors de la création de la permission';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // ACTIONS FORMATEUR
  // ============================================

  /**
   * Récupérer toutes les permissions avec filtres optionnels
   */
  const fetchAllPermissions = async (filters?: { status?: string; type?: string; incubeId?: string }) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.incubeId) params.append('incubeId', filters.incubeId);

      const data = await (api as any)(`/formateur/incube/permissions?${params.toString()}`);
      permissions.value = data as PermissionRequest[];
    } catch (e: any) {
      console.error('Error fetching all permissions', e);
      error.value = e.data?.message || 'Erreur lors du chargement des permissions';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer une permission spécifique (formateur)
   */
  const fetchPermissionAsFormateur = async (permissionId: string) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      // Fetch specific permission using the new endpoint
      const data = await (api as any)(`/formateur/incube/permission/${permissionId}`);

      currentPermission.value = data as PermissionRequest;
      return data;
    } catch (e: any) {
      console.error('Error fetching permission as formateur', e);
      error.value = e.data?.message || 'Erreur lors du chargement de la permission';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Marquer une permission comme vue
   */
  const markAsViewed = async (permissionId: string) => {
    const api = useAPI();
    try {
      await (api as any)(`/formateur/incube/permission/${permissionId}/view`, {
        method: 'PATCH'
      });

      await fetchAllPermissions();

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors du marquage' };
    }
  };

  /**
   * Traiter une permission (approuver ou rejeter)
   */
  const processPermission = async (
    permissionId: string,
    approved: boolean,
    rejectionReason?: string
  ) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      await (api as any)(`/formateur/incube/permission/${permissionId}/process`, {
        method: 'PATCH',
        body: { approved, rejectionReason }
      });

      // Mettre à jour localement
      const index = permissions.value.findIndex(p => p.id === permissionId);
      if (index !== -1) {
        permissions.value[index].status = approved ? 'approved' : 'rejected';
        permissions.value[index].processedAt = new Date().toISOString();
        if (!approved && rejectionReason) {
          permissions.value[index].rejectionReason = rejectionReason;
        }
      }
      if (currentPermission.value?.id === permissionId) {
        currentPermission.value.status = approved ? 'approved' : 'rejected';
        currentPermission.value.processedAt = new Date().toISOString();
        if (!approved && rejectionReason) {
          currentPermission.value.rejectionReason = rejectionReason;
        }
      }

      return {
        success: true,
        message: approved ? 'Permission approuvée avec succès' : 'Permission rejetée'
      };
    } catch (e: any) {
      error.value = e.data?.message || 'Erreur lors du traitement de la permission';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // ============================================
  // GETTERS
  // ============================================

  const pendingCount = computed(() =>
    permissions.value.filter(p => p.status === 'pending').length
  );

  const viewedCount = computed(() =>
    permissions.value.filter(p => p.status === 'viewed').length
  );

  const approvedCount = computed(() =>
    permissions.value.filter(p => p.status === 'approved').length
  );

  const rejectedCount = computed(() =>
    permissions.value.filter(p => p.status === 'rejected').length
  );

  const permissionsByType = (type: string) =>
    permissions.value.filter(p => p.type === type);

  const permissionsByStatus = (status: string) =>
    permissions.value.filter(p => p.status === status);

  return {
    // State
    permissions: readonly(permissions),
    currentPermission: readonly(currentPermission),
    loading: readonly(loading),
    error: readonly(error),

    // Actions Incubé
    fetchMyPermissions,
    fetchPermission,
    requestPermission,

    // Actions Formateur
    fetchAllPermissions,
    fetchPermissionAsFormateur,
    markAsViewed,
    processPermission,

    // Getters
    pendingCount,
    viewedCount,
    approvedCount,
    rejectedCount,
    permissionsByType,
    permissionsByStatus,

    // Permission Email Actions
    getPermissionEmail: async () => {
      const api = useAPI();
      return await (api as any)('/formateur/permission/email');
    },
    updatePermissionEmail: async (email: string) => {
      const api = useAPI();
      return await (api as any)('/formateur/permission/email', {
        method: 'PUT',
        body: { email }
      });
    }
  };
});
