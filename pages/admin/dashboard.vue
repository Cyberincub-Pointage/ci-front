<template>
  <div class="min-h-screen space-y-8 animate-fade-in p-4 md:p-8">
    <!-- En-tête -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1
          class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
          Tableau de Bord
        </h1>
        <p class="text-[var(--color-text-secondary)] mt-2 text-lg">Bienvenue sur votre espace d'administration.</p>
      </div>
      <div class="flex items-center gap-3">
        <span
          class="text-sm font-medium text-[var(--color-text-secondary)] bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
          {{ currentDate }}
        </span>
      </div>
    </div>

    <!-- Grille de statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform">
            <IconUsersGroup class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span
            class="text-xs font-bold px-2 py-1 rounded-full bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Total
          </span>
        </div>
        <p class="text-[var(--color-text-secondary)] text-sm font-medium">Total Incubés</p>
        <h3 class="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{{ totalActiveIncubes }}</h3>
        
        <div class="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
           <IconUserCheck class="w-4 h-4" />
           <span>Cohorte active</span>
        </div>
      </div>

      <div class="card p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:scale-110 transition-transform">
            <IconUserCheck class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span
            class="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Aujourd'hui
          </span>
        </div>
        <p class="text-[var(--color-text-secondary)] text-sm font-medium">Présents</p>
        <h3 class="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{{ presentToday }}</h3>
        
        <div class="mt-4 flex items-center gap-2 text-sm" v-if="totalActiveIncubes > 0">
           <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" :style="`width: ${(presentToday / totalActiveIncubes) * 100}%`"></div>
           </div>
           <span class="text-emerald-600 dark:text-emerald-400 font-medium">{{ Math.round((presentToday / totalActiveIncubes) * 100) }}%</span>
        </div>
      </div>

      <div class="card p-6 border-l-4 border-l-rose-500 hover:shadow-lg transition-all duration-300 group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl group-hover:scale-110 transition-transform">
            <IconUserX class="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <span
            class="text-xs font-bold px-2 py-1 rounded-full bg-rose-100/50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            Aujourd'hui
          </span>
        </div>
        <p class="text-[var(--color-text-secondary)] text-sm font-medium">Absents</p>
        <h3 class="text-3xl font-bold text-rose-700 dark:text-rose-300 mt-1">{{ absentToday }}</h3>
      </div>

      <div class="card p-6 border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-300 group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl group-hover:scale-110 transition-transform">
            <IconClock class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <p class="text-[var(--color-text-secondary)] text-sm font-medium">À valider</p>
        <h3 class="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">{{ pendingValidation }}</h3>
      </div>


    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Zone de contenu principal -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Live Status -->
        <div class="card overflow-hidden">
           <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
             <h3 class="font-semibold text-lg flex items-center gap-2">
               <IconListCheck class="w-5 h-5 text-gray-500" />
               État du jour
             </h3>
             <div class="flex gap-2">
               <input v-model="searchQuery" placeholder="Rechercher..." class="input input-sm w-full sm:w-40" />
             </div>
           </div>
           
            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incubé</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Équipe</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut (Auj.)</th>
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
                      {{ getIncubeEquipe(incube.id) }}
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
                  </tr>
                  <tr v-if="filteredIncubes.length === 0">
                     <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                        Aucun incubé trouvé pour "{{ searchQuery }}"
                     </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile List -->
            <div class="md:hidden space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar p-2">
               <div v-for="incube in filteredIncubes" :key="incube.id" class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div class="flex items-center justify-between mb-2">
                     <NuxtLink :to="`/manage/incubes/${incube.id}`" class="flex items-center gap-3 group">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                           <img v-if="incube.photoUrl" :src="incube.photoUrl" class="w-full h-full object-cover" />
                           <span v-else>{{ incube.prenom[0] }}{{ incube.nom[0] }}</span>
                        </div>
                        <div>
                           <div class="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                              {{ incube.prenom }} {{ incube.nom }}
                           </div>
                           <div class="text-xs text-slate-500">{{ getIncubeEquipe(incube.id) }}</div>
                        </div>
                     </NuxtLink>
                     <div class="flex flex-col items-end gap-1">
                         <template v-if="getTodayStatus(incube.id) === 'validated'">
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
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
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                 Absent
                              </span>
                           </template>
                     </div>
                  </div>
               </div>
               <div v-if="filteredIncubes.length === 0" class="text-center py-8 text-slate-400 text-sm">
                  Aucun incubé trouvé pour "{{ searchQuery }}"
               </div>
            </div>
        </div>
        
        <!-- Actions rapides -->
        <div class="card overflow-hidden">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <IconBolt class="w-5 h-5 text-yellow-500" />
              Actions Rapides
            </h2>
          </div>
          <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLink to="/manage/formateurs"
              class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
              <div
                class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                <IconUserPlus class="w-5 h-5" />
              </div>
              <span class="text-sm font-medium text-center">Nouveau Formateur</span>
            </NuxtLink>

            <NuxtLink to="/admin/incubes"
              class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
              <div
                class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                <IconUsersGroup class="w-5 h-5" />
              </div>
              <span class="text-sm font-medium text-center">Gérer Incubés</span>
            </NuxtLink>

            <NuxtLink to="/admin/paiements"
              class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
              <div
                class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
                <IconCashBanknote class="w-5 h-5" />
              </div>
              <span class="text-sm font-medium text-center">Paiements</span>
            </NuxtLink>

            <NuxtLink to="/admin/paiements/amount"
              class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer">
              <div
                class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-2 group-hover:scale-110 transition-transform">
                <IconCurrencyEuro class="w-5 h-5" />
              </div>
              <span class="text-sm font-medium text-center">Forfait</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Barre latérale / Résumé -->
      <div class="space-y-6">
        <!-- Résumé des statuts de paiement -->
        <div class="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <div class="p-6">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <IconCreditCard class="w-5 h-5 text-emerald-400" />
              Paiements
            </h2>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <p class="text-xs text-white/70 mb-1">Payés</p>
                <p class="text-xl font-bold">{{ paidPresences }}</p>
              </div>
              <div class="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <p class="text-xs text-white/70 mb-1">En attente</p>
                <p class="text-xl font-bold">{{ unpaidPresences }}</p>
              </div>
            </div>

            <div class="pt-4 border-t border-white/10">
              <div class="flex justify-between items-center">
                <span class="text-sm text-white/80">Reste à payer</span>
                <span class="text-xl font-bold text-emerald-400">{{ formatCurrency(totalUnpaidAmount) }}</span>
              </div>
              <div class="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                 <span class="text-sm text-white/80">Estimé (Mois)</span>
                 <span class="text-xl font-bold text-blue-400">{{ formatCurrency(monthlyAmount) }}</span>
              </div>
            </div>

            <NuxtLink to="/admin/paiements"
              class="btn btn-sm w-full mt-6 bg-white text-slate-900 hover:bg-slate-100 border-none">
              Gérer les paiements
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconUserCheck, IconUserX, IconClock, IconBolt, IconUserPlus, IconUsersGroup, IconCashBanknote, IconCurrencyEuro, IconCreditCard, IconListCheck, IconEye, IconChecklist } from '@tabler/icons-vue';
import { useAPI } from '~/composables/useAPI';

// Authentification et rôle requis
definePageMeta({
  middleware: ['auth', 'role'],
});

// SEO
useHead({
  title: 'Tableau de bord administrateur',
  meta: [
    { 
      name: 'description', 
      content: "Vue d'ensemble de l'administration CyberIncub. Suivi des présences, paiements en attente et statistiques clés." 
    }
  ]
});

const presenceStore = usePresenceStore();
const entitiesStore = useEntitiesStore();
const managerStore = useManagerStore();
const teamStore = useTeamStore();

// Formatage de la date pour l'en-tête
const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

const allPendingPresences = ref<any[]>([]);
const incubes = ref<any[]>([]);

onMounted(async () => {
    const api = useAPI();
    const today = new Date().toISOString().split('T')[0];
    
    const results = await Promise.all([
      teamStore.fetchTeams(),
      managerStore.loadIncubes({ status: 'active' }),
      entitiesStore.equipes.length === 0 ? entitiesStore.loadEntities() : Promise.resolve(),
      presenceStore.fetchPresences({ date: today }),
      (async () => {
         try {
             const res: any = await (api as any)('/manager/presence/all?status=pending');
             allPendingPresences.value = res || [];
         } catch (e) {
             console.error("Error fetching pending presences", e);
         }
      })()
    ]);
    
    incubes.value = results[1] || [];
});

const todayPresences = computed(() => presenceStore.getPresencesToday());

const presentToday = computed(() => {
  return todayPresences.value.filter(p => p.status === 'validated').length;
});

const totalActiveIncubes = computed(() => {
  return incubes.value.filter(u => u.role === 'incube' && u.status === 'active').length;
});

const absentToday = computed(() => {
  // Attente d'aujourd'hui
  const pendingToday = todayPresences.value.filter(p => p.status === 'pending').length;
  // Soustraire les présents et les en attente
  return Math.max(0, totalActiveIncubes.value - presentToday.value - pendingToday);
});

const pendingValidation = computed(() => allPendingPresences.value.length);
const searchQuery = ref('');

const filteredIncubes = computed(() => {
   const _incubes = incubes.value;
   if (!searchQuery.value) return _incubes;
   
   const q = searchQuery.value.toLowerCase();
   return _incubes.filter(i => 
      i.prenom.toLowerCase().includes(q) || 
      i.nom.toLowerCase().includes(q) || 
      i.email.toLowerCase().includes(q)
   );
});

const getTodayStatus = (incubeId: string) => {
   const p = todayPresences.value.find(presence => {
       let presenceIncubeId = null;
       if (presence.incubeId) {
         presenceIncubeId = presence.incubeId;
       } else if (typeof presence.incube === 'object' && presence.incube?.id) {
         presenceIncubeId = presence.incube.id;
       }
       return presenceIncubeId === incubeId;
   });
   
   if (!p) return null;
   return p.status; 
};

const monthlyAmount = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return presenceStore.presences
    .filter(p => {
      const date = new Date(p.date);
      return date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        p.status === 'validated';
    })
    .reduce((sum, p) => sum + p.amount, 0);
});

const paidPresences = computed(() => {
  return presenceStore.presences.filter(p => p.paymentStatus === 'paid').length;
});

const unpaidPresences = computed(() => {
  return presenceStore.presences.filter(
    p => p.status === 'validated' && p.paymentStatus === 'unpaid'
  ).length;
});

const totalUnpaidAmount = computed(() => {
  return presenceStore.getUnpaidPresences().reduce((sum, p) => sum + p.amount, 0);
});

// Helper pour récupérer les données des incubés
const getIncubeName = (incubeIdOrObj: any) => {
  if (!incubeIdOrObj) return 'Inconnu';
  if (typeof incubeIdOrObj === 'object') {
    return `${incubeIdOrObj.prenom || ''} ${incubeIdOrObj.nom || ''}`.trim();
  }
  // Si c'est un ID, chercher dans le store de présences
  const presence = presenceStore.presences.find(p => p.incubeId === incubeIdOrObj);
  if (presence?.incube && typeof presence.incube === 'object') {
    return `${presence.incube.prenom || ''} ${presence.incube.nom || ''}`.trim();
  }
  return 'Inconnu';
};

const getIncubeEquipe = (incubeIdOrObj: any) => {
  if (!incubeIdOrObj) return '-';
  
  // Chercher la présence pour obtenir l'incubé
  const presence = presenceStore.presences.find(p => p.incubeId === incubeIdOrObj);
  if (presence?.incube && typeof presence.incube === 'object') {
    const incube = presence.incube;
    // Si l'équipe est populée
    if (incube.equipe && typeof incube.equipe === 'object') {
      return incube.equipe.nom;
    }
    // Si c'est un ID d'équipe
    const equipeId = incube.equipeId || incube.equipe;
    if (equipeId) {
      const team = teamStore.teams.find(t => t.id === equipeId);
      return team ? team.nom : 'Inconnu';
    }
  }
  return '-';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
