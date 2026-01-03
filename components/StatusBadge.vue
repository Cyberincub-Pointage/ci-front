<template>
  <span
    class="badge"
    :class="badgeClass"
  >
    <component v-if="showIcon" :is="icon" class="w-3 h-3" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { IconClock, IconCheck, IconX, IconEye, IconAlertTriangle } from '@tabler/icons-vue';
import type { PresenceStatus, PaymentStatus, PermissionStatus } from '~/types';

interface Props {
  status: PresenceStatus | PaymentStatus | PermissionStatus | string;
  type?: 'presence' | 'payment' | 'permission' | 'warning';
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'presence',
  showIcon: true,
});

const badgeClass = computed(() => {
  // Gestion des badges de présence
  if (props.type === 'presence') {
    const classes = {
      pending: 'badge-warning',
      validated: 'badge-success',
      rejected: 'badge-error',
    };
    return classes[props.status as PresenceStatus];
  } 
  // Gestion des badges de paiement
  else if (props.type === 'payment') {
    const classes = {
      unpaid: 'badge-warning',
      paid: 'badge-success',
    };
    return classes[props.status as PaymentStatus];
  } 
  // Gestion des badges de permission
  else if (props.type === 'permission') {
    const classes = {
      pending: 'badge-warning',
      viewed: 'badge-info',
      approved: 'badge-success',
      rejected: 'badge-error',
    };
    return classes[props.status as PermissionStatus];
  }
  // Gestion des badges d'avertissement
  else if (props.type === 'warning') {
    const classes: Record<string, string> = {
      'absences': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0',
      'retards': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0',
      'comportement': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0',
      'travail': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0',
      'autre': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0',
    };
    return classes[props.status as string] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0';
  }
});

const label = computed(() => {
  // Libellés pour les statuts de présence
  if (props.type === 'presence') {
    const labels = {
      pending: 'En attente',
      validated: 'Validée',
      rejected: 'Refusée',
    };
    return labels[props.status as PresenceStatus];
  } 
  // Libellés pour les statuts de paiement
  else if (props.type === 'payment') {
    const labels = {
      unpaid: 'Non payé',
      paid: 'Payé',
    };
    return labels[props.status as PaymentStatus];
  } 
  // Libellés pour les statuts de permission
  else if (props.type === 'permission') {
    const labels = {
      pending: 'En attente',
      viewed: 'Vue',
      approved: 'Approuvée',
      rejected: 'Rejetée',
    };
    return labels[props.status as PermissionStatus];
  }
  // Libellés pour les statuts d'avertissement
  else if (props.type === 'warning') {
    const labels: Record<string, string> = {
      'absences': 'Absences répétées',
      'retards': 'Retards fréquents',
      'comportement': 'Comportement approprié',
      'travail': 'Travail non rendu',
      'autre': 'Autre',
    };
    return labels[props.status as string] || props.status;
  }
});

const icon = computed(() => {
  // Icônes pour les statuts de présence
  if (props.type === 'presence') {
    const icons = {
      pending: IconClock,
      validated: IconCheck,
      rejected: IconX,
    };
    return icons[props.status as PresenceStatus];
  } 
  // Icônes pour les statuts de paiement
  else if (props.type === 'payment') {
    const icons = {
      unpaid: IconClock,
      paid: IconCheck,
    };
    return icons[props.status as PaymentStatus];
  } 
  // Icônes pour les statuts de permission
  else if (props.type === 'permission') {
    const icons = {
      pending: IconClock,
      viewed: IconEye,
      approved: IconCheck,
      rejected: IconX,
    };
    return icons[props.status as PermissionStatus];
  }
  // Icônes pour les statuts d'avertissement
  else if (props.type === 'warning') {
    return IconAlertTriangle;
  }
});
</script>

