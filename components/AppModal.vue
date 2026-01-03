<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        @click="close">
        <Transition enter-active-class="transform transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transform transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <component :is="isForm ? 'form' : 'div'" @submit.prevent="handleSubmit"
            class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden flex flex-col max-h-[90vh]"
            :class="[width]" @click.stop>
            <!-- Header -->
            <div
              class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 min-h-[60px]">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <slot name="icon"></slot>
                {{ title }}
              </h3>
              <button @click="close" type="button"
                class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <IconX class="h-5 w-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
              <!-- Description / Alert Block -->
              <div v-if="description" :class="descriptionClasses" class="mb-6 p-3 rounded-lg text-sm flex gap-2">
                <component :is="descriptionIcon" class="w-5 h-5 flex-shrink-0" />
                <div v-html="description"></div>
              </div>

              <!-- Generated Fields -->
              <div v-if="fields && fields.length > 0" class="space-y-4">
                <div class="grid gap-4" :class="gridCols > 1 ? `grid-cols-1 md:grid-cols-${gridCols}` : 'grid-cols-1'">
                  <template v-for="(field, idx) in fields" :key="idx">
                    <div v-if="!field.hidden" :class="{ 'md:col-span-2': field.fullWidth }">
                      <label v-if="field.label" class="label">{{ field.label }}</label>
                      <div class="relative">
                        <!-- Icon -->
                        <component v-if="field.icon" :is="field.icon"
                          class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />

                        <!-- Select -->
                        <select v-if="field.type === 'select'" v-model="form[field.name]" :required="field.required"
                          class="input w-full disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                          :class="{ 'pl-10': field.icon }" :disabled="field.disabled">
                          <option v-if="field.placeholder" value="" disabled selected>{{ field.placeholder }}</option>
                          <option v-for="opt in field.options" :key="opt.value || opt" :value="opt.value || opt">
                            {{ opt.label || opt }}
                          </option>
                        </select>

                        <!-- Text/Email/Tel/Password -->
                        <input v-else-if="field.type === 'textarea'" v-model="form[field.name]" :required="field.required"
                          :placeholder="field.placeholder"
                          class="input w-full min-h-[100px] py-2 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                          :class="{ 'pl-10': field.icon }" :minlength="field.minlength" :disabled="field.disabled" />

                        <!-- Generic Input -->
                        <input v-else
                          :type="field.type === 'password' ? (showPasswords[field.name] ? 'text' : 'password') : field.type"
                          v-model="form[field.name]" :required="field.required" :placeholder="field.placeholder"
                          class="input w-full disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                          :class="{ 'pl-10': field.icon, 'pr-10': field.type === 'password' }"
                          :minlength="field.minlength" :pattern="field.pattern" :min="field.min" :max="field.max"
                          :step="field.step" :disabled="field.disabled" />

                        <!-- Password Toggle -->
                        <button v-if="field.type === 'password'" type="button" @click="togglePassword(field.name)"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10">
                          <IconEye v-if="!showPasswords[field.name]" class="w-5 h-5" />
                          <IconEyeOff v-else class="w-5 h-5" />
                        </button>
                      </div>
                      <!-- Error/Help text can be added here -->
                      <p v-if="field.error" class="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <IconAlertTriangle class="w-3 h-3" /> {{ field.error }}
                      </p>
                    </div>
                  </template>
                </div>
              </div>

              <slot></slot>
            </div>

            <!-- Footer -->
            <div
              class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3"
              v-if="$slots.footer || showFooter">
              <slot name="footer">
                <button v-if="showCancel" type="button" @click="$emit('cancel-action'); close()" class="btn btn-outline"
                  :disabled="loading" tabindex="-1">
                  {{ cancelLabel }}
                </button>
                <button :type="isForm ? 'submit' : 'button'" @click="!isForm && handleSubmit()" class="btn"
                  :class="submitButtonClasses" :disabled="disabled || loading">
                  <IconLoader v-if="loading" class="w-4 h-4 animate-spin mr-2" />
                  {{ submitLabel }}
                </button>
              </slot>
            </div>
          </component>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  IconLoader, IconAlertTriangle, IconInfoCircle, IconCheck, IconEye, IconEyeOff, IconX
} from '@tabler/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: 'max-w-md',
  },
  isForm: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: 'Enregistrer',
  },
  cancelLabel: {
    type: String,
    default: 'Annuler',
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  submitVariant: {
    type: String as PropType<'primary' | 'success' | 'danger' | 'warning' | 'info'>,
    default: 'primary',
  },
  description: {
    type: String,
    default: '',
  },
  descriptionType: {
    type: String as PropType<'info' | 'warning' | 'danger' | 'success'>,
    default: 'info',
  },
  form: {
    type: Object,
    default: () => ({}),
  },
  fields: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  gridCols: {
    type: Number,
    default: 1,
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'confirm', 'cancel-action']);

// Password visibility state
const showPasswords = ref<Record<string, boolean>>({});

const togglePassword = (fieldName: string) => {
  showPasswords.value[fieldName] = !showPasswords.value[fieldName];
};

const close = () => {
  if (props.loading) return;
  emit('update:modelValue', false);
  emit('close');
};

const handleSubmit = () => {
  if (props.loading || props.disabled) return;
  emit('confirm');
};

const submitButtonClasses = computed(() => {
  const variants = {
    primary: 'btn-primary bg-blue-600 hover:bg-blue-700 border-blue-600',
    success: 'btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600',
    danger: 'btn-primary bg-red-600 hover:bg-red-700 border-red-600',
    warning: 'btn-primary bg-amber-500 hover:bg-amber-600 border-amber-500',
    info: 'btn-primary bg-indigo-600 hover:bg-indigo-700 border-indigo-600',
  };
  return variants[props.submitVariant] || variants.primary;
});

const descriptionClasses = computed(() => {
  const types = {
    info: 'bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30',
    warning: 'bg-amber-50 text-amber-800 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/30',
    danger: 'bg-red-50 text-red-800 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
  };
  return types[props.descriptionType] || types.info;
});

const descriptionIcon = computed(() => {
  const icons = {
    info: IconInfoCircle,
    warning: IconAlertTriangle,
    danger: IconAlertTriangle,
    success: IconCheck,
  };
  return icons[props.descriptionType] || IconInfoCircle;
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}
</style>
