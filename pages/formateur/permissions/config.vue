<template>
  <div class="space-y-6">
     <!-- Fil d'Ariane -->
    <AppBreadcrumb :items="[
      { label: 'Gestion des permissions', to: '/formateur/permissions' },
      { label: 'Configuration' }
    ]" class="mb-6" />
    
    <!-- Titre et description -->
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Email de permissions</h1>
      <p class="text-[var(--color-text-secondary)] mt-2 text-base md:text-lg">Gérez les paramètres relatifs aux demandes de permission.</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- État de chargement -->
      <div class="card p-6 h-64 flex flex-col justify-between">
        <div class="flex items-center gap-4">
          <AppSkeleton type="circle" width="48px" height="48px" />
          <div class="space-y-2">
            <AppSkeleton type="text" width="150px" height="24px" />
            <AppSkeleton type="text" width="200px" height="16px" />
          </div>
        </div>
        <div class="space-y-4">
          <AppSkeleton type="rect" height="40px" class="w-full" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Zone de configuration -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Section Email -->
        <section class="card overflow-hidden">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 class="text-xl font-bold flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <IconMail class="w-6 h-6" />
              </div>
              Email de réception
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)] mt-1 ml-14">
              L'adresse email qui recevra les notifications de demandes.
            </p>
          </div>

          <div class="p-6">
            <div class="flex flex-col gap-6 mb-8">
              <!-- Affichage de l'email actuel -->
              <div
                class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="relative z-10 w-full sm:w-auto">
                  <p class="text-blue-100 font-medium mb-1">Email Actuel</p>
                  <div class="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate max-w-full sm:max-w-md break-all">
                    {{ currentEmail }}
                  </div>
                  <div class="mt-2 flex items-center gap-2 text-sm text-blue-100 bg-white/10 px-3 py-1.5 rounded-lg w-fit">
                    <IconCheck class="w-4 h-4" />
                    Actif
                  </div>
                </div>

                <div
                  class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <IconAt class="w-32 h-32" />
                </div>

                <!-- Bouton d'édition -->
                <button @click="openModal" class="btn bg-white text-blue-600 hover:bg-blue-50 border-none relative z-10 shadow-md whitespace-nowrap w-full sm:w-auto justify-center mt-2 sm:mt-0 sm:ml-4">
                  <IconEdit class="w-5 h-5 mr-2" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <!-- Information -->
        <div
          class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-4 items-start">
          <IconInfoCircle class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-800 dark:text-blue-300">
            <p class="font-bold mb-1">Information importante</p>
            <p>
              Toutes les nouvelles demandes de permission seront envoyées à cette adresse. Assurez-vous qu'elle est valide et consultée régulièrement.
              En cas d'indisponibilité, la configuration par défaut (contact@cyberincub.com) sera utilisée.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale de Modification -->
    <AppModal v-model="showModal" title="Modifier l'email de réception" is-form @confirm="updateEmail"
      :loading="submitting" submit-label="Enregistrer" :form="form" :fields="[
        { name: 'email', label: 'Nouvelle adresse email', type: 'email', required: true, icon: IconMail, placeholder: 'exemple@cyberincub.com' }
      ]" description="Entrez la nouvelle adresse email qui recevra les demandes." />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { ROLES } from '~/utils/roles';
import { usePermissionStore } from '~/stores/permission';
import { IconMail, IconAt, IconCheck, IconInfoCircle, IconEdit } from '@tabler/icons-vue';

// Middleware
definePageMeta({
  middleware: ['auth', 'role',
    (to) => {
      const auth = useAuthStore();
      if (!auth.hasRole(ROLES.PForm_Role)) {
        return navigateTo('/formateur/permissions');
      }
    }
  ],
});

useHead({
  title: 'Configuration Permissions',
  meta: [
    { 
      name: 'description', 
      content: "Configuration de l'email de réception des demandes de permission." 
    }
  ]
});

const permissionStore = usePermissionStore();
const { success, error } = useToast();
const loading = ref(true);
const submitting = ref(false);
const showModal = ref(false);
const currentEmail = ref('');

const form = ref({
  email: ''
});

const openModal = () => {
  form.value.email = currentEmail.value;
  showModal.value = true;
};

// Chargement initial de l'email configuré
onMounted(async () => {
  try {
    const data = await permissionStore.getPermissionEmail();
    currentEmail.value = data.email;
  } catch (err: any) {
    error("Impossible de charger l'email de configuration.");
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500); 
  }
});

// Mise à jour de l'email de notification
const updateEmail = async () => {
  if (!form.value.email) return;
  
  submitting.value = true;
  try {
    const res = await permissionStore.updatePermissionEmail(form.value.email);
    currentEmail.value = form.value.email;
    success(res.message || "Email mis à jour avec succès", "Succès");
    showModal.value = false;
  } catch (err: any) {
    error(err.data?.message || "Erreur lors de la mise à jour", "Erreur");
  } finally {
    submitting.value = false;
  }
};
</script>
