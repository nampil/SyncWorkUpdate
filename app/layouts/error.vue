<template>
  <!-- <v-app>
    <v-main>
      <v-container> -->
  <div class="">
    <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <NuxtLink to="/"> Home page </NuxtLink>
  </div>
  <!-- </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app> -->
</template>

<script>
export default {
  name: 'EmptyLayout',
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred',
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title,
    }
  },
  beforeMount() {
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
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
