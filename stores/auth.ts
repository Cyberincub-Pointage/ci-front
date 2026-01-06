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

      let message = 'Une erreur est survenue lors de la connexion.';

      // Message renvoyé par le backend
      if (error.data?.message) {
        message = error.data.message;
      }
      // Erreur réseau ou serveur inaccessible
      else if (!error.response && (
        error.name === 'FetchError' ||
        error.message?.toLowerCase().includes('network error') ||
        error.message?.toLowerCase().includes('failed to fetch') ||
        error.message?.toLowerCase().includes('load failed')
      )) {
        message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      }
      // Erreur serveur (500)
      else if (error.statusCode >= 500) {
        message = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
      }
      // 404 non trouvé
      else if (error.statusCode === 404) {
        message = 'Service de connexion indisponible.';
      }
      // Fallback pour 401 si pas de message
      else if (error.statusCode === 401) {
        message = 'Email ou mot de passe incorrect.';
      }

      return { success: false, message };
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
      console.error('Register error:', error);

      let message = 'Erreur lors de l\'inscription.';

      if (error.data) {
        if (error.data?.message) {
          message = error.data.message;
        } else if (typeof error.data === 'string') {
          if (error.data === 'emailAlreadyInUse' || error.data.includes('emailAlreadyInUse')) {
            message = 'L\'adresse email est déjà utilisée.';
          } else if (
            error.data === 'invalidPhoneFormat' ||
            error.data.includes('invalidPhoneFormat') ||
            error.data.toLowerCase().includes('le format du numéro de téléphone') ||
            error.data.toLowerCase().includes('phone')
          ) {
            message = 'Le format du numéro de téléphone est invalide (requis: +22901XXXXXXXX)';
          } else if (error.data === 'passwordFormatInvalid' || error.data.includes('passwordFormatInvalid') || error.data.includes('mot de passe')) {
            // If it's a specific message (e.g. from helper), use it. otherwise generic.
            message = error.data.includes('mot de passe') ? error.data : 'Le format du mot de passe est invalide.';
          } else if (error.data === 'Bad Request') {
            message = 'Données invalides. Vérifiez votre saisie.';
          } else {
            message = error.data;
          }
        }
      } else if (!error.response && (
        error.name === 'FetchError' ||
        error.message?.toLowerCase().includes('network error') ||
        error.message?.toLowerCase().includes('failed to fetch') ||
        error.message?.toLowerCase().includes('load failed')
      )) {
        message = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      } else if (error.statusCode === 409) {
        message = 'L\'adresse email est déjà utilisée.';
      } else if (error.statusCode === 400) {
        // Si on a un fallback générique
        if (message === 'Erreur lors de l\'inscription.') {
          message = 'Format des données invalide. Vérifiez le numéro de téléphone (+229...).';
        }
      }

      return { success: false, message };
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
      let message = 'Erreur lors de la mise à jour du mot de passe';

      if (error.data) {
        if (error.data?.message) {
          message = error.data.message;
        } else if (typeof error.data === 'string') {
          if (error.data === 'badCombo' || error.data.includes('badCombo')) {
            message = 'Mot de passe actuel incorrect.';
          } else if (error.data === 'passwordFormatInvalid' || error.data.includes('passwordFormatInvalid') || error.data.includes('mot de passe')) {
            message = error.data.includes('mot de passe') ? error.data : 'Le nouveau mot de passe est invalide (8 caractères, 1 Maj, 1 min, 1 chiffre, 1 spécial).';
          } else if (error.statusCode === 401 || error.data?.statusCode === 401) {
            message = 'Mot de passe actuel incorrect.';
          } else {
            message = error.data;
          }
        } else if (error.data.badCombo) {
          message = error.data.badCombo;
        } else if (error.data.passwordFormatInvalid) {
          message = error.data.passwordFormatInvalid;
        }
      } else if (error.statusCode === 401) {
        message = 'Mot de passe actuel incorrect.';
      }

      return { success: false, message };
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
  const resetPassword = async (token: string, password: string, role: string = 'incube'): Promise<{ success: boolean; message: string }> => {
    const api = useAPI();
    const roles: string[] = ['incube', 'admin', 'formateur'];

    // Si un rôle est fourni et valide, on le met en premier
    const sortedRoles = roles.sort((a, b) => {
      if (a === role) return -1;
      if (b === role) return 1;
      return 0;
    });

    let lastError = null;

    for (const currentRole of sortedRoles) {
      try {
        let endpoint = '';
        switch (currentRole) {
          case 'admin':
            endpoint = '/admin/auth/reset-password';
            break;
          case 'formateur':
            endpoint = '/formateur/auth/reset-password';
            break;
          case 'incube':
          default:
            endpoint = '/incube/auth/reset-password';
            break;
        }

        await api(endpoint, {
          method: 'POST',
          body: { token, password }
        });

        // Si ça réussit, on retourne succès
        return { success: true, message: 'Mot de passe réinitialisé avec succès' };

      } catch (error: any) {
        lastError = error;

        const isInvalidToken =
          (typeof error.data === 'string' && error.data === 'invalidToken') ||
          (error.data?.invalidToken) ||
          (error.message && error.message.includes('Token invalide')) ||
          (error.data?.message && error.data.message.includes('Token invalide'));

        if (isInvalidToken) {
          continue;
        }

        break;
      }
    }

    let message = 'Lien invalide ou expiré';
    if (lastError) {
      if (lastError.data) {
        if (lastError.data?.message) {
          message = lastError.data.message;
        } else if (typeof lastError.data === 'string') {
          if (lastError.data === 'invalidToken') {
            message = 'Le lien de réinitialisation est invalide ou a expiré.';
          } else if (lastError.data === 'passwordFormatInvalid' || lastError.data.includes('mot de passe')) {
            message = lastError.data.includes('mot de passe') ? lastError.data : 'Le mot de passe ne respecte pas les critères de sécurité.';
          } else {
            message = lastError.data;
          }
        }
      }
    }

    return { success: false, message };
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
