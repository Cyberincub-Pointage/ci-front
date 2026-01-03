<template>
  <div class="animate-pulse" :class="[
    type === 'circle' ? 'rounded-full' : 'rounded-md',
    className
  ]" :style="{
    width: width || '100%',
    height: height || '1em'
  }">
    <div class="bg-gray-200 dark:bg-gray-700 h-full w-full rounded-inherit"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'text' | 'circle' | 'rect' | 'image'; // Type
  width?: string; // Largeur personnalisée
  height?: string; // Hauteur personnalisée
  className?: string; // Classes CSS supplémentaires
}

// Valeurs par défaut pour les props
withDefaults(defineProps<Props>(), {
  type: 'text',
  className: ''
});
</script>

<style scoped>
.rounded-inherit {
  border-radius: inherit;
}
</style>
