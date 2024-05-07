<template>
  <div class="route-index | h-100 d-flex flex-column">
    <order-tab-content> </order-tab-content>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import OrderTabContent from '~/components/oos/taskContent/orderTabContent.vue'
export default {
  name: 'IndexRoute',
  components: { OrderTabContent },
  props: {
    order: { type: [Object, null], default: null },
  },
  // beforeRouteEnter(to, from, next) {
  //   // eslint-disable-next-line
  //   console.log('from', from)

  //   if (from.path === '/login') {
  //     next('/cdp')
  //   }
  //   next()
  // },
  computed: {
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    ...mapState('oos/orders', {
      orders: (state) => state.orders,
      showOrderNotification: (state) => state.showOrderNotification,
    }),
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
    route() {
      return this.routes.find((route) => route.id === this.selectRoute)
    },

    orderR() {
      return this.route.ordersR[this.selectOrder]
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
  },
  mounted() {},
}
</script>

<style lang="scss" scoped></style>
