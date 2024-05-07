export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - SyncWork365',
    title: '',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@/assets/main.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/firebase.js',
    '~/plugins/mainAlert.js',
    '~/plugins/formatDate.js',
    '~/plugins/getCategoryColor.js',
    '~/plugins/getPropertyId.js',
    '~/plugins/notifyUser.js',
    '~/plugins/lodash.js',
    '~/plugins/gmap.js',
    '~/plugins/generateId.js',
    '~/plugins/truncate.js',
    '~/plugins/createWorker.client.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/axios', '@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', dir: 'ltr' },
      { code: 'es', iso: 'es-ES', file: 'es.json', dir: 'ltr' },
    ],
    detectBrowserLanguage: {
      alwaysRedirect: false,
      fallbackLocale: '',
      redirectOn: 'root',
      useCookie: true,
      cookieCrossOrigin: false,
      cookieDomain: null,
      cookieKey: 'i18n_redirected',
      cookieSecure: false,
    },
    defaultLocale: 'en',
    langDir: '~/locales/',
    strategy: 'no_prefix',
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    optionsPath: 'vuetify.options.js',
  },
  vue: {
    config: {
      productionTip: true,
      devtools: process.env.NODE_ENV === 'development',
    },
  },

  publicRuntimeConfig: {
    gmapApiKey: process.env.gmapApiKey,
    algoliaAppId: process.env.algoliaAppId,
    algoliaSearchKey: process.env.algoliaSearchKey,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['chart.js'],
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      })
      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.worker\.js$/,
          loader: 'worker-loader',
          exclude: /(node_modules)/,
        })
      }
    },

    loaders: {
      vue: {
        transformAssetUrls: {
          audio: 'src',
        },
      },
    },
  },
}
