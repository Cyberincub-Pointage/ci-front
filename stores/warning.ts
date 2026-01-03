import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Warning } from '~/types';

export const useWarningStore = defineStore('warning', () => {
  const warnings = ref<Warning[]>([]);
  const currentWarning = ref<Warning | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Récupérer mes avertissements (Incubé)
  const fetchMyWarnings = async () => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const data = await (api as any)('/incube/warnings');
      warnings.value = data as Warning[];
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des avertissements';
      console.error('Error fetching my warnings:', e);
    } finally {
      loading.value = false;
    }
  };

  // Récupérer les détails d'un avertissement (Incubé)
  const fetchWarningDetails = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentWarning.value = null;
    const api = useAPI();
    try {
      const data = await (api as any)(`/incube/warning/${id}`);
      currentWarning.value = data as Warning;
      return data;
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement de l\'avertissement';
      console.error('Error fetching warning details:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Getters / Computed
  const unreadCount = computed(() => {
    // En attendant l'implémentation de viewedAt, on retourne simplement le total pour l'instant
    return warnings.value.length;
  });

  return {
    warnings,
    currentWarning,
    loading,
    error,
    fetchMyWarnings,
    fetchWarningDetails,
    unreadCount
  };
});
