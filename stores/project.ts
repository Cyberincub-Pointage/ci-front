import { defineStore } from 'pinia';
import { useAPI } from '~/composables/useAPI';
import type { Projet } from '~/types';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Projet[]>([]);
  const currentProject = ref<Projet | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Récupérer tous les projets
  const fetchProjects = async () => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const data = await api('/users/projects');
      projects.value = (data as any[]).map(p => ({
        ...p,
        equipeId: p.equipe?.id || p.equipe
      })) as Projet[];
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des projets';
      console.error('Error loading projects:', e);
    } finally {
      loading.value = false;
    }
  };

  // Récupérer un projet spécifique par son ID
  const fetchProject = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentProject.value = null;
    try {
      const api = useAPI();
      const data: any = await api(`/users/projects/${id}`);
      const project = {
        ...data,
        equipeId: data.equipe?.id || data.equipe
      };
      currentProject.value = project as Projet;
      return project as Projet;
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement du projet';
      console.error('Error loading project:', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Créer un nouveau projet
  const createProject = async (data: Partial<Projet>) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const payload = {
        ...data,
        equipe: data.equipeId
      };

      const newProject = await api('/admin/projects', {
        method: 'POST',
        body: payload,
      });

      const normalizedProject = {
        ...(newProject as any),
        equipeId: (newProject as any).equipe
      };

      projects.value.push(normalizedProject as Projet);
      return { success: true, data: normalizedProject };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la création du projet';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Mettre à jour un projet existant
  const updateProject = async (id: string, data: Partial<Projet>) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      const payload = {
        ...data,
        equipe: data.equipeId
      };

      const updatedProject = await api(`/admin/projects/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      const normalizedProject = {
        ...(updatedProject as any),
        equipeId: (updatedProject as any).equipe
      };

      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = normalizedProject as Projet;
      }
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = normalizedProject as Projet;
      }
      return { success: true, data: normalizedProject };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour du projet';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Supprimer un projet
  const deleteProject = async (id: string) => {
    loading.value = true;
    error.value = null;
    const api = useAPI();
    try {
      await api(`/admin/projects/${id}`, {
        method: 'DELETE',
      });
      projects.value = projects.value.filter(p => p.id !== id);
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = null;
      }
      return { success: true };
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la suppression du projet';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    projects,
    currentProject,
    loading,
    error,

    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  };
});
