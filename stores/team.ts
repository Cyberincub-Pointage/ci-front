import { defineStore } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import type { Equipe } from '~/types';

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Equipe[]>([]);
  const currentTeam = ref<Equipe | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Récupérer toutes les équipes
  const fetchTeams = async () => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const data = await api('/users/teams');
      teams.value = (data as any[]).map(t => ({
        ...t,
        formateurId: t.formateur?.id || t.formateur
      })) as Equipe[];
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des équipes';
      console.error('Error loading teams:', e);
    } finally {
      loading.value = false;
    }
  };

  // Récupérer une équipe par ID
  const fetchTeam = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentTeam.value = null;
    try {
      const api = useAPI();
      const data: any = await api(`/users/teams/${id}`);
      const team = {
        ...data,
        formateurId: data.formateur?.id || data.formateur
      };
      currentTeam.value = team as Equipe;
      return team as Equipe;
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement de l\'équipe';
      console.error('Error loading team:', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Créer une nouvelle équipe
  const createTeam = async (data: Partial<Equipe>) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const newTeam = await api('/admin/teams', {
        method: 'POST',
        body: data,
      });
      teams.value.push(newTeam as Equipe);
      return { success: true, data: newTeam };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la création de l\'équipe';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Mettre à jour une équipe existante
  const updateTeam = async (id: string, data: Partial<Equipe>) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const updatedTeam = await api(`/admin/teams/${id}`, {
        method: 'PATCH',
        body: data,
      });

      const index = teams.value.findIndex(t => t.id === id);
      if (index !== -1) {
        teams.value[index] = updatedTeam as Equipe;
      }
      if (currentTeam.value && currentTeam.value.id === id) {
        currentTeam.value = updatedTeam as Equipe;
      }
      return { success: true, data: updatedTeam };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour de l\'équipe';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Supprimer une équipe
  const deleteTeam = async (id: string) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      await api(`/admin/teams/${id}`, {
        method: 'DELETE',
      });
      teams.value = teams.value.filter(t => t.id !== id);
      if (currentTeam.value && currentTeam.value.id === id) {
        currentTeam.value = null;
      }
      return { success: true };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la suppression de l\'équipe';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    teams,
    currentTeam,
    loading,
    error,
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
  };
});
