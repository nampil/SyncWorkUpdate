<template>
  <div class="h-100">
    <loader-overlay v-if="mainLoading"></loader-overlay>

    <table-orders v-else></table-orders>
  </div>
</template>

<script>
import TableOrders from '~/components/home/TableOrders.vue'
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'
export default {
  name: 'HomeIndex',
  components: { TableOrders, LoaderOverlay },

  data() {
    return {
      theQuote: null,
      showTheQuote: false,
    }
  },
  computed: {
    mainLoading() {
      return this.$store.state.mainLoading
    },
  },
}
</script>

<style lang="scss" scoped></style>
