import { ref } from 'vue';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'danger' | 'warning';
}

const isVisible = ref(false);
const options = ref<ConfirmOptions>({ message: '' });
let resolvePromise: ((value: boolean) => void) | null = null;

export const useConfirm = () => {
  const confirm = (opts: string | ConfirmOptions): Promise<boolean> => {
    if (typeof opts === 'string') {
      options.value = {
        message: opts,
        title: 'Confirmation',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        type: 'primary'
      };
    } else {
      options.value = {
        title: 'Confirmation',
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        type: 'primary',
        ...opts
      };
    }

    isVisible.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const handleConfirm = () => {
    isVisible.value = false;
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    isVisible.value = false;
    if (resolvePromise) resolvePromise(false);
  };

  return {
    isVisible,
    options,
    confirm,
    handleConfirm,
    handleCancel
  };
};
