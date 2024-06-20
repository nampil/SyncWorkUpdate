<template>
  <v-app-bar density="compact" color="primary">
    <div class="brand pl-4 mr-4">
      <h1 class="text-h5 text-yellow-accent-2">
        <span class="font-weight-light">Sync</span
        ><span class="font-weight-medium">Work</span>
        <span class="font-weight-bold"> 365</span>
      </h1>
    </div>
    <v-divider vertical></v-divider>
    <nav class="ml-4">
      <ul class="nav-list d-flex align-center gap-4">
        <li><nuxt-link class="nav-link" to="/">Home</nuxt-link></li>
        <li>
          <nuxt-link class="nav-link" to="/dispatching">Dispatching</nuxt-link>
        </li>
        <li><nuxt-link class="nav-link" to="/cdp">CDP</nuxt-link></li>
        <li><nuxt-link class="nav-link" to="/admin">Admin</nuxt-link></li>
        <li><nuxt-link class="nav-link" to="/search">Search</nuxt-link></li>
      </ul>
    </nav>
    <v-spacer />
    <div class="actions | mr-4">
      <main-nav-profile-btn />
    </div>
  </v-app-bar>
</template>

<script setup>
import MainNavProfileBtn from '@/components/global/main-nav/ProfileBtn.vue'
</script>

<style lang="scss" scoped>
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.brand::after {
  content: '';
  display: block;
  height: 100%;
  width: 2px;
  background: #000;
}
.nav-link {
  color: inherit;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.85rem;
}
</style>
