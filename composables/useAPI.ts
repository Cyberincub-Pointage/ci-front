export const useAPI = () => {
  const config = useRuntimeConfig();
  const token = useCookie('auth_token');

  return $fetch.create({
    baseURL: config.public.baseAPI,
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    },
    onRequest({ options }) {
      if (process.server) { }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        token.value = null;

        if (import.meta.client) {
          await navigateTo('/auth/login');
        }
      }
    }
  });
};
