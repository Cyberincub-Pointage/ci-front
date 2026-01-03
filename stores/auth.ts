import type { User, UserRole } from '~/types';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = computed(() => !!currentUser.value);

  // Charger l'utilisateur depuis localStorage au montage ou via API si SSR
  const loadUser = async () => {
    const tokenCookie = useCookie('auth_token');
    const roleCookie = useCookie('user_role');
    const errorCookie = useCookie('auth_error');

    // Cas SSR ou rafraîchissement : on a les cookies mais le state est vide
    if (tokenCookie.value && roleCookie.value && !currentUser.value) {
      currentUser.value = { role: roleCookie.value } as User;
      try {
        const user = await fetchProfile();

        if (!user) {
          if (!errorCookie.value) {
            errorCookie.value = 'fetchProfile returned null (unknown reason)';
          }
          currentUser.value = null;
          tokenCookie.value = null;
          roleCookie.value = null;
        } else { }
      } catch (e: any) {
        console.error('DEBUG: Critical error in loadUser:', e);

        errorCookie.value = `Critical loadUser error: ${e.message}`;

        currentUser.value = null;
        tokenCookie.value = null;
        roleCookie.value = null;
      }
    }
    else if (import.meta.client && !currentUser.value) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        currentUser.value = JSON.parse(stored);
      }
    }
  };

  // Sauvegarder dans localStorage
  const saveUser = (user: User | null) => {
    if (import.meta.client) {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  };

  // Simulation de login
  const login = async (email: string, password: string, role: UserRole = 'admin'): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    const tokenCookie = useCookie('auth_token');
    const roleCookie = useCookie('user_role');

    try {
      let endpoint = '';
      switch (role) {
        case 'admin':
          endpoint = '/admin/auth/login';
          break;
        case 'formateur':
        case 'formateur_principal':
          endpoint = '/formateur/auth/login';
          break;
        case 'incube':
          endpoint = '/incube/auth/login';
          break;
        default:
          endpoint = '/admin/auth/login';
      }

      const response: any = await api(endpoint, {
        method: 'POST',
        body: { email, password }
      });

      if (response && response.token && response.user) {
        const currentRole = response.user.role || role;
        const userWithRole = {
          ...response.user,
          role: currentRole,
          id: response.user.id || `mock-${Date.now()}`
        };

        currentUser.value = userWithRole;
        tokenCookie.value = response.token;
        roleCookie.value = currentRole;
        saveUser(currentUser.value);
        return { success: true, message: 'Connexion réussie' };
      }

      return { success: false, message: 'Réponse invalide du serveur' };

    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.data?.message || 'Email ou mot de passe incorrect' };
    }
  };

  // Logout
  const logout = async () => {
    const tokenCookie = useCookie('auth_token');
    const roleCookie = useCookie('user_role');
    const api = useAPI();

    try {
      if (currentUser.value?.role) {
        let endpoint = '/admin/auth/logout';

        switch (currentUser.value.role) {
          case 'incube':
            endpoint = '/incube/auth/logout';
            break;
          case 'formateur':
          case 'formateur_principal':
            endpoint = '/formateur/auth/logout';
            break;
          case 'admin':
          case 'super_admin':
          default:
            endpoint = '/admin/auth/logout';
            break;
        }

        await api(endpoint, { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      currentUser.value = null;
      tokenCookie.value = null;
      roleCookie.value = null;
      saveUser(null);
    }
  };

  // Inscription incubé
  const register = async (data: any): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    try {
      const response: any = await api('/incube/auth/register', {
        method: 'POST',
        body: data
      });

      return { success: true, message: 'Inscription réussie' };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Erreur lors de l\'inscription' };
    }
  };

  // Vérifier permissions
  const hasRole = (roles: string | string[]) => {
    if (!currentUser.value) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(currentUser.value.role);
  };

  // Navigation par rôle
  const getDashboardRoute = () => {
    if (!currentUser.value) return '/auth/login';

    switch (currentUser.value.role) {
      case 'incube': return '/incube/dashboard';
      case 'formateur': return '/formateur/dashboard';
      case 'formateur_principal': return '/formateur/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'super_admin': return '/admin/dashboard';
      default: return '/auth/login';
    }
  };

  // Mot de passe oublié
  const forgotPassword = async (email: string, role: string = 'incube'): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    try {
      let endpoint = '/incube/auth/forgot-password';

      switch (role) {
        case 'admin': case 'super_admin':
          endpoint = '/admin/auth/forgot-password';
          break;
        case 'formateur': case 'formateur_principal':
          endpoint = '/formateur/auth/forgot-password';
          break;
        case 'incube':
        default: endpoint = '/incube/auth/forgot-password';
          break;
      }

      await api(endpoint, {
        method: 'POST',
        body: { email }
      });
      return { success: true, message: 'Si un compte existe, un email a été envoyé.' };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Erreur lors de la demande' };
    }
  };

  // Récupérer le profil actuel
  const fetchProfile = async () => {
    const api = useAPI();
    const roleCookie = useCookie('user_role');
    const errorCookie = useCookie('auth_error');
    try {
      let endpoint = '/incube/me';
      if (currentUser.value?.role === 'formateur' || currentUser.value?.role === 'formateur_principal') {
        endpoint = '/formateur/me';
      } else if (currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin') {
        endpoint = '/admin/me';
      }

      const response: any = await api(endpoint);
      if (response && response.user) {
        currentUser.value = {
          ...response.user,
          role: response.user.role || currentUser.value?.role || 'incube'
        };
        saveUser(currentUser.value);
        roleCookie.value = currentUser.value?.role;

        return currentUser.value;
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);

      errorCookie.value = `Fetch error: ${error.message || error} Status: ${error.statusCode || error.status || 'unknown'}`;
    }
    return null;
  };

  // Mettre à jour le profil
  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    try {
      let endpoint = '/incube/profile';
      if (currentUser.value?.role === 'formateur' || currentUser.value?.role === 'formateur_principal') {
        endpoint = '/formateur/profile';
      } else if (currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin') {
        endpoint = '/admin/profile';
      }

      const response: any = await api(endpoint, {
        method: 'PATCH',
        body: data
      });

      if (response && response.user) {
        currentUser.value = { ...currentUser.value, ...response.user };
        saveUser(currentUser.value);
        return { success: true, message: response.message || 'Profil mis à jour' };
      }
      return { success: true, message: 'Profil mis à jour' };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Erreur lors de la mise à jour' };
    }
  };

  // Mettre à jour le mot de passe
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    try {
      let endpoint = '/incube/password';
      if (currentUser.value?.role === 'formateur' || currentUser.value?.role === 'formateur_principal') {
        endpoint = '/formateur/profile/password';
      } else if (currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin') {
        endpoint = '/admin/profile/password';
      }

      await api(endpoint, {
        method: 'PATCH',
        body: { currentPassword, newPassword }
      });
      return { success: true, message: 'Mot de passe mis à jour' };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Erreur lors de la mise à jour du mot de passe' };
    }
  };

  // Mettre à jour les infos bancaires
  const updateBankInfo = async (data: { rib: string, banque: string }): Promise<{ success: boolean; message: string; status?: string }> => {
    const api = useAPI();
    try {
      const response: any = await api('/incube/profile/bank', {
        method: 'PATCH',
        body: data
      });

      // Mettre à jour l'état local de l'utilisateur si la mise à jour directe est réussie
      if (currentUser.value && response.status === 'updated') {
        currentUser.value = {
          ...currentUser.value,
          rib: data.rib,
          banqueId: data.banque
        };
        saveUser(currentUser.value);
      } else if (currentUser.value && response.status === 'pending') {
        currentUser.value = {
          ...currentUser.value,
          pendingRib: data.rib,
          pendingBanque: data.banque
        };
        saveUser(currentUser.value);
      }

      return { success: true, message: response.message, status: response.status };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Erreur lors de la mise à jour des infos bancaires' };
    }
  };

  // Mettre à jour l'équipe
  const updateTeam = async (equipeId: string): Promise<{ success: boolean; message: string; status?: string }> => {
    const api = useAPI();
    try {
      const response: any = await api('/incube/profile/team', {
        method: 'PATCH',
        body: { equipe: equipeId }
      });

      if (currentUser.value && response.status === 'updated') {
        currentUser.value = {
          ...currentUser.value,
          equipeId: equipeId
        };
        saveUser(currentUser.value);
      } else if (currentUser.value && response.status === 'pending') {
        currentUser.value = {
          ...currentUser.value,
          pendingEquipe: equipeId
        };
        saveUser(currentUser.value);
      }

      return { success: true, message: response.message, status: response.status };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Erreur lors du changement d\'équipe' };
    }
  };

  // Vérifier l'email
  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    try {
      await api('/incube/auth/verify-email', {
        method: 'POST',
        body: { token }
      });
      return { success: true, message: 'Email vérifié avec succès' };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Lien de vérification invalide ou expiré' };
    }
  };

  // Réinitialiser le mot de passe
  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    try {
      await api('/incube/auth/reset-password', {
        method: 'POST',
        body: { token, password }
      });
      return { success: true, message: 'Mot de passe réinitialisé avec succès' };
    } catch (error: any) {
      return { success: false, message: error.data?.message || 'Lien invalide ou expiré' };
    }
  };

  return {
    currentUser: readonly(currentUser),
    isAuthenticated,
    loadUser,
    login,
    logout,
    register,
    forgotPassword,
    verifyEmail,
    resetPassword,
    fetchProfile,
    updateProfile,
    updatePassword,
    updateBankInfo,
    updateTeam,
    hasRole,
    getDashboardRoute,
  };
});
