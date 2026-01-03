<template>
  <div class="min-h-screen space-y-8">
    <!-- En-tête -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Supervision</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Vue d'ensemble et suivi quotidien des incubés.</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300">
           {{ formatDate(new Date().toISOString()) }}
        </span>
        <button @click="refreshData" class="btn btn-ghost btn-sm" :disabled="loading" title="Actualiser">
           <IconRefresh class="w-5 h-5" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Total -->
      <div class="card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <IconUsersGroup class="w-24 h-24 text-blue-500" />
        </div>
        <div>
           <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Incubés</p>
           <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stats.total }}</p>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
           <IconUserCheck class="w-4 h-4" />
           <span>Cohorte active</span>
        </div>
      </div>

      <!-- Présents -->
      <div class="card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <IconMapPinCheck class="w-24 h-24 text-green-500" />
        </div>
        <div>
           <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Présents Aujourd'hui</p>
           <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stats.present }}</p>
        </div>
         <div class="mt-4 flex items-center gap-2 text-sm">
           <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div class="bg-green-500 h-1.5 rounded-full transition-all duration-500" :style="`width: ${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%`"></div>
           </div>
           <span class="text-green-600 dark:text-green-400 font-medium">{{ stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0 }}%</span>
        </div>
      </div>

      <!-- En Attente -->
      <div class="card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <IconClock class="w-24 h-24 text-amber-500" />
        </div>
        <div>
           <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">À Valider</p>
           <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stats.pendingValidation }}</p>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
           <NuxtLink to="/formateur/presences?status=pending">
               Voir les demandes &rarr;
           </NuxtLink>
        </div>
      </div>

      <!-- Absents -->
      <div class="card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <IconUserOff class="w-24 h-24 text-red-500" />
        </div>
        <div>
           <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Absents</p>
           <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stats.absent }}</p>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
           <IconAlertCircle class="w-4 h-4" />
           <span>Non pointés</span>
        </div>
      </div>

      <!-- Demandes Rétro -->
      <div class="card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <IconHistory class="w-24 h-24 text-purple-500" />
        </div>
        <div>
           <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Demandes Rétro</p>
           <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ pendingRetroCount }}</p>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
           <NuxtLink to="/formateur/presences?tab=retro">
               Voir les demandes &rarr;
           </NuxtLink>
        </div>
      </div>

      <!-- Formateurs Actifs (seulement pour le formateur principal) -->
      <div v-if="isFormateurPrincipal" class="card p-6 flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <IconUserPlus class="w-24 h-24 text-indigo-500" />
        </div>
        <div>
           <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Formateurs Actifs</p>
           <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ activeFormateurCount }}</p>
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
           <NuxtLink to="/manage/formateurs">
               Gérer les formateurs &rarr;
           </NuxtLink>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <!-- COLONNE GAUCHE : Liste principale -->
       <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Statut en direct -->
          <div class="card overflow-hidden flex-1">
             <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
               <h3 class="font-semibold text-lg flex items-center gap-2">
                 <IconListCheck class="w-5 h-5 text-gray-500" />
                 État du jour
               </h3>
               <div class="flex gap-2">
                 <input v-model="searchQuery" placeholder="Rechercher..." class="input input-sm w-40" />
               </div>
             </div>
             
             <div class="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar hidden md:block">
               <table class="w-full">
                 <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                   <tr>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incubé</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Équipe</th>
                     <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut (Auj.)</th>
                     <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                   </tr>
                 </thead>
                 <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                   <tr v-for="incube in filteredIncubes" :key="incube.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                     <td class="px-6 py-4 whitespace-nowrap">
                       <NuxtLink :to="`/manage/incubes/${incube.id}`" class="flex items-center group">
                         <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm group-hover:scale-110 transition-transform">
                             <img v-if="incube.photoUrl" :src="incube.photoUrl" class="w-full h-full rounded-full object-cover" />
                             <span v-else>{{ incube.prenom[0] }}{{ incube.nom[0] }}</span>
                         </div>
                         <div class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                           {{ incube.prenom }} {{ incube.nom }}
                         </div>
                       </NuxtLink>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {{ getTeamName(incube) }}
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-center">
                        <template v-if="getTodayStatus(incube.id) === 'validated'">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Présent
                          </span>
                        </template>
                        <template v-else-if="getTodayStatus(incube.id) === 'pending'">
                          <StatusBadge status="pending" type="presence" size="sm" />
                        </template>
                        <template v-else-if="getTodayStatus(incube.id) === 'rejected'">
                          <StatusBadge status="rejected" type="presence" size="sm" />
                        </template>
                        <template v-else>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Absent
                          </span>
                        </template>
                     </td>
                     <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end gap-2">
                          <NuxtLink :to="`/manage/incubes/${incube.id}`" class="text-gray-400 hover:text-primary-600 transition-colors" title="Voir le profil">
                            <IconEye class="w-5 h-5" />
                          </NuxtLink>
                          <NuxtLink v-if="getTodayStatus(incube.id) === 'pending'" to="/formateur/presences" class="text-amber-500 hover:text-amber-600 transition-colors" title="Valider la présence">
                            <IconChecklist class="w-5 h-5" />
                          </NuxtLink>
                        </div>
                     </td>
                   </tr>
                   <tr v-if="filteredIncubes.length === 0">
                      <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                         Aucun incubé trouvé pour "{{ searchQuery }}"
                      </td>
                   </tr>
                 </tbody>
               </table>
             </div>

             <!-- Vue Mobile (Cartes) -->
             <div class="md:hidden space-y-4 p-4">
                <div v-for="incube in filteredIncubes" :key="incube.id" class="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                   <div class="flex justify-between items-start mb-3">
                      <NuxtLink :to="`/manage/incubes/${incube.id}`" class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                             <img v-if="incube.photoUrl" :src="incube.photoUrl" class="w-full h-full rounded-full object-cover" />
                             <span v-else>{{ incube.prenom[0] }}{{ incube.nom[0] }}</span>
                          </div>
                          <div>
                             <h4 class="font-bold text-gray-900 dark:text-white leading-tight">{{ incube.prenom }} {{ incube.nom }}</h4>
                             <p class="text-xs text-gray-500 mt-0.5">{{ getTeamName(incube) }}</p>
                          </div>
                      </NuxtLink>
                      
                       <div class="flex items-center gap-2">
                          <NuxtLink v-if="getTodayStatus(incube.id) === 'pending'" to="/formateur/presences" class="btn btn-sm btn-ghost text-amber-500 p-1">
                            <IconChecklist class="w-5 h-5" />
                          </NuxtLink>
                       </div>
                   </div>
                   
                   <div class="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Statut du jour :</span>
                        <template v-if="getTodayStatus(incube.id) === 'validated'">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Présent
                          </span>
                        </template>
                        <template v-else-if="getTodayStatus(incube.id) === 'pending'">
                          <StatusBadge status="pending" type="presence" size="sm" />
                        </template>
                         <template v-else-if="getTodayStatus(incube.id) === 'rejected'">
                          <StatusBadge status="rejected" type="presence" size="sm" />
                        </template>
                        <template v-else>
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Absent
                          </span>
                        </template>
                      </div>
                      <NuxtLink :to="`/manage/incubes/${incube.id}`" class="text-xs text-primary-600 font-medium">
                         Profil &rarr;
                      </NuxtLink>
                   </div>
                </div>
                 <div v-if="filteredIncubes.length === 0" class="text-center py-8 text-gray-500">
                     Aucun incubé trouvé pour "{{ searchQuery }}"
                 </div>
             </div>
          </div>
       </div>

       <!-- COLONNE DROITE : Actions & Résumé -->
       <div class="space-y-6">
          <!-- Actions Rapides -->
          <div class="card overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <IconBolt class="w-5 h-5 text-yellow-500" />
                Actions Rapides
              </h2>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              <!-- Valider Présences -->
              <NuxtLink to="/formateur/presences"
                class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
                <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
                  <IconChecklist class="w-5 h-5" />
                </div>
                <span class="text-sm font-medium text-center">Valider Présences</span>
                <span v-if="stats.pendingValidation > 0" class="mt-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {{ stats.pendingValidation }}
                </span>
              </NuxtLink>

              <!-- Annuaire Incubés -->
              <NuxtLink to="/manage/incubes"
                class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
                <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                  <IconUsers class="w-5 h-5" />
                </div>
                <span class="text-sm font-medium text-center">Annuaire Incubés</span>
              </NuxtLink>

              <!-- Avertissements -->
              <NuxtLink to="/manage/warnings"
                class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
                <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                  <IconAlertTriangle class="w-5 h-5" />
                </div>
                <span class="text-sm font-medium text-center">Avertissements</span>
              </NuxtLink>

              <!-- Gérer Formateurs (seulement pour le formateur principal) -->
              <NuxtLink v-if="isFormateurPrincipal" to="/manage/formateurs"
                class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                  <IconUserPlus class="w-5 h-5" />
                </div>
                <span class="text-sm font-medium text-center">Gérer Formateurs</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Rétro-actifs en attente -->
          <div class="card p-0 overflow-hidden" v-if="pendingRetroRequests.length > 0">
             <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-amber-50/50 dark:bg-amber-900/10">
                <h3 class="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                   <IconHistory class="w-5 h-5" />
                   Rétro-Actif en attente
                </h3>
                <span class="badge badge-warning">{{ pendingRetroRequests.length }}</span>
             </div>
             <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <div v-for="req in pendingRetroRequests.slice(0, 3)" :key="req.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                   <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm text-gray-900 dark:text-white">{{ getIncubeName(req.incubeId) }}</span>
                      <span class="text-xs text-gray-500">{{ formatDateShort(req.date) }}</span>
                   </div>
                   <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic">"{{ req.motif }}"</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-800/50 text-center">
                   <NuxtLink to="/formateur/presences" class="text-xs text-primary-600 hover:underline font-medium">
                      Voir tout
                   </NuxtLink>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  IconUsersGroup, IconMapPinCheck, IconUserOff, IconClock, IconRefresh, IconListCheck, IconEye, IconChecklist, IconUsers, IconHistory, IconAlertCircle, IconUserCheck, IconBolt, IconUserPlus, IconAlertTriangle 
} from '@tabler/icons-vue';
import { useAPI } from '~/composables/useAPI';

definePageMeta({
  middleware: ['auth', 'role'],
});

useHead({
  title: 'Tableau de bord Formateur',
  meta: [
    { 
      name: 'description', 
      content: "Gérez les présences et évaluations." 
    }
  ]
});

const authStore = useAuthStore();
const managerStore = useManagerStore();
const presenceStore = usePresenceStore();
const teamStore = useTeamStore();

const loading = ref(false);
const searchQuery = ref('');

// Données réactives
const incubes = ref<any[]>([]);
const todayPresences = ref<any[]>([]);
const allPendingPresences = ref<any[]>([]);
const retroRequests = ref<any[]>([]);
const formateurs = ref<any[]>([]);

// Initialize Data
const load = async () => {
  loading.value = true;
  try {
     const today = new Date().toISOString().split('T')[0];
     
     const api = useAPI();

     // Récupération parallèle des données
     const promises = [
        managerStore.loadIncubes({ status: 'active' }),
        presenceStore.fetchPresences({ date: today }),
        presenceStore.fetchRetroRequests({ status: 'pending' }),
        (api as any)('/manager/presence/all?status=pending')
     ];
     
     // Charge les formateurs si l'utilisateur est formateur principal
     if (authStore.currentUser?.role === 'formateur_principal') {
       promises.push(managerStore.loadFormateurs({ status: 'active' }));
     }
     
     const results = await Promise.all(promises);
     const fetchedIncubes = results[0]; 
     incubes.value = fetchedIncubes || [];
     
     todayPresences.value = presenceStore.presences.filter(p => p.date === today);
     retroRequests.value = [...presenceStore.retroRequests];
     allPendingPresences.value = results[3] || [];
     
     // Stockage des formateurs si chargés
     if (results.length > 4) {
       formateurs.value = results[4] || [];
     }
     
     // Also fetch teams to resolve names properly if needed
     if (teamStore.teams.length === 0) await teamStore.fetchTeams();

  } catch (e) {
     console.error("Error loading supervision data", e);
  } finally {
     loading.value = false;
  }
};

onMounted(() => {
   load();
});

const refreshData = () => load();

// Statistiques calculées
const stats = computed(() => {
   const total = incubes.value.length;
   const present = todayPresences.value.filter(p => p.status === 'validated').length;
   const pendingToday = todayPresences.value.filter(p => p.status === 'pending').length;
   const pendingRetro = retroRequests.value.filter(r => r.status === 'pending').length;
   const totalPending = allPendingPresences.value.length;
   const absent = total - present - pendingToday;
   
   return {
      total,
      present,
      pendingValidation: totalPending + pendingRetro,
      absent: absent < 0 ? 0 : absent 
   };
});

const pendingRetroRequests = computed(() => {
   return retroRequests.value.filter(r => r.status === 'pending');
});

// Visibilité basée sur le rôle
const isFormateurPrincipal = computed(() => authStore.currentUser?.role === 'formateur_principal');

// Statistiques pour les nouvelles cartes
const pendingRetroCount = computed(() => {
  return retroRequests.value.filter(r => r.status === 'pending').length;
});

const activeFormateurCount = computed(() => {
  return formateurs.value.filter(u => 
    (u.role === 'formateur' || u.role === 'formateur_principal') && 
    u.status === 'active'
  ).length;
});

const getTodayStatus = (incubeId: string) => {
   const p = todayPresences.value.find(presence => {
       // Gère les différents formats de données de l'incubé
       let presenceIncubeId = null;
       
       if (presence.incubeId) {
         presenceIncubeId = presence.incubeId;
       } else if (typeof presence.incube === 'object' && presence.incube?.id) {
         presenceIncubeId = presence.incube.id;
       } else if (typeof presence.incube === 'string') {
         presenceIncubeId = presence.incube;
       }
       
       return presenceIncubeId === incubeId;
   });
   
   if (!p) return null;
   return p.status;
}

const getTeamName = (incube: any) => {
   if (incube.equipe && typeof incube.equipe === 'object') return incube.equipe.nom;
   const team = teamStore.teams.find(t => t.id === (incube.equipeId || incube.equipe));
   return team ? team.nom : '-';
};

const getIncubeName = (incubeIdOrObj: any) => {
  if (!incubeIdOrObj) return 'Inconnu';
  if (typeof incubeIdOrObj === 'object') {
    return `${incubeIdOrObj.prenom || ''} ${incubeIdOrObj.nom || ''}`.trim();
  }
  // Cherche dans la liste des incubés chargés d'abord
  const i = incubes.value.find(u => u.id === incubeIdOrObj);
  if (i) return `${i.prenom} ${i.nom}`;
  return 'Inconnu';
};

// Filtrage de la recherche
const filteredIncubes = computed(() => {
   if (!searchQuery.value) return incubes.value;
   const q = searchQuery.value.toLowerCase();
   return incubes.value.filter(i => 
      i.prenom.toLowerCase().includes(q) || 
      i.nom.toLowerCase().includes(q) || 
      i.email.toLowerCase().includes(q)
   );
});

// Formatters
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const formatDateShort = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
