import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  alias: {
    '@components/*': fileURLToPath(new URL('components/', import.meta.url)),
    '@store/*/**': fileURLToPath(new URL('store/*/**', import.meta.url)),
  },

  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },

    '@vueuse/nuxt',
    'nuxt-vuefire',
    '@pinia/nuxt',
    'nuxt-lodash',
  ],
  vuefire: {
    auth: {
      enabled: true,
    },
    optionsApiPlugin: 'firestore',
    config: {
      apiKey: process.env.FB_APY_KEY,
      authDomain: process.env.FB_AUTH_DOMAIN,
      projectId: process.env.FB_PROJECT_ID,
      storageBucket: process.env.FB_STORAGE_BUCKET,
      messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
      appId: process.env.FB_APP_ID,
      measurementId: process.env.FB_MEASUREMENT_ID,
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
