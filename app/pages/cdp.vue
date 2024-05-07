<template>
  <div class="cdp-layout | h-100">
    <LoaderOverlay v-if="loading" />
    <NuxtChild></NuxtChild>
    <NotificationPopOut
      v-if="showOrderNotification"
      :order-id="showOrderNotification ? showOrderNotification.orderId : ''"
      :route-id="showOrderNotification ? showOrderNotification.routeId : ''"
      :position="
        showOrderNotification ? showOrderNotification.position : { x: 0, y: 0 }
      "
    ></NotificationPopOut>
    <Lupa />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Lupa from '@/components/misc/Lupa.vue'
import NotificationPopOut from '@/components/misc/NotificationPopOut.vue'
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'

export default {
  name: 'CDP',
  components: {
    Lupa,
    LoaderOverlay,
    NotificationPopOut,
  },
  layout: 'dash',
  // middleware: 'auth',
  data() {
    return {
      loading: false,
      audio: null,
      resizeObserver: null,
      resizeTimeout: null,
    }
  },
  head() {
    return {
      title: 'CDP',
    }
  },
  computed: {
    showUserInfo: {
      get() {
        return this.$store.state.users.showUserInfo
      },
      set(val) {
        this.$store.commit('users/set_showUserInfo', val)
      },
    },
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    ...mapState('oos/orders', {
      orders: (state) => state.orders,
      showOrderNotification: (state) => state.showOrderNotification,
    }),
    isChatInState() {
      return this.$store.getters['chats/isChatInState'](
        this.orderFormatted.chatRoomId
      )
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
          if (this.selectRoute === null) {
            for (let j = 0; j < this.routes.length; j++) {
              if (this.routes[j].orders.includes(this.orders[i].id)) {
                ordersF.push(this.orders[i])
              }
            }
          } else if (
            this.routes[indexOfRouteSelected].orders.includes(this.orders[i].id)
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
    playNotification() {
      return this.$store.state.oos.orders.playNotification
    },
    playNotificationRoute() {
      return this.$store.state.oos.routes.playNotificationRoute
    },
  },
  watch: {
    // orderFormatted() {
    //   if (!this.resizeObserver) {
    //     this.resizeObserver = new ResizeObserver(this.handleResize)
    //     this.$nextTick(() => {
    //       this.resizeObserver.observe(this.$refs.toolbar.$el)
    //     })
    //   }
    // },
    playNotification(val) {
      if (val) {
        // this.audio.play()
        this.$store.commit('oos/orders/update_playNotification', false)
      }
    },
    playNotificationRoute(val) {
      if (val) {
        // this.audio.play()
        this.$store.commit('oos/routes/update_playNotificationRoute', false)
      }
    },
    $route(val) {
      this.openEditOrder = val.name !== 'cdp-id'
    },
  },
  created() {
    // this.audio = new Audio(
    //   'https://firebasestorage.googleapis.com/v0/b/daytona-system-dev.appspot.com/o/config%2Faudio%2FnotificationSound.mp3?alt=media&token=45aea613-a636-43f1-bb4e-03d78605d6e8'
    // )
  },
  mounted() {
    if (!this.$store.state.orderStatusList.length) {
      this.$store.dispatch('get_orderStatusList')
    }
    if (!this.routes.length) {
      this.getRoute()
    }
  },
  methods: {
    async getRoute() {
      this.loading = true
      try {
        const forDateStr = this.$formatDate(new Date(), { iso: true })

        await this.$store.dispatch(
          'oos/routes/get_route_for_day_date',
          forDateStr
        )
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
        this.loading = false
      }
    },
    // hendleSelectOrder(idOrder) {
    //   this.selectOrder = idOrder
    // },
  },
}
</script>

<style lang="scss" scoped>
.toolbar-title {
  --width: 100%;
  line-height: 1;
  font-weight: 600;
  &.truncate {
    flex-shrink: 1;
    width: var(--width);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
:v-deep .body-main {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
::v-deep .body-main::-webkit-scrollbar {
  display: none; /* Chrome */
}
</style>
