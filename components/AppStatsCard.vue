<template>
  <div class="card hover:shadow-lg transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-[var(--color-text-secondary)]">{{ label }}</p>
        <p class="text-3xl font-bold mt-2">{{ formattedValue }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1 mt-2">
          <IconTrendingUp v-if="change > 0" class="w-4 h-4 text-green-500" />
          <IconTrendingDown v-else-if="change < 0" class="w-4 h-4 text-red-500" />
          <span
            class="text-sm font-medium"
            :class="{
              'text-green-600 dark:text-green-400': change > 0,
              'text-red-600 dark:text-red-400': change < 0,
              'text-[var(--color-text-secondary)]': change === 0,
            }"
          >
            {{ change > 0 ? '+' : '' }}{{ change }}%
          </span>
        </div>
      </div>

      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="icon" class="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-vue';

interface Props {
  label: string;
  value: number | string;
  icon: any;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  format: 'number',
});

const formattedValue = computed(() => {
  const val = props.value;

  if (props.format === 'currency') {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(Number(val));
  }

  if (props.format === 'percentage') {
    return `${val}%`;
  }

  return val.toLocaleString('fr-SN');
});

const iconBgClass = computed(() => {
  const classes = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600',
    secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600',
  };
  return classes[props.variant];
});
</script>
