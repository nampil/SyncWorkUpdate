<template>
  <div class="cdp-index | h-100">
    <RoutingContentEdit :is-dash="true" />
  </div>
</template>

<script>
import RoutingContentEdit from '~/components/oos/editRoutesContent/RoutingContentEdit.vue'
export default {
  name: 'OosDash',
  components: {
    RoutingContentEdit,
  },
  data() {
    return {}
  },
  computed: {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
