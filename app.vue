<template>
  <div class="min-h-screen bg-gray-50 font-body">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | CyberIncub` : 'CyberIncub - Gestion d\'Incubateurs & Formation';
  },
  htmlAttrs: {
    lang: 'fr'
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
});

useSeoMeta({
  // Description générale
  title: 'CyberIncub - Plateforme de gestion pour Incubateurs',
  description: 'Optimisez la gestion de votre incubateur avec CyberIncub. Suivi des présences en temps réel, gestion des apprenants (incubés), administration simplifiée des formateurs et suivi des paiements. La solution tout-en-un pour les centres de formation moderne.',
  keywords: 'gestion incubateur, suivi présence, formation en ligne, administration école, logiciel scolarité, cyberincub, gestion apprenants',

  // Open Graph (Facebook, LinkedIn, etc.)
  ogTitle: 'CyberIncub - Gestion Intelligente d\'Incubateurs',
  ogDescription: 'Simplifiez votre administration : présences, paiements, et suivi pédagogique centralisés sur une plateforme intuitive.',
  ogType: 'website',
  ogSiteName: 'CyberIncub',
  ogImage: '/img/logo-c.png',
  ogImageAlt: 'CyberIncub Dashboard',
  ogLocale: 'fr_FR',

  // Twitter
  twitterCard: 'summary_large_image',
  twitterTitle: 'CyberIncub - La Plateforme de Gestion pour Incubateurs',
  twitterDescription: 'Suivi des présences, gestion des incubés et administration simplifiée. Découvrez CyberIncub.',
  twitterImage: '/img/logo-c.png',
  twitterCreator: '@CyberIncub',
  robots: 'index, follow',

  // Mobile
  themeColor: '#ffffff',
});
</script>
