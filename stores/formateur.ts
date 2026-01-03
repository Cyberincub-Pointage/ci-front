import type { Evaluation, Warning } from '~/types';

export const useFormateurStore = defineStore('formateur', () => {
  const warnings = ref<Warning[]>([]);
  const loading = ref(false);


  // Récupérer les avertissements
  const fetchWarnings = async (filters: any = {}) => {
    loading.value = true;
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.incubeId) params.append('incubeId', filters.incubeId);

      const data = await (api as any)(`/manager/warnings?${params.toString()}`);
      warnings.value = data as Warning[];
    } catch (e: any) {
      console.error('Error fetching warnings:', e);
    } finally {
      loading.value = false;
    }
  };

  // Créer avertissement
  const createWarning = async (data: Omit<Warning, 'id' | 'createdAt'>) => {
    loading.value = true;
    const api = useAPI();
    try {
      await (api as any)('/formateur/warning', {
        method: 'POST',
        body: data
      });

      // Rafraîchir la liste
      await fetchWarnings();

      return { success: true, message: 'Avertissement envoyé avec succès' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors de l\'envoie de l\'avertissement' };
    } finally {
      loading.value = false;
    }
  };


  // Récupérer un avertissement (détails)
  const fetchWarningDetails = async (id: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      const data = await (api as any)(`/manager/warning/${id}`);
      return data;
    } catch (e: any) {
      console.error('Error fetching warning details:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getWarningsByIncube = (incubeId: string) => {
    return warnings.value
      .filter(w => {
        const wIncubeId = typeof w.incube === 'object' ? (w.incube as any).id : w.incube;
        return wIncubeId === incubeId;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const getWarningsByFormateur = (formateurId: string) => {
    return warnings.value
      .filter(w => {
        const wFormateurId = typeof w.formateur === 'object' ? (w.formateur as any).id : w.formateur;
        return wFormateurId === formateurId;
      });
  };

  // Valider une mise à jour d'équipe
  const validateTeamUpdate = async (incubeId: string, approve: boolean) => {
    loading.value = true;
    const api = useAPI();
    try {
      const res = await (api as any)(`/formateur/incube/validate-team/${incubeId}`, {
        method: 'PATCH',
        body: { approve }
      });
      return { success: true, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur validation équipe' };
    } finally {
      loading.value = false;
    }
  }

  return {
    warnings: readonly(warnings),
    loading: readonly(loading),
    createWarning,
    fetchWarnings,
    fetchWarningDetails,
    getWarningsByIncube,
    getWarningsByFormateur,
    validateTeamUpdate,
  };
});
