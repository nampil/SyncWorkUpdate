<template>
  <div
    :class="['drawer-wrapper overflow-hidden flex-shrink-0', { open: open }]"
  >
    <v-navigation-drawer v-model="open" right width="340">
      <div class="summary-toolbar | d-flex pa-3 align-center justify-center">
        <h4 class="info--text subtitle-2">Summary</h4>
      </div>
      <v-divider></v-divider>
      <div class="summary-content | overflow-y-auto">
        <div v-for="route in routes" :key="route.id">
          <route-summary-content :route="route"></route-summary-content>
          <v-divider></v-divider>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import RouteSummaryContent from './RouteSummaryContent.vue'
export default {
  name: 'RoutesSummaryDrawer',
  components: { RouteSummaryContent },
  props: {
    showSummaryDrawer: { type: Boolean, default: false },
    routes: { type: Array, default: () => [] },
  },
  data() {
    return { open: false }
  },

  watch: {
    showSummaryDrawer(val) {
      this.open = val
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer-wrapper {
  width: 0;
  transition: width 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  &.open {
    width: 340px;
    transition: width 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.summary-content {
  min-width: 340px;
}
</style>
