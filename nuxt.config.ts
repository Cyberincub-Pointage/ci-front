export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: [
    ['nuxt-gtag', {
      id: 'G-S2H4ZNE84G',
      enabled: true
    }],
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
  ],

  sitemap: {
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Priority', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Change Frequency', select: 'sitemap:changefreq', width: '12.5%' },
      { label: 'Hreflangs', select: 'count(xhtml:link)', width: '25%' },
    ],
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
  },

  app: {
    head: {
      title: 'Plateforme de Pointage - CyberIncub',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plateforme de gestion des présences géolocalisées pour programme d\'incubation' },
        { name: 'google-site-verification', content: 'OdKxHpVkBSxk0mj4vD4OTmZPdVi5pWzyCu4QPIMHy9A' }
      ],
    }
  },

  runtimeConfig: {
    public: {
      baseAPI: process.env.API_URL,
      appName: 'CyberIncub Attendance',
    }
  },

  googleFonts: {
    display: 'swap',
    families: {
      'Open+Sans': [100, 200, 300, 400, 500, 600, 700, 800, 900],
      'Changa+One': [400],
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },
})
