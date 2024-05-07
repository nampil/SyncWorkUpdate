<template>
  <div class="more-info-wrapper">
    <v-divider class="my-1"></v-divider>
    <header
      class="header | info_stops--text d-flex align-center justify-space-between"
    >
      <span class="subtitle-2">More Info</span>

      <v-btn icon x-small @click="showSeeMore = !showSeeMore">
        <v-icon size="22"
          >{{ !showSeeMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
      </v-btn>
    </header>
    <div :class="['container-info', { expanded: showSeeMore }]">
      <div class="pa-4 pt-0">
        <div class="origin-address-container">
          <p class="ma-0 pa-0 caption">
            <span class="caption info_stops--text">{{
              $t('originAddress')
            }}</span>
            <v-tooltip open-delay="600" content-class="small" top>
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-show="editing"
                  icon
                  x-small
                  v-bind="attrs"
                  v-on="on"
                  @click="showSelectOriginAddress = !showSelectOriginAddress"
                >
                  <v-icon small color="primary">mdi-pencil-outline</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('editRouteOriginAddress') }}</span>
            </v-tooltip>
            <span class="caption info_stops--text">: </span>
            <span>{{ route.originAddress }}</span>
          </p>
        </div>
        <!-- <supervisors :route="route" :editing="editing"></supervisors> -->
        <materials-or-tools-in-route
          :orders="route.orders"
          :editing="editing"
        ></materials-or-tools-in-route>
      </div>
    </div>
    <SelectOriginAddress
      :show="showSelectOriginAddress"
      :google="google"
      :home-location="homeLocation"
      :route="route"
      @close="handleCloseSelectOriginAddress"
      @save-origin-address="handleSaveOriginAddress"
    ></SelectOriginAddress>
  </div>
</template>

<script>
// import Supervisors from './Supervisors.vue'
import MaterialsOrToolsInRoute from './MaterialsOrToolsInRoute.vue'
import SelectOriginAddress from '~/components/modals/SelectOriginAddress.vue'
export default {
  name: 'MoreInfo',
  components: {
    /* Supervisors, */ MaterialsOrToolsInRoute,
    SelectOriginAddress,
  },
  props: {
    route: { type: Object, default: () => ({}) },
    editing: { type: Boolean, default: true },
    google: { type: [Object, Boolean], default: () => ({}) },
  },
  data() {
    return {
      showSeeMore: false,
      showSelectOriginAddress: false,
    }
  },
  computed: {
    homeLocation() {
      return this.$store.state.config.homeLocation
    },
  },
  methods: {
    handleSaveOriginAddress(origin) {
      this.$emit('update-origin', origin)
    },
    handleCloseSelectOriginAddress() {
      this.showSelectOriginAddress = false
    },
  },
}
</script>

<style lang="scss" scoped>
.more-info-wrapper {
  background-color: var(--v-background_route_update-base);
  overflow-y: hidden;
}

.container-info {
  max-height: 0;
  overflow: hidden;
  transition: max-height 250ms ease-in-out;
  &.expanded {
    max-height: 200px;
    scrollbar-gutter: stable;
    overflow-y: auto;
  }
}
.header {
  padding: 2px 16px 2px 16px;
}
</style>
