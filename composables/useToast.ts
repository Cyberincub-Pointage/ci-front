import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 1;

export const useToast = () => {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = nextId++;
    const duration = toast.duration || 3000;

    const newToast = { ...toast, id, duration };
    toasts.value.push(newToast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string, title?: string) => addToast({ message, title, type: 'success' }),
    error: (message: string, title?: string) => addToast({ message, title, type: 'error' }),
    warning: (message: string, title?: string) => addToast({ message, title, type: 'warning' }),
    info: (message: string, title?: string) => addToast({ message, title, type: 'info' }),
  };
};
