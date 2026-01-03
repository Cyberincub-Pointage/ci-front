import { useAPI } from '~/composables/useAPI';
import type { User } from '~/types';

export const useUserManagementCore = () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  // Charger tous les utilisateurs
  const loadUsers = async () => {
    loading.value = true;
    const api = useAPI();
    try {
      const [formateursRes, incubesRes] = await Promise.all([
        api('/manager/get-formateurs').catch(() => []),
        api('/manager/get-incubes').catch(() => [])
      ]);

      // Normalize data if necessary. Assuming API returns array of User objects
      users.value = [...(formateursRes as User[]), ...(incubesRes as User[])];

    } catch (e) {
      console.error('Error loading users', e);
    } finally {
      loading.value = false;
    }
  };

  // Récupérer un utilisateur par ID
  const getUserById = (id: string) => {
    return users.value.find(u => u.id === id);
  };

  // Rechercher les incubés (sans loading global pour l'autocomplete)
  const searchIncubes = async (filters: any = {}) => {
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const data = await (api as any)(`/manager/get-incubes?${params.toString()}`);
      return data as User[];
    } catch (e) {
      console.error('Error searching incubes', e);
      return [];
    }
  };

  // Récupérer un incubé spécifique via l'API
  const fetchIncube = async (id: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      const data = await (api as any)(`/manager/incube/${id}`);
      return data as User;
    } catch (e) {
      console.error('Error fetching incube', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Rechercher les formateurs (sans loading global pour l'autocomplete)
  const searchFormateurs = async (filters: any = {}) => {
    const api = useAPI();
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);

      const data = await (api as any)(`/manager/get-formateurs?${params.toString()}`);
      return data as User[];
    } catch (e) {
      console.error('Error searching formateurs', e);
      return [];
    }
  };

  // Récupérer un formateur spécifique via l'API
  const fetchFormateur = async (id: string) => {
    loading.value = true;
    const api = useAPI();
    try {
      const data = await (api as any)(`/manager/formateur/${id}`);
      return data as User;
    } catch (e) {
      console.error('Error fetching formateur', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const sendIncubeAlert = async (userId: string, message: string, background = false) => {
    if (!background) loading.value = true;
    const api = useAPI();
    try {
      await (api as any)(`/manager/incube/${userId}/alert`, {
        method: 'POST',
        body: { message }
      });
      return { success: true, message: 'Alerte envoyée à l\'incubé' };
    } catch (e: any) {
      return { success: false, message: e.data?.message || 'Erreur envoi alerte' };
    } finally {
      if (!background) loading.value = false;
    }
  };

  // Getters
  const getIncubes = computed(() => users.value.filter(u => u.role === 'incube'));

  return {
    users,
    loading,
    loadUsers,
    getUserById,
    searchIncubes,
    fetchIncube,
    searchFormateurs,
    fetchFormateur,
    sendIncubeAlert,
    getIncubes
  };
};
