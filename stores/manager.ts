import { defineStore } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import { useUserManagementCore } from '~/composables/useUserManagementCore';
import type { User, UserRole } from '~/types';

export const useManagerStore = defineStore('manager', () => {
  const core = useUserManagementCore();

  // Déstructurer le core mais garder la réactivité
  const { users, loading, loadUsers, getUserById, searchIncubes, fetchIncube, searchFormateurs, fetchFormateur, sendIncubeAlert, getIncubes } = core;

  // Basculer le statut d'une formateur
  const toggleFormStatus = async (formateurId: string, currentStatus: string, background = false) => {
    if (!background) loading.value = true;
    const api = useAPI();
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

      const updated = await (api as any)(`/manager/update-formateur-status/${formateurId}`, {
        method: 'PATCH',
        body: { status: newStatus }
      }) as User;

      const index = users.value.findIndex(u => u.id === formateurId);
      if (index !== -1) users.value[index] = { ...users.value[index], status: updated.status };

      return { success: true, message: updated.status === 'active' ? 'Formateur activé' : 'Formateur suspendu' };

    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors de la mise à jour' };
    } finally {
      if (!background) loading.value = false;
    }
  };

  // Basculer le statut d'un incubé
  const toggleIncubeStatus = async (incubeId: string, currentStatus: string, background = false) => {
    if (!background) loading.value = true;
    const api = useAPI();
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

      const updated = await (api as any)(`/manager/update-incube-status/${incubeId}`, {
        method: 'PATCH',
        body: { status: newStatus }
      }) as User;

      const index = users.value.findIndex(u => u.id === incubeId);
      if (index !== -1) users.value[index] = { ...users.value[index], status: updated.status };

      return { success: true, message: updated.status === 'active' ? 'Incubé activé' : 'Incubé suspendu' };

    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors de la mise à jour' };
    } finally {
      if (!background) loading.value = false;
    }
  };

  // Créer un formateur
  const createFormateur = async (data: { email: string; nom: string; prenom: string; role?: string }) => {
    loading.value = true;
    const api = useAPI();
    try {
      const newFormateur = await (api as any)('/manager/add-formateur', {
        method: 'POST',
        body: data
      }) as User;

      users.value.push(newFormateur);
      return { success: true, message: 'Formateur créé avec succès' };
    } catch (e: any) {
      let message = 'Erreur création formateur';

      if (e.statusCode === 409) {
        message = "L'adresse email fournie est déjà utilisée.";
      } else if (e.data) {
        if (typeof e.data === 'string') message = e.data;
        else if (e.data.message) message = e.data.message;
        else if (e.data.emailAlreadyInUse) message = "L'adresse email fournie est déjà utilisée.";
      }
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  // Changer le rôle d'un utilisateur
  const updateFormRole = async (userId: string, newRole: UserRole, background = false) => {
    if (!background) loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/manager/update-formateur-role/${userId}`, {
        method: 'PATCH',
        body: { role: newRole }
      });

      const index = users.value.findIndex(u => u.id === userId);
      if (index !== -1) users.value[index].role = newRole;

      return { success: true, message: 'Rôle mis à jour' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur mise à jour rôle' };
    } finally {
      if (!background) loading.value = false;
    }
  };

  const sendFormAlert = async (userId: string, message: string, background = false) => {
    if (!background) loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/manager/formateur/${userId}/alert`, {
        method: 'POST',
        body: { message }
      });
      return { success: true, message: 'Alerte envoyée au formateur' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur envoi alerte' };
    } finally {
      if (!background) loading.value = false;
    }
  };

  // Charger les incubés avec filtres
  const loadIncubes = async (filters: any = {}) => {
    loading.value = true;
    try {
      return await searchIncubes(filters);
    } finally {
      loading.value = false;
    }
  };

  // Charger les formateurs avec filtres
  const loadFormateurs = async (filters: any = {}) => {
    loading.value = true;
    try {
      return await searchFormateurs(filters);
    } finally {
      loading.value = false;
    }
  };

  const resendInvitation = async (id: string, background = false) => {
    if (!background) loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/manager/resend-formateur-invite/${id}`, { method: 'POST' });
      return { success: true, message: 'Invitation renvoyée avec succès' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || "Erreur lors de l'envoi" };
    } finally {
      if (!background) loading.value = false;
    }
  }

  // Valider une mise à jour d'équipe (Formateur)
  const validateTeamUpdate = async (incubeId: string, approve: boolean) => {
    loading.value = true;
    const api = useAPI();
    try {
      const res = await (api as any)(`/formateur/validate-team/incube/${incubeId}`, {
        method: 'POST',
        body: { approve }
      });
      return { success: true, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur validation équipe' };
    } finally {
      loading.value = false;
    }
  };

  return {
    users: readonly(users),
    loading: readonly(loading),
    loadUsers,
    loadFormateurs,
    getUserById,
    toggleFormStatus,
    toggleIncubeStatus,
    updateFormRole,
    createFormateur,
    resendInvitation,
    getIncubes,
    loadIncubes,
    searchIncubes,
    fetchIncube,
    searchFormateurs,
    fetchFormateur,
    sendFormAlert,
    sendIncubeAlert,
    validateTeamUpdate
  };
});
