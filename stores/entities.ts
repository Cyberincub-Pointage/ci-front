import type { Equipe, Projet, Banque } from '~/types';

export const useEntitiesStore = defineStore('entities', () => {
  const equipes = ref<Equipe[]>([]);
  const projets = ref<Projet[]>([]);
  const banques = ref<Banque[]>([]);
  const loading = ref(false);

  // Charger toutes les entités
  const loadEntities = async () => {
    loading.value = true;
    const api = useAPI();
    try {
      const [resEquipes, resProjets, resBanques] = await Promise.all([
        api('/users/teams'),
        api('/users/projects'),
        api('/users/banks')
      ]);

      equipes.value = (resEquipes as any) || [];
      projets.value = (resProjets as any) || [];
      banques.value = (resBanques as any) || [];
    } catch (e) {
      console.error('Error loading entities', e);
    } finally {
      loading.value = false;
    }
  };

  // Getters
  const getEquipeById = (id: string) => equipes.value.find(e => e.id === id);
  const getProjetById = (id: string) => projets.value.find(p => p.id === id);
  const getBanqueById = (id: string) => banques.value.find(b => b.id === id);
  const getProjetsByEquipe = (equipeId: string) => projets.value.filter(p => p.equipeId === equipeId);

  // CRUD Équipes
  const createEquipe = async (data: Omit<Equipe, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEquipe: Equipe = {
      ...data,
      id: `eq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    equipes.value.push(newEquipe);
    return newEquipe;
  };

  const updateEquipe = async (id: string, data: Partial<Equipe>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = equipes.value.findIndex(e => e.id === id);
    if (index !== -1) {
      equipes.value[index] = { ...equipes.value[index], ...data };
      return equipes.value[index];
    }
    return null;
  };

  const deleteEquipe = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    equipes.value = equipes.value.filter(e => e.id !== id);
  };

  // CRUD Projets
  const createProjet = async (data: Omit<Projet, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProjet: Projet = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    projets.value.push(newProjet);
    return newProjet;
  };

  const updateProjet = async (id: string, data: Partial<Projet>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = projets.value.findIndex(p => p.id === id);
    if (index !== -1) {
      projets.value[index] = { ...projets.value[index], ...data };
      return projets.value[index];
    }
    return null;
  };

  const deleteProjet = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    projets.value = projets.value.filter(p => p.id !== id);
  };

  // CRUD Banques
  const createBanque = async (data: Omit<Banque, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBanque: Banque = {
      ...data,
      id: `bq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    banques.value.push(newBanque);
    return newBanque;
  };

  const updateBanque = async (id: string, data: Partial<Banque>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = banques.value.findIndex(b => b.id === id);
    if (index !== -1) {
      banques.value[index] = { ...banques.value[index], ...data };
      return banques.value[index];
    }
    return null;
  };

  const deleteBanque = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    banques.value = banques.value.filter(b => b.id !== id);
  };

  return {
    equipes: readonly(equipes),
    projets: readonly(projets),
    banques: readonly(banques),
    loading: readonly(loading),
    loadEntities,
    getEquipeById,
    getProjetById,
    getBanqueById,
    getProjetsByEquipe,
    createEquipe,
    updateEquipe,
    deleteEquipe,
    createProjet,
    updateProjet,
    deleteProjet,
    createBanque,
    updateBanque,
    deleteBanque,
  };
});
