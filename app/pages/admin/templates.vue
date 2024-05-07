<template>
  <div class="h-100 d-flex flex-column">
    <details-toolbar-admin></details-toolbar-admin>
    <NuxtChild></NuxtChild>
  </div>
</template>

<script>
import DetailsToolbarAdmin from '~/components/admin/templates/DetailsToolbarAdmin.vue'
export default {
  name: 'TemplateComp',
  components: { DetailsToolbarAdmin },
  layout: 'dash',
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped></style>
