import { defineStore } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import { useUserManagementCore } from '~/composables/useUserManagementCore';
import type { User, UserRole } from '~/types';

export const useAdminStore = defineStore('admin', () => {
  const core = useUserManagementCore();
  const { users, loading, loadUsers, getUserById, getIncubes, fetchIncube } = core;

  const notifyPaymentInfo = async (userId: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/admin/incube/notify-payment/${userId}`, {
        method: 'POST'
      });
      return { success: true, message: 'Notification de paiement envoyée' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur envoi notification' };
    } finally {
      loading.value = false;
    }
  };

  // Charger les admins avec filtres
  const loadAdmins = async (filters: any = {}) => {
    loading.value = true;
    try {
      return await searchAdmins(filters);
    } finally {
      loading.value = false;
    }
  };

  // Rechercher les admins
  const searchAdmins = async (filters: any = {}) => {
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);

      const data = await (api as any)(`/admin/get-admins?${params.toString()}`);
      return data as User[];
    } catch (e) {
      console.error('Error searching admins', e);
      return [];
    }
  };

  // Inviter un admin
  const createAdmin = async (data: { email: string; nom: string; prenom: string; role?: string }) => {
    loading.value = true;
    const api = useAPI();
    try {
      const newAdmin = await (api as any)('/admin/add-admin', {
        method: 'POST',
        body: data
      }) as User;

      users.value.push(newAdmin);
      return { success: true, message: 'Administrateur invité avec succès' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur invitation admin' };
    } finally {
      loading.value = false;
    }
  };

  // Valider une mise à jour d'infos bancaires
  const validateBankUpdate = async (incubeId: string, approve: boolean) => {
    loading.value = true;
    const api = useAPI();
    try {
      const res = await (api as any)(`/admin/incube/validate-bank/${incubeId}`, {
        method: 'PATCH',
        body: { approve }
      });
      return { success: true, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur validation banque' };
    } finally {
      loading.value = false;
    }
  };

  return {
    users: readonly(users),
    loading: readonly(loading),
    loadUsers,
    getUserById,
    getIncubes,
    fetchIncube,
    loadAdmins,
    searchAdmins,
    createAdmin,
    notifyPaymentInfo,
    validateBankUpdate,
  };
});
