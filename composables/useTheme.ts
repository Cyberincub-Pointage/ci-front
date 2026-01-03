export const useTheme = () => {
  const isDark = useState('theme-dark', () => false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;

    if (import.meta.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  const loadTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('theme');
      isDark.value = savedTheme === 'dark';

      if (isDark.value) {
        document.documentElement.classList.add('dark');
      }
    }
  };

  onMounted(() => {
    loadTheme();
  });

  return {
    isDark: readonly(isDark),
    toggleTheme,
    loadTheme,
  };
};
