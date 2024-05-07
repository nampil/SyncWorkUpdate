<template>
  <div class="route-layout | h-100 d-flex overflow-hidden">
    <div class="route-layout-content | h-100 d-flex flex-column flex-grow-1">
      <routes-toolbar></routes-toolbar>
      <div class="flex-grow-1 d-flex overflow-hidden">
        <stops-drawer :route="routeSelectedFormatted"></stops-drawer>
        <section class="d-flex flex-column flex-grow-1">
          <!-- <div v-if="loadingOrder">loading...</div> -->
          <orders-toolbar
            v-if="order"
            ref="toolbar"
            class="elevation-0 mb-0 flex-grow-0"
            :order="order"
          ></orders-toolbar>

          <nuxt-child />
        </section>
      </div>
    </div>
    <job-notes-drawer
      :order="order"
      :show="showJobNotesDrawerOos"
      class="job-notes-drawer"
    >
    </job-notes-drawer>
    <transition name="grow">
      <OrderInvoice
        v-if="showInvoice && order"
        :order="order"
        :closing="false"
        @close-notes="handleCloseInvoice"
      />
    </transition>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import JobNotesDrawer from '~/components/orders/jobNotes/JobNotesDrawer.vue'
import OrdersToolbar from '~/components/oos/ordersToolbar/ordersToolbar.vue'
import RoutesToolbar from '~/components/oos/routesToolbar/routesToolbar.vue'
import StopsDrawer from '~/components/oos/stopsDrawer/StopsDrawer.vue'
import OrderInvoice from '~/components/oos/invoice/OrderInvoice.vue'

export default {
  name: 'MyRouteLayout',

  components: {
    RoutesToolbar,
    StopsDrawer,
    OrdersToolbar,
    JobNotesDrawer,
    OrderInvoice,
  },
  head() {
    return {
      title: `CDP - ${this.routeSelectedFormatted?.groupName ?? ''}`,
    }
  },
  computed: {
    routeQuery() {
      return this.$route.query
    },
    order() {
      return this.$store.state.oos.order.order
    },
    loadingOrder() {
      return this.$store.state.oos.order.loadingOrder
    },
    ...mapState('oos/orders', {
      orders: (state) => state.orders,
    }),
    ...mapGetters('oos/routes', {
      routeSelectedFormatted: 'routeSelectedFormatted',
    }),
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    showJobNotesDrawerOos: {
      get() {
        return this.$store.state.oos.orders.showJobNotesDrawerOos
      },
      set(val) {
        this.$store.commit('oos/orders/set_showJobNotesDrawerOos', val)
      },
    },
    ordersInRouteFormatted() {
      const ordersF = []
      if (
        this.routes &&
        this.routes.length &&
        this.orders &&
        this.orders.length
      ) {
        const indexOfRouteSelected = this.routes.findIndex(
          (route) => route.id === this.selectRoute
        )

        for (let i = 0; i < this.orders.length; i++) {
          if (!this.selectRoute) {
            for (let j = 0; j < this.routes.length; j++) {
              if (this.routes[j].orders.includes(this.orders[i].id)) {
                ordersF.push(this.orders[i])
              }
            }
          } else if (
            this.routes[indexOfRouteSelected]?.orders.includes(
              this.orders[i].id
            )
          ) {
            ordersF.push(this.orders[i])
          }
        }
      }
      return ordersF
    },
    orderFormatted() {
      let index = this.ordersInRouteFormatted
        .map((e) => e.id)
        .indexOf(this.selectOrder)

      if (this.selectOrder === null && this.ordersInRouteFormatted[0]) {
        // this.hendleSelectOrder(this.ordersInRouteFormatted[0].id)
        return this.ordersInRouteFormatted[0]
      }

      if (index === -1 && this.ordersInRouteFormatted[0]) {
        index = index + 1
        // this.hendleSelectOrder(this.ordersInRouteFormatted[index].id)
      }
      return this.ordersInRouteFormatted[index]
    },
    selectRoute: {
      get() {
        return this.$store.state.oos.routes.selectRoute
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectRoute', val)
      },
    },
    selectOrder: {
      get() {
        return this.$store.state.oos.routes.selectOrder
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectOrder', val)
      },
    },
    showInvoice: {
      get() {
        return this.$store.state.invoice.showInvoice
      },
      set(val) {
        this.$store.commit('invoice/set_showInvoice', val)
      },
    },
  },
  watch: {
    routeQuery: {
      handler(newVal) {
        if (newVal.selectRoute) {
          this.selectRoute = newVal.selectRoute
        }
        if (newVal.selectOrder) {
          this.selectOrder = newVal.selectOrder
          this.getOrder()
        } else if (this.ordersInRouteFormatted[0]) {
          this.selectOrder = this.ordersInRouteFormatted[0].id
        }
      },
      immediate: true,
    },
  },
  // beforeMount() {

  //   if (this.$route.query.selectRoute) {
  //     this.selectRoute = this.$route.query.selectRoute
  //   }
  //   if (this.$route.query.selectOrder) {
  //     this.selectOrder = this.$route.query.selectOrder
  //   } else if (this.ordersInRouteFormatted[0]) {
  //     this.selectOrder = this.ordersInRouteFormatted[0].id
  //   }
  // },
  mounted() {
    // eslint-disable-next-line
    console.log('Mounted')
  },
  methods: {
    async getOrder() {
      try {
        await this.$store.dispatch(
          'oos/order/get_orderSelected',
          this.selectOrder
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error loading order', error)

        this.$mainAlertError('There was an error loading the order')
      }
    },
    handleCloseInvoice() {
      this.showInvoice = !this.showInvoice
    },
  },
}
</script>

<style lang="scss" scoped></style>
