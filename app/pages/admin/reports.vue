<template>
  <div class="h-100 d-flex flex-column">
    <details-toolbar-admin></details-toolbar-admin>
    <NuxtChild></NuxtChild>
  </div>
</template>

<script>
import DetailsToolbarAdmin from '~/components/admin/templates/DetailsToolbarAdmin.vue'
export default {
  name: 'ReportsComp',
  components: { DetailsToolbarAdmin },
  layout: 'dash',
  middleware({ app, store, redirect }) {
    app.$mainAlertError('Not autorized to access this page.')
    const authLevel = store.state.auth.user?.userCredential?.claims?.authLevel
    if (!authLevel || parseFloat(authLevel) < 10) {
      redirect('/admin')
    }
  },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped></style>
