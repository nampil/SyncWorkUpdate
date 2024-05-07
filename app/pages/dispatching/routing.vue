<template>
  <div class="h-100 d-flex flex-column">
    <RoutingToolbar class="flex-grow-0" />
    <div class="content | h-100">
      <div class="grid | h-100 flex-grow-1">
        <div class="panel-wrapper">
          <OrdersPanel @get-markers="getMarkers" />
        </div>
        <div ref="resizerLeft" class="resizer r-left"></div>
        <div ref="centerPanel" class="panel-wrapper center-panel">
          <RoutesPanel @get-markers="getMarkers" />
        </div>
        <div ref="resizerRight" class="resizer r-right"></div>
        <div class="panel-wrapper">
          <MapPanel />
        </div>
      </div>
    </div>
    <LoaderOverlay v-if="savingRoutes"></LoaderOverlay>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Split from 'split-grid'
import { StringIdGenerator } from '~/utils/generateLabels'
import MapPanel from '~/components/routes/seeInMap/MapPanel.vue'
import OrdersPanel from '~/components/routes/seeInMap/OrdersPanel.vue'
import RoutesPanel from '~/components/routes/seeInMap/RoutesPanel.vue'
import RoutingToolbar from '~/components/routes/seeInMap/RoutingToolbar.vue'
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'
const { mapState, /* mapActions, mapMutations, */ mapGetters } =
  createNamespacedHelpers('routes')

export default {
  name: 'Routing',
  components: {
    RoutingToolbar,
    OrdersPanel,
    RoutesPanel,
    MapPanel,
    LoaderOverlay,
  },
  layout: 'dash',
  data() {
    return {
      loading: false,
      labelsFactory: new StringIdGenerator(),
    }
  },
  computed: {
    ...mapState({
      markers: 'markers',
      filter: 'filter',
      savingRoutes: 'savingRoutes',
    }),
    ...mapGetters({
      orderList: 'orderList',
      filteredOrderList: 'filteredOrderList',
    }),
  },
  mounted() {
    Split({
      minSize: 250,
      columnMinSizes: {
        1: 250,
      },
      columnGutters: [
        {
          track: 1,
          element: this.$refs.resizerLeft,
        },
        {
          track: 3,
          element: this.$refs.resizerRight,
        },
      ],
    })
  },
  methods: {
    getMarkers({ orders, reset }) {
      try {
        this.$nextTick(() => {
          for (let i = 0; i < orders.length; i++) {
            const order = orders[i]

            const orderMarked = this.markers.find((m) => m.id === order.id)

            // eslint-disable-next-line
            console.log('getMarkers', order.id)

            if (orderMarked) {
              // eslint-disable-next-line
              console.log('SKIP getMarkers', order.id)
              continue
            }

            const address = encodeURIComponent(
              `${order.address} ${order.city} ${order.county || ''} ${
                order.state || ''
              } ${order.zip}`
            )
            const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?'
            const apiKey = this.$config.gmapApiKey
            const res = this.$axios.$get(
              baseUrl + 'address=' + address + '&key=' + apiKey
            )

            const nextLabel = order.label ?? this.labelsFactory.next()

            res.then((res) =>
              this.$store.dispatch('routes/set_marker', {
                res,
                order,
                nextLabel,
              })
            )
          }
        })
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)

        this.$mainAlertError(this.$t('problemsAddressOrder'))
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.content {
  flex: 1 1 100%;
}
.panel-wrapper {
  display: grid;
}
.grid {
  flex: 1 0 100%;
  display: grid;
  grid-template-columns: 1fr 10px 1fr 10px 1fr;
}
.resizer {
  grid-row: 1/-1;
  background-color: var(--v-terciary-base);
  cursor: col-resize;
}

.r-left {
  grid-column: 2;
}

.r-right {
  grid-column: 4;
}
</style>
