<template>
  <aside class="stops-drawer-container">
    <div
      v-if="!ordersR.length"
      class="h-100 d-flex justify-center text-subtitle-2 info--text pt-2"
    >
      {{ $t('noOrders') }}
    </div>

    <div v-if="ordersR.length > 0" class="list | h-100">
      <edit-routes
        :edit-route="routeFormatted"
        :put-back-option="false"
        :get-info="true"
        :num="positionFormatted"
        :orders-on-routes="routeFormatted.orders"
        :editing="false"
        :google="google"
        :is-stops-drawer="true"
      ></edit-routes>
    </div>
  </aside>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import { mapState } from 'vuex'
import EditRoutes from '../editRoutesContent/EditRoutes.vue'
export default {
  name: 'StopsDrawer',
  components: { EditRoutes },
  props: { route: { type: Object, default: () => ({}) } },
  data() {
    return {}
  },
  computed: {
    google: getGoogleMapsAPI,
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    ...mapState('oos/orders', { orders: (state) => state.orders }),

    positionFormatted() {
      const _routes = this.routes
        .filter((r) => r.createdAt)
        .sort((a, b) => {
          const aCreatedAt = new Date(a.createdAt.seconds * 1000)
          const bCreatedAt = new Date(b.createdAt.seconds * 1000)
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
      const indexOfRouteSelected = _routes.findIndex(
        (route) => route.id === this.selectRoute
      )
      return indexOfRouteSelected + 1 || 1
    },

    selectRoute() {
      return this.$store.state.oos.routes.selectRoute
    },
    selectOrder: {
      get() {
        return this.$store.state.oos.routes.selectOrder
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectOrder', val)
      },
    },
    selectStop: {
      get() {
        return this.$store.state.oos.routes.selectStop
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectStop', val)
      },
    },
    routeFormatted() {
      return this.$store.getters['oos/routes/routeSelectedFormatted']
    },
    ordersR() {
      const _ordersR = this.routeFormatted?.ordersR
      if (!_ordersR) return []
      return Object.entries(_ordersR).map(([key, value]) => {
        return {
          ...value,
          id: key,
        }
      })
    },
  },

  async mounted() {
    if (this.selectOrder === null && this.orders[0]) {
      this.handleSelectOrder(this.orders[0].id)
    }
    try {
      await this.$gmapApiPromiseLazy()
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },
  methods: {
    setStopSelected(stop) {
      if (this.selectStop !== stop.num) {
        this.selectStop = stop.num
        this.selectOrder = stop.orders[0].id
      }
      if (
        this.$route.fullPath.includes('cdp-id') ||
        this.$route.name === 'cdp-id'
      ) {
        this.$router.replace(`/cdp/${this.selectOrder}`)
      }
    },

    handleSelectOrder(orderId) {
      this.selectOrder = orderId

      if (
        this.$route.fullPath.includes('task') ||
        this.$route.name === 'cdp-id'
      ) {
        this.$router.replace('/cdp/route')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.drawer-wrapper {
  max-width: 0;
  transition: max-width 250ms ease-in-out;
  &.open {
    max-width: 256px;
  }
}
.orders {
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: var(--v-terciary-base);
  transition: all 200ms ease-in-out;
}

.selected {
  background-color: var(--v-secondary-base);
  color: #fff;
  // background-color: #baddf84d;
}
.orders:hover {
  // background-color: #baddf84d;
  background-color: var(--v-secondary-base);
  color: #fff;
}
::v-deep .theme--dark {
  .orders:hover {
    background-color: var(--v-secondary-base);
  }
  .selected {
    background-color: var(--v-secondary-base);
  }
}

li {
  padding: 0.15rem;
  font-size: 0.9rem;
}
ul,
ol {
  padding: 0;
  list-style: none;
}

.notification-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  background-color: var(--v-error-base);
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 11, 11, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(230, 11, 11, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 11, 11, 0);
  }
}

.order {
  font-size: 0.75rem;
  font-weight: bold;
}
.list {
  overflow-y: auto;
}

::v-deep .v-navigation-drawer__content,
.list {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
::v-deep .v-navigation-drawer__content::-webkit-scrollbar,
.list::-webkit-scrollbar {
  display: none; /* Chrome */
}
::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.stops-drawer-container {
  border-right: 1px solid var(--clr-bg-alt);
  min-width: 400px;
  width: 400px;
  background-color: var(--v-background_drawer-base);
}
</style>
