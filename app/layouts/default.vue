<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
    <alert />
  </v-app>
</template>

<script>
import Alert from '../components/misc/Alert.vue'
export default {
  name: 'DefaultLayout',
  components: {
    Alert,
  },
  beforeMount() {
    this.$store.dispatch('auth/handleAuth')
    const modeSaved = window.localStorage.getItem('themeMode')
    if (modeSaved && modeSaved !== 'system') {
      this.$vuetify.theme.dark = modeSaved === 'dark'
      return
    }

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme)').media !== 'not all'
    ) {
      // if user prefers light mode switch to light mode
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.$vuetify.theme.dark = false
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.$vuetify.theme.dark = true
      }
    }
  },
  created() {
    // this.$store.dispatch('auth/handleAuth')
  },
}
</script>
