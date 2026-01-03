<template>
  <div>
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[{ label: 'Entités' }]" class="mb-6" />

    <div class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Gestion des entités</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2">Administrez les équipes, projets et banques de l'incubateur</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Carte Équipes -->
      <NuxtLink to="/manage/entities/equipes" 
        class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconUsersGroup class="w-24 h-24 text-primary-500 transform rotate-12" />
        </div>
        
        <div class="relative z-10 flex flex-col h-full">
          <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <IconUsersGroup class="w-6 h-6" />
          </div>
          
          <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Équipes</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">
            Gérez la composition des équipes, assignez des membres et suivez leur structure.
          </p>
          
          <div class="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
            Gérer les équipes <IconArrowRight class="w-4 h-4 ml-1" />
          </div>
        </div>
      </NuxtLink>

      <!-- Carte Projets -->
      <NuxtLink to="/manage/entities/projets" 
        class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconRocket class="w-24 h-24 text-indigo-500 transform rotate-12" />
        </div>
        
        <div class="relative z-10 flex flex-col h-full">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <IconRocket class="w-6 h-6" />
          </div>
          
          <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Projets</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">
            Supervisez les projets en cours, leurs descriptions et associez-les aux équipes.
          </p>
          
          <div class="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            Gérer les projets <IconArrowRight class="w-4 h-4 ml-1" />
          </div>
        </div>
      </NuxtLink>

      <!-- Carte Banques -->
      <NuxtLink to="/manage/entities/banques" 
        class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconBuildingBank class="w-24 h-24 text-emerald-500 transform rotate-12" />
        </div>
        
        <div class="relative z-10 flex flex-col h-full">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <IconBuildingBank class="w-6 h-6" />
          </div>
          
          <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Banques</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">
            Configurez les établissements bancaires et les codes associés pour les paiements.
          </p>
          
          <div class="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            Gérer les banques <IconArrowRight class="w-4 h-4 ml-1" />
          </div>
        </div>
      </NuxtLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { IconUsersGroup, IconRocket, IconBuildingBank, IconArrowRight } from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Gestion des entités',
  meta: [
    { 
      name: 'description', 
      content: "Administration des structures de l'incubateur. Gérez les équipes, les projets et les établissements bancaires." 
    }
  ]
});
</script>
