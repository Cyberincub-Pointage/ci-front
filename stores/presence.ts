import { defineStore, storeToRefs } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import type { Presence, RetroPresenceRequest } from '~/types';

export const usePresenceStore = defineStore('presence', () => {
  const presences = ref<Presence[]>([]);
  const retroRequests = ref<RetroPresenceRequest[]>([]);
  const currentDailyAmount = ref(4500);
  const dailyAmountHistory = ref<any[]>([]);
  const loading = ref(false);

  const config = useRuntimeConfig();

  // Charger le montant journalier actuel
  const fetchCurrentDailyAmount = async () => {
    const api = useAPI();
    try {
      const data: any = await (api as any)('/users/get-daily-amount');
      if (data && data.amount) {
        currentDailyAmount.value = data.amount;
      }
    } catch (e) {
      console.error('Error fetching daily amount', e);
    }
  };

  // Charger l'historique du montant journalier
  const fetchDailyAmountHistory = async () => {
    const api = useAPI();
    loading.value = true;
    try {
      const data: any = await (api as any)('/admin/daily-amount/history');
      if (data) {
        dailyAmountHistory.value = data;
      }
    } catch (e) {
      console.error('Error fetching daily amount history', e);
    } finally {
      loading.value = false;
    }
  };

  // Charger mes présences (Incubé)
  const fetchMyPresences = async (filters: any = {}) => {
    loading.value = true;
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const data = await (api as any)(`/incube/presence/my?${params.toString()}`);
      presences.value = (data as any[]).map(p => ({
        ...p,
        incubeId: p.incube?.id || (typeof p.incube === 'string' ? p.incube : p.incubeId)
      }));
    } catch (e) {
      console.error('Error fetching my presences', e);
    } finally {
      loading.value = false;
    }
  };

  // Charger MES demandes rétro (Incubé)
  const fetchMyRetroRequests = async () => {
    loading.value = true;
    const api = useAPI();
    try {
      const data = await (api as any)(`/incube/presence/my-retro`);
      retroRequests.value = (data as any[]).map(r => ({
        ...r,
        incubeId: r.incube?.id || (typeof r.incube === 'string' ? r.incube : r.incubeId)
      }));
    } catch (e) {
      console.error('Error fetching my retro requests', e);
    } finally {
      loading.value = false;
    }
  };


  // Charger les présences depuis l'API (Admin/Formateur)
  const fetchPresences = async (filters: any = {}) => {
    loading.value = true;
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.incubeId) params.append('incubeId', filters.incubeId);
      if (filters.status) params.append('status', filters.status);

      const data = await (api as any)(`/manager/presence/all?${params.toString()}`);
      presences.value = (data as any[]).map(p => ({
        ...p,
        incubeId: p.incube?.id || (typeof p.incube === 'string' ? p.incube : p.incubeId)
      }));
    } catch (e) {
      console.error('Error fetching presences', e);
    } finally {
      loading.value = false;
    }
  };

  // Charger les demandes rétroactives (Admin/Formateur)
  const fetchRetroRequests = async (filters: any = {}) => {
    loading.value = true;
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.incubeId) params.append('incubeId', filters.incubeId);
      if (filters.status) params.append('status', filters.status);

      const data = await (api as any)(`/manager/presence/retro-requests?${params.toString()}`);
      retroRequests.value = (data as any[]).map(r => ({
        ...r,
        incubeId: r.incube?.id || (typeof r.incube === 'string' ? r.incube : r.incubeId)
      }));
    } catch (e) {
      console.error('Error fetching retro requests', e);
    } finally {
      loading.value = false;
    }
  };

  // État de la géolocalisation
  const isInAllowedZone = ref(false);
  const geoCoordinates = ref({ latitude: 0, longitude: 0 });
  const isCheckingZone = ref(false);
  const geoError = ref<string | null>(null);
  const distanceToZone = ref(0);
  const zoneRadius = ref(0);

  // Vérifier la géolocalisation
  const checkGeolocation = async (): Promise<boolean> => {
    isCheckingZone.value = true;
    geoError.value = null;

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        geoError.value = "La géolocalisation n'est pas supportée par votre navigateur.";
        isCheckingZone.value = false;
        isInAllowedZone.value = false;
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          geoCoordinates.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          const api = useAPI();
          try {
            const response: any = await (api as any)('/incube/presence/check-zone', {
              method: 'POST',
              body: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });

            isInAllowedZone.value = response.isInZone;
            distanceToZone.value = response.distance;
            zoneRadius.value = response.allowedRadius;
            // console.log(`Backend Distance Check: InZone=${response.isInZone}, Distance=${response.distance}m`);
          } catch (e: any) {
            console.error("Check zone API error:", e);
            isInAllowedZone.value = false;
            geoError.value = "Erreur lors de la vérification de la zone.";
          } finally {
            isCheckingZone.value = false;
            resolve(isInAllowedZone.value);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          geoError.value = "Impossible de récupérer votre position. Veuillez autoriser la géolocalisation.";
          isCheckingZone.value = false;
          isInAllowedZone.value = false;
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Marquer présence
  const markPresence = async (incubeId: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      const payload = {
        isGeolocValid: isInAllowedZone.value,
        latitude: geoCoordinates.value.latitude,
        longitude: geoCoordinates.value.longitude
      };

      await (api as any)('/incube/presence/mark', {
        method: 'POST',
        body: payload
      });
      const today = new Date().toISOString().split('T')[0];
      await fetchMyPresences({ startDate: today, endDate: today });

      return { success: true, message: 'Présence marquée avec succès' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || e.message || 'Erreur lors du marquage' };
    } finally {
      loading.value = false;
    }
  };

  // Demande de rétro-présence
  const requestRetroPresence = async (incubeId: string, date: string, motif: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      await (api as any)('/incube/presence/request-retro', {
        method: 'POST',
        body: { date, motif }
      });

      // Rafraîchir
      await fetchMyRetroRequests();

      return { success: true, message: 'Demande soumise avec succès' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors de la demande' };
    } finally {
      loading.value = false;
    }
  };

  // Valider présence (formateur)
  const validatePresence = async (presenceId: string, formateurId: string, approved: boolean, reason?: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/formateur/incube/validate-presence/${presenceId}`, {
        method: 'PATCH',
        body: { approved, reason }
      });

      // Mettre à jour l'état local directement pour une UI réactive
      const index = presences.value.findIndex(p => p.id === presenceId);
      if (index !== -1) {
        presences.value[index].status = approved ? 'validated' : 'rejected';
        if (!approved && reason) presences.value[index].rejectionReason = reason;
      }

      return { success: true, message: approved ? 'Présence validée' : 'Présence refusée' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors de validation' };
    } finally {
      loading.value = false;
    }
  };

  // Valider demande rétro-présence
  const validateRetroRequest = async (requestId: string, formateurId: string, approved: boolean, reason?: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/formateur/incube/validate-retro/${requestId}`, {
        method: 'PATCH',
        body: { approved, reason }
      });

      await fetchRetroRequests();
      await fetchPresences();

      return { success: true, message: approved ? 'Demande approuvée' : 'Demande refusée' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur validation' };
    } finally {
      loading.value = false;
    }
  };

  // Marquer comme payé
  const markAsPaid = async (presenceId: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/admin/incube/presence-mark-paid/${presenceId}`, { method: 'PATCH' });

      const index = presences.value.findIndex(p => p.id === presenceId);
      if (index !== -1) {
        presences.value[index].paymentStatus = 'paid';
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur lors du paiement' };
    } finally {
      loading.value = false;
    }
  };

  // Getters - conserve la même logique mais sur les données récupérées
  const getPresencesByIncube = (incubeId: string) => {
    return presences.value.filter(p => p.incubeId === incubeId || (p.incube && (p.incube as any).id === incubeId) || (typeof p.incube === 'object' && (p.incube as any).id === incubeId)).sort((a, b) => b.date.localeCompare(a.date));
  };

  const getPresencesToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return presences.value.filter(p => p.date === today);
  };

  const getPendingPresences = () => {
    return presences.value.filter(p => p.status === 'pending');
  };

  const getPendingRetroRequests = () => {
    return retroRequests.value.filter(r => r.status === 'pending');
  };

  const getTotalAmountByIncube = (incubeId: string) => {
    return presences.value
      .filter(p => {
        const pIncubeId = (typeof p.incube === 'object' ? (p.incube as any).id : p.incube) || p.incubeId;
        return pIncubeId === incubeId && p.status === 'validated';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getUnpaidPresences = () => {
    return presences.value.filter(p => p.status === 'validated' && p.paymentStatus === 'unpaid');
  };

  return {
    presences: readonly(presences),
    retroRequests: readonly(retroRequests),
    currentDailyAmount: readonly(currentDailyAmount),
    dailyAmountHistory: readonly(dailyAmountHistory),
    loading: readonly(loading),
    isInAllowedZone: readonly(isInAllowedZone),
    geoCoordinates: readonly(geoCoordinates),
    isCheckingZone: readonly(isCheckingZone),
    geoError: readonly(geoError),
    distanceToZone: readonly(distanceToZone),
    zoneRadius: readonly(zoneRadius),
    fetchCurrentDailyAmount,
    fetchDailyAmountHistory,
    fetchPresences,
    fetchMyPresences,
    fetchMyRetroRequests,
    fetchRetroRequests,
    markPresence,
    requestRetroPresence,
    validatePresence,
    validateRetroRequest,
    markAsPaid,
    checkGeolocation,
    getPresencesByIncube,
    getPresencesToday,
    getPendingPresences,
    getPendingRetroRequests,
    getTotalAmountByIncube,
    getUnpaidPresences,
  };
});
