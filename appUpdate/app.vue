<template>
  <NuxtLayout>
    <v-app>
      <main-nav />
      <v-main>
        <NuxtPage />
      </v-main>
      <v-footer name="footer" app>
        <v-spacer />
        <span>&copy; 2024</span>
      </v-footer>
    </v-app>
  </NuxtLayout>
</template>
<script setup>
import MainNav from '@/components/global/MainNav.vue'
</script>

<style lang="scss">
@use '~/assets/scss/main.scss';
</style>
