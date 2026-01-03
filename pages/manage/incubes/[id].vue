<template>
  <div v-if="incube" class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
    <!-- Fil d'ariane -->
    <AppBreadcrumb :items="[
      { label: 'Gestion des Incubés', to: '/manage/incubes' },
      { label: incube.prenom + ' ' + incube.nom || 'Détails' }
    ]" class="mb-6" />

    <!-- En-tête de profil -->
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 sticky top-4 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 supports-[backdrop-filter]:bg-white/60">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        <div class="flex items-center gap-5">
          <!-- Avatar -->
          <div class="relative">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-white dark:ring-slate-800 overflow-hidden">
              <img v-if="incube.photoUrl" :src="incube.photoUrl" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else>{{ incube.prenom[0] }}{{ incube.nom[0] }}</span>
            </div>
            <div class="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1 rounded-full">
              <span class="block w-4 h-4 rounded-full" :class="{
                'bg-emerald-500 animate-pulse': incube.status === 'active',
                'bg-rose-500': incube.status === 'suspended',
                'bg-amber-500': incube.status === 'pending'
              }">
              </span>
            </div>
          </div>

          <!-- Identité -->
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {{ incube.prenom }} {{ incube.nom }}
            </h1>
            <div class="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1.5">
                <IconMail class="w-4 h-4" />
                {{ incube.email }}
              </span>
              <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span class="flex items-center gap-1.5">
                <IconPhone class="w-4 h-4" />
                {{ incube.telephone || 'Non renseigné' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <!-- Statut -->
          <button @click="toggleStatus"
            class="btn bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 justify-center"
            :class="{ 'text-rose-600 hover:bg-rose-50 border-rose-200': incube.status === 'active' }"
            :disabled="loading">
            <IconPower class="w-4 h-4 mr-2" />
            {{ incube.status === 'active' ? 'Suspendre' : 'Activer' }}
          </button>

          <button @click="openAlertModal" class="btn btn-outline justify-center">
            <IconBell class="w-4 h-4 mr-2" />
            Envoyer une alerte
          </button>
        </div>
      </div>
    </div>

    <!-- Modale d'alerte -->
    <AppModal v-model="showAlertModal" title="Envoyer une alerte" is-form @confirm="submitAlert" submit-label="Envoyer"
      submit-variant="primary" :form="alertForm" :loading="loading" :fields="[
        { name: 'incubeName', label: 'Destinataire', type: 'text', disabled: true, value: `${incube.prenom} ${incube.nom}` },
        { name: 'message', label: 'Message d\'alerte *', type: 'textarea', required: true, placeholder: 'Raison de l\'alerte...' }
      ]">
      <template #description>
        <p class="text-sm text-gray-500 mb-4">Envoyez une notification importante à cet incubé.</p>
      </template>
    </AppModal>

    <!-- Grille de contenu -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Gauche : Détails -->
      <div class="space-y-6">
        <!-- Carte d'info -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <IconUserScan class="w-5 h-5 text-primary-500" />
            Détails du profil
          </h3>

          <div class="space-y-4">
            <div class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">RIB</p>
              <div
                class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-lg group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 transition-colors font-mono">
                <IconCreditCard class="w-4 h-4 text-slate-400" />
                {{ incube.rib || 'Non renseigné' }}
              </div>
            </div>

            <div class="group">
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Date d'inscription</p>
              <div
                class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-lg group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 transition-colors">
                <IconCalendar class="w-4 h-4 text-slate-400" />
                {{ formatDate(incube.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Droite : Équipe & Projet & Banque -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Grille des cartes Équipe & Projet -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Équipe -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:border-primary-200 transition-colors">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <IconUsersGroup class="w-5 h-5 text-primary-500" />
              Équipe
            </h3>
            <div v-if="equipe" class="flex flex-col gap-2">
              <NuxtLink :to="`/manage/entities/equipes/${equipe.id}`"
                class="font-bold text-lg text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors underline-offset-4 hover:underline">
                {{ equipe.nom }}
              </NuxtLink>
              <p class="text-sm text-slate-500 line-clamp-2">{{ equipe.description || 'Aucune description' }}</p>
            </div>
            <div v-else class="text-slate-400 text-sm italic">Aucune équipe assignée</div>

            <!-- Alerte de mise à jour de l'équipe -->
            <div v-if="isFormateur && incube.pendingEquipe"
              class="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-xl relative overflow-hidden">
              <div class="flex items-start gap-3 relative z-10">
                <IconAlertCircle class="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div class="flex-1">
                  <h4 class="font-bold text-sm text-indigo-800 dark:text-indigo-200 mb-1">Changement d'équipe</h4>
                  <div class="text-xs text-indigo-700 dark:text-indigo-300 space-y-1 mb-3">
                    <p>
                      <strong>Nouvelle Équipe:</strong>
                      <NuxtLink
                        :to="`/manage/entities/equipes/${typeof incube.pendingEquipe === 'object' ? incube.pendingEquipe.id : incube.pendingEquipe}`"
                        class="hover:underline">
                        {{ getTeamName(incube.pendingEquipe) }}
                      </NuxtLink>
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button @click="validateTeamUpdate(true)" class="btn btn-primary">Valider</button>
                    <button @click="validateTeamUpdate(false)" class="btn btn-error">Refuser</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Projet -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:border-primary-200 transition-colors">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <IconRocket class="w-5 h-5 text-primary-500" />
              Projet
            </h3>
            <div v-if="projet" class="flex flex-col gap-2">
              <NuxtLink :to="`/manage/entities/projets/${projet.id}`"
                class="font-bold text-lg text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors underline-offset-4 hover:underline">
                {{ projet.nom }}
              </NuxtLink>
              <p class="text-sm text-slate-500 line-clamp-2">{{ projet.description || 'Aucune description' }}</p>
            </div>
            <div v-else class="text-slate-400 text-sm italic">Aucun projet assigné</div>
          </div>

          <!-- Banque -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:border-primary-200 transition-colors md:col-span-2">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <IconBuildingBank class="w-5 h-5 text-primary-500" />
              Banque
            </h3>
            <div v-if="banque" class="flex flex-col gap-2">
              <div class="flex justify-between">
                <NuxtLink :to="`/manage/entities/banques/${banque.id}`"
                  class="font-bold text-lg text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors underline-offset-4 hover:underline">
                  {{ banque.nom }}
                </NuxtLink>
                <span class="text-sm font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{{ banque.code
                }}</span>
              </div>
            </div>
            <div v-else class="text-slate-400 text-sm italic flex flex-col gap-2">
              <span>Aucune banque assignée ou informations incomplètes</span>
              <button @click="notifyPaymentInfo"
                class="btn btn-xs btn-outline border-yellow-500 text-yellow-600 hover:bg-yellow-50 self-start">
                <IconBell class="w-3 h-3 mr-1" />
                Réclamer infos bancaires
              </button>
            </div>

            <!-- Alerte de mise à jour de la banque -->
            <div v-if="isAdmin && (incube.pendingBanque || incube.pendingRib)"
              class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl relative overflow-hidden">
              <div class="flex items-start gap-3 relative z-10">
                <IconAlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div class="flex-1">
                  <h4 class="font-bold text-sm text-amber-800 dark:text-amber-200 mb-1">Mise à jour en attente</h4>
                  <div class="text-xs text-amber-700 dark:text-amber-300 space-y-1 mb-3">
                    <p>
                      <strong>Banque:</strong>
                      <NuxtLink v-if="incube.pendingBanque" :to="`/manage/entities/banques/${incube.pendingBanque.id}`"
                        class="hover:underline">
                        {{ incube.pendingBanque.nom }}
                      </NuxtLink>
                      <span v-else>...</span>
                      ({{ incube.pendingBanque?.code || '...' }})
                    </p>
                    <p><strong>RIB:</strong> <span class="font-mono">{{ incube.pendingRib }}</span></p>
                  </div>
                  <div class="flex gap-2">
                    <button @click="validateBankUpdate(true)" class="btn btn-primary">Valider</button>
                    <button @click="validateBankUpdate(false)" class="btn btn-error">Refuser</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Onglets -->
    <div
      class="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="border-b border-slate-100 dark:border-slate-700">
        <div class="flex overflow-x-auto">
          <button @click="activeTab = 'presences'"
            class="flex-1 md:flex-none px-3 md:px-6 py-3 md:py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 flex items-center justify-center gap-2"
            :class="{
              'border-primary-500 text-primary-600 dark:text-primary-400': activeTab === 'presences',
              'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200': activeTab !== 'presences'
            }">
            <IconClipboardList class="w-4 h-4" />
            <span>Présences</span>
          </button>
          <button @click="activeTab = 'warnings'"
            class="flex-1 md:flex-none px-3 md:px-6 py-3 md:py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 flex items-center justify-center gap-2"
            :class="{
              'border-primary-500 text-primary-600 dark:text-primary-400': activeTab === 'warnings',
              'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200': activeTab !== 'warnings'
            }">
            <IconAlertTriangle class="w-4 h-4" />
            <span class="md:hidden">Avert.</span>
            <span class="hidden md:inline">Avertissements</span>
          </button>
          <button @click="activeTab = 'stats'"
            class="flex-1 md:flex-none px-3 md:px-6 py-3 md:py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 flex items-center justify-center gap-2"
            :class="{
              'border-primary-500 text-primary-600 dark:text-primary-400': activeTab === 'stats',
              'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200': activeTab !== 'stats'
            }">
            <IconChartBar class="w-4 h-4" />
            <span class="md:hidden">Stats</span>
            <span class="hidden md:inline">Statistiques Mensuelles</span>
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- Onglet Présences -->
        <div v-if="activeTab === 'presences'">
          <!-- Filters -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div class="col-span-1">
              <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Du</label>
              <input type="date" v-model="presenceFilters.startDate" class="input w-full" />
            </div>
            <div class="col-span-1">
              <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Au</label>
              <input type="date" v-model="presenceFilters.endDate" class="input w-full" />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Statut</label>
              <select v-model="presenceFilters.status" class="input w-full">
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Arrivée avant</label>
              <input type="time" v-model="presenceFilters.timeEnd" class="input w-full" />
            </div>
            <div class="col-span-2 md:col-span-1 flex items-end">
              <button @click="resetPresenceFilters"
                class="btn btn-outline w-full border-slate-300 hover:bg-slate-50 text-slate-600 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                <IconFilterOff class="w-4 h-4 mr-2" />
                Tout
              </button>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th class="px-4 py-3 text-left">Date</th>
                  <th class="px-4 py-3 text-left">Arrivée</th>
                  <th class="px-4 py-3 text-left">Départ</th>
                  <th class="px-4 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                <tr v-for="presence in incubePresences" :key="presence.id"
                  class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{ formatDate(presence.date) }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ presence.heureArrivee ?
                    formatTime(presence.heureArrivee) : '-' }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ presence.heureDepart ?
                    formatTime(presence.heureDepart) : '-' }}</td>
                  <td class="px-4 py-3">
                    <StatusBadge :status="presence.status" type="presence" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden space-y-3">
            <div v-for="presence in incubePresences" :key="presence.id"
              class="p-4 bg-white dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-medium text-slate-800 dark:text-slate-200">{{ formatDate(presence.date) }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Arrivée: {{ presence.heureArrivee ? formatTime(presence.heureArrivee) : '-' }}
                  </p>
                </div>
                <StatusBadge :status="presence.status" type="presence" />
              </div>
              <div
                class="flex justify-between items-center text-xs text-slate-500 border-t border-slate-50 dark:border-slate-700 pt-2 mt-2">
                <span>Départ: {{ presence.heureDepart ? formatTime(presence.heureDepart) : '-' }}</span>
              </div>
            </div>
          </div>
          <div v-if="incubePresences.length === 0" class="text-center py-12 text-slate-400">
            Aucune présence trouvée pour cette sélection
          </div>
        </div>

        <!-- Onglet Avertissements -->
        <div v-if="activeTab === 'warnings'">
          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="md:col-span-2">
              <label class="label text-xs uppercase font-bold text-gray-500 mb-1">Motif</label>
              <select v-model="warningFilters.motif" class="input w-full">
                <option value="">Tous les motifs</option>
                <option value="Absence">Absence</option>
                <option value="Retard">Retard</option>
                <option value="Comportement">Comportement</option>
                <option value="Travail non rendu">Travail non rendu</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div v-if="incubeWarnings.length > 0" class="grid gap-4">
            <NuxtLink v-for="warning in incubeWarnings" :key="warning.id" :to="`/manage/warnings/${warning.id}`"
              class="block p-4 bg-white dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group">
              <div class="flex justify-between items-start mb-2">
                <StatusBadge :status="warning.motif" type="warning" :show-icon="false" class="border-0" />
                <span class="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">{{
                  formatDate(warning.date) }}</span>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{{ warning.description }}</p>
            </NuxtLink>
          </div>
          <div v-else class="text-center py-12 text-slate-400">
            Aucun avertissement trouvé
          </div>
        </div>

        <!-- Onglet Statistiques -->
        <div v-if="activeTab === 'stats'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="month in monthlyStats" :key="month.label"
              class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p
                class="font-bold text-slate-700 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-600 pb-2">
                {{ month.label }}</p>

              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Présences</span>
                  <span class="font-bold text-green-600">{{ month.present }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Absences</span>
                  <span class="font-bold text-red-500">{{ month.absent }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Retards (>9h)</span>
                  <span class="font-bold text-orange-500">{{ month.late }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500">Avertissements</span>
                  <span class="font-bold text-amber-600">{{ month.warnings }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="monthlyStats.length === 0" class="text-center py-12 text-slate-400">
            Aucune donnée statistique disponible
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
    <AppSkeleton class="w-32 h-8 mb-6" />
    <!-- En-tête de profil skeleton -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6">
      <div class="flex gap-6">
        <AppSkeleton type="circle" class="w-20 h-20" />
        <div class="space-y-3 flex-1">
          <AppSkeleton class="w-64 h-8" />
          <div class="flex gap-3">
            <AppSkeleton class="w-32 h-4" />
            <AppSkeleton class="w-32 h-4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Grille de contenu skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="space-y-6">
        <AppSkeleton class="h-64 rounded-2xl" />
      </div>
      <div class="lg:col-span-2 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppSkeleton class="h-40 rounded-2xl" />
          <AppSkeleton class="h-40 rounded-2xl" />
          <AppSkeleton class="h-40 rounded-2xl md:col-span-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconMail, IconPhone, IconPower, IconUserScan, IconCalendar, IconCreditCard, IconUsersGroup, IconRocket, IconBuildingBank, IconClipboardList, IconAlertTriangle, IconChartBar, IconBell, IconFilterOff
} from '@tabler/icons-vue';

definePageMeta({
  middleware: ['auth', 'role'],
});

const route = useRoute();
const adminStore = useAdminStore();
const managerStore = useManagerStore();
const entitiesStore = useEntitiesStore();
const presenceStore = usePresenceStore();
const formateurStore = useFormateurStore();
const authStore = useAuthStore();

// Gestion robuste du paramètre de route
const incubeId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id as string;

const activeTab = ref('presences');
const loading = ref(false);
const incube = ref<any>(null);

useHead({
  title: computed(() => incube.value ? `${incube.value.prenom} ${incube.value.nom} - Incubé` : 'Détails incubé'),
  meta: [
    {
      name: 'description',
      content: "Détails du profil incubé, historique des présences et informations bancaires."
    }
  ]
});

const isAdmin = computed(() => ['admin', 'super_admin'].includes(authStore.currentUser?.role || ''));
const isFormateur = computed(() => ['formateur', 'formateur_principal'].includes(authStore.currentUser?.role || ''));

const showAlertModal = ref(false);
const alertForm = ref({ message: '' });

const equipe = computed(() => {
  if (!incube.value) return null;
  if (incube.value.equipe && typeof incube.value.equipe === 'object') return incube.value.equipe;
  return incube.value.equipeId ? entitiesStore.getEquipeById(incube.value.equipeId) : null;
});

const projet = computed(() => {
  if (!incube.value) return null;
  // Direct population
  if (incube.value.projet && typeof incube.value.projet === 'object') return incube.value.projet;

  // Direct ID
  if (incube.value.projetId) return entitiesStore.getProjetById(incube.value.projetId);

  // 3. Repli via l'équipe
  const equipId = incube.value.equipe && typeof incube.value.equipe === 'object' ? incube.value.equipe.id : (incube.value.equipeId || incube.value.equipe);

  if (equipId) {
    if (entitiesStore.projets) {
      return entitiesStore.projets.find((p: any) => {
        const pEquipeId = p.equipe && typeof p.equipe === 'object' ? p.equipe.id : (p.equipeId || p.equipe);
        return pEquipeId === equipId;
      });
    }
  }
  return null;
});

const banque = computed(() => {
  if (!incube.value) return null;
  if (incube.value.banque && typeof incube.value.banque === 'object') return incube.value.banque;
  return incube.value.banqueId ? entitiesStore.getBanqueById(incube.value.banqueId) : null;
});

// Filtres
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

const presenceFilters = ref({
  startDate: firstDay,
  endDate: lastDay,
  status: '',
  timeStart: '',
  timeEnd: ''
});

const warningFilters = ref({
  startDate: '',
  endDate: '',
  motif: ''
});

// Données
const incubePresences = computed(() => {
  let list = presenceStore.presences;

  // Filtrage côté client par heure
  if (presenceFilters.value.timeStart) {
    list = list.filter(p => p.heureArrivee && p.heureArrivee >= presenceFilters.value.timeStart);
  }
  if (presenceFilters.value.timeEnd) {
    list = list.filter(p => p.heureArrivee && p.heureArrivee <= presenceFilters.value.timeEnd);
  }
  return list;
});

const incubeWarnings = computed(() => {
  let list = formateurStore.warnings;
  if (warningFilters.value.motif) {
    list = list.filter(w => w.motif.toLowerCase().includes(warningFilters.value.motif.toLowerCase()));
  }
  if (warningFilters.value.startDate && warningFilters.value.endDate) {
    list = list.filter(w => w.date >= warningFilters.value.startDate && w.date <= warningFilters.value.endDate);
  }
  return list;
});

// Récupération des données
const fetchIncubePresences = async () => {
  await presenceStore.fetchPresences({
    incubeId,
    startDate: presenceFilters.value.startDate,
    endDate: presenceFilters.value.endDate,
    status: presenceFilters.value.status
  });
};

const fetchIncubeWarnings = async () => {
  await formateurStore.fetchWarnings({ incubeId });
};

// Chargement initial et observateurs
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      managerStore.fetchIncube(incubeId),
      entitiesStore.loadEntities(),
      fetchIncubePresences(),
      fetchIncubeWarnings()
    ]);
    incube.value = await managerStore.fetchIncube(incubeId);
  } catch (e) {
    console.error("Error loading incube details", e);
  } finally {
    loading.value = false;
  }
});

// Rafraîchir les présences lorsque les filtres changent
watch(() => [presenceFilters.value.startDate, presenceFilters.value.endDate, presenceFilters.value.status], () => {
  fetchIncubePresences();
});

const monthlyStats = computed(() => {
  const stats: Record<string, { present: number; absent: number; late: number; warnings: number }> = {};

  presenceStore.presences.forEach(p => {
    const date = new Date(p.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!stats[key]) stats[key] = { present: 0, absent: 0, late: 0, warnings: 0 };

    if (p.status === 'validated') stats[key].present++;
    if (p.heureArrivee > '09:00:00') stats[key].late++;
  });

  // Fusion des avertissements
  formateurStore.warnings.forEach(w => {
    const date = new Date(w.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!stats[key]) stats[key] = { present: 0, absent: 0, late: 0, warnings: 0 };
    stats[key].warnings++;
  });

  return Object.entries(stats)
    .map(([key, value]) => ({
      label: formatMonthYear(key),
      ...value
    }))
    .sort((a, b) => b.label.localeCompare(a.label));
});

const fetchData = async () => {
  try {
    const fetchedIncube = await managerStore.fetchIncube(incubeId);
    incube.value = fetchedIncube;
  } catch (e) {
    console.error("Error loading incube details", e);
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    console.log('Loading incube profile for ID:', incubeId);
    const [fetchedIncube] = await Promise.all([
      managerStore.fetchIncube(incubeId),
      entitiesStore.loadEntities(),
      presenceStore.fetchPresences({ incubeId }),
    ]);
    incube.value = fetchedIncube;
    console.log('Incube loaded:', incube.value);
    console.log('Presences in store after fetch:', presenceStore.presences.length);
  } catch (e) {
    console.error("Error loading incube details", e);
  } finally {
    loading.value = false;
  }
});

const toggleStatus = async () => {
  if (!incube.value) return;
  const action = incube.value.status === 'active' ? 'suspendre' : 'réactiver';

  if (await useConfirm().confirm({
    message: `Êtes-vous sûr de vouloir ${action} cet incubé ?`,
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} incubé`,
    type: incube.value.status === 'active' ? 'danger' : 'primary'
  })) {
    loading.value = true;
    const result = await managerStore.toggleIncubeStatus(incubeId, incube.value.status);
    loading.value = false;

    if (result.success) {
      useToast().success(result.message);
      fetchData();
    } else {
      useToast().error(result.message);
    }
  }
};

const openAlertModal = () => {
  alertForm.value.message = '';
  (alertForm.value as any).incubeName = `${incube.value.prenom} ${incube.value.nom}`;
  showAlertModal.value = true;
};

const closeAlertModal = () => {
  showAlertModal.value = false;
};

const submitAlert = async () => {
  if (alertForm.value.message) {
    loading.value = true;
    const result = await managerStore.sendIncubeAlert(incubeId, alertForm.value.message);
    loading.value = false;
    if (result.success) {
      useToast().success(result.message);
      closeAlertModal();
    } else {
      useToast().error(result.message);
    }
  }
};

const notifyPaymentInfo = async () => {
  if (await useConfirm().confirm({
    message: `Envoyer un rappel urgent à ${incube.value.prenom} ${incube.value.nom} pour renseigner ses informations bancaires ?`,
    title: 'Notifier infos bancaires manquantes',
    type: 'warning'
  })) {
    loading.value = true;
    const res = await adminStore.notifyPaymentInfo(incubeId);
    loading.value = false;
    if (res.success) {
      useToast().success(res.message);
    } else {
      useToast().error(res.message);
    }
  }
};

const resetPresenceFilters = () => {
  presenceFilters.value = {
    startDate: '',
    endDate: '',
    status: '',
    timeStart: '',
    timeEnd: ''
  };
};

const validateBankUpdate = async (approve: boolean) => {
  loading.value = true;
  const res = await adminStore.validateBankUpdate(incubeId, approve);
  loading.value = false;

  if (res.success) {
    useToast().success(res.message);
    fetchData();
  } else {
    useToast().error(res.message);
  }
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (time: string) => {
  if (!time) return '-';
  return time.substring(0, 5);
};

const formatMonthYear = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};
const getTeamName = (idOrObj: any) => {
  if (!idOrObj) return '...';
  if (typeof idOrObj === 'object' && idOrObj.nom) return idOrObj.nom;

  const t = entitiesStore.getEquipeById(idOrObj);
  if (t) return t.nom;

  return 'Inconnu';
};

const validateTeamUpdate = async (approve: boolean) => {
  loading.value = true;
  const res = await formateurStore.validateTeamUpdate(incubeId, approve);
  loading.value = false;

  if (res.success) {
    useToast().success(res.message);
    // Recharger les données pour mettre à jour l'état
    const fetchedIncube = await managerStore.fetchIncube(incubeId);
    incube.value = fetchedIncube;
  } else {
    useToast().error(res.message);
  }
};
</script>
