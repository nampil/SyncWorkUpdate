// src/plugins/vuetify.js
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify)

// Translation provided by Vuetify (javascript)
import es from 'vuetify/lib/locale/es'

// Translation provided by Vuetify (typescript)

// Your own translation file

export default new Vuetify({
  lang: {
    locales: { es },
    current: 'en',
  },
  theme: {
    options: {
      customProperties: true,
      variations: true,
    },
    dark: false,
    themes: {
      light: {
        primary: '#1e67d4',
        primary_alt: colors.blueGrey.darken1,
        terciary: '#e9f7ff',
        accent: '#DCEF30',
        accent_alt: colors.amber.lighten1,
        secondary: '#138ad9',
        info: colors.blueGrey.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent3,
        // New
        icon_alt: colors.blue.lighten2,
        route_alt: colors.grey.lighten3,
        badge_alt: colors.blueGrey.lighten1,
        task: colors.white,
        background_toolbar: '#bcd8e6',
        icon_camera: '#fff',
        background_route_selected: '#ddecf6',
        primary_text: colors.blue.lighten2,
        info_text: '#7c7f89',
        toolbarCdp: '#5ab7f5',
        terciary_alt: colors.blue.lighten4,
        tagged: '#138ad9',
        background_drawer: '#f8fdff',
        text_stops: '#5ab7f5',
        info_stops: '#76bae7',
        background_stops: '#ccecff',
        background_select: '#93d4ff',
        background_route_update: '#e9f7ff',
      },
      dark: {
        tagged: '#dcef30',
        accent: '#DCEF30',
        primary: '#3276dc',
        secondary: '#24334c',
        terciary: '#252d37',
        terciary_alt: '#252d37',
        info: '#7aa5e7',
        toolbarCdp: '#192740',
        background_drawer: '#252d37',
        text_stops: '#DCEF30',
        info_stops: '#7aa5e7',
        background_stops: '#24334c',
        background_select: '#415a85',
        background_route_update: '#212629',
      },
    },
  },
})
