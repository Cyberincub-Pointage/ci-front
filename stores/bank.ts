import type { Banque } from '~/types';

export const useBankStore = defineStore('bank', () => {
  const banks = ref<Banque[]>([]);
  const currentBank = ref<Banque | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchBanks = async () => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const data = await api('/users/banks');
      banks.value = data as Banque[];
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des banques';
      console.error('Error loading banks:', e);
    } finally {
      loading.value = false;
    }
  };

  const fetchBank = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentBank.value = null;
    try {
      const api = useAPI();
      const data = await api(`/users/banks/${id}`);
      currentBank.value = data as Banque;
      return data as Banque;
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement de la banque';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createBank = async (data: Partial<Banque>) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const newBank = await api('/admin/banks', {
        method: 'POST',
        body: data,
      });
      banks.value.push(newBank as Banque);
      return { success: true, data: newBank };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la création de la banque';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  const updateBank = async (id: string, data: Partial<Banque>) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const updatedBank = await api(`/admin/banks/${id}`, {
        method: 'PATCH',
        body: data,
      });

      const index = banks.value.findIndex(b => b.id === id);
      if (index !== -1) {
        banks.value[index] = updatedBank as Banque;
      }
      if (currentBank.value && currentBank.value.id === id) {
        currentBank.value = updatedBank as Banque;
      }
      return { success: true, data: updatedBank };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour de la banque';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  const deleteBank = async (id: string) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      await api(`/admin/banks/${id}`, {
        method: 'DELETE',
      });
      banks.value = banks.value.filter(b => b.id !== id);
      if (currentBank.value && currentBank.value.id === id) {
        currentBank.value = null;
      }
      return { success: true };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la suppression de la banque';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    banks,
    currentBank,
    loading,
    error,
    fetchBanks,
    fetchBank,
    createBank,
    updateBank,
    deleteBank,
  };
});
