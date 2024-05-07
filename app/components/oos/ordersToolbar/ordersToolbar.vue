<template>
  <header class="orders-toolbar | d-flex align-center pl-4 pr-4">
    <!-- v-if="orderFormatted" -->
    <div class="font-weight-bold accent--text d-flex align-center gap-2">
      <v-btn icon @click="showOrderGeneralInfo = !showOrderGeneralInfo">
        <v-icon size="20" :color="showOrderGeneralInfo ? 'primary' : 'white'"
          >mdi-information-outline</v-icon
        >
      </v-btn>
      <span>WO#: {{ order.woNumber }}</span>

      <!-- <v-menu
        v-model="showOrderGeneralInfo"
        bottom
        offset-y
        max-height="600"
        max-width="600"
        open-delay="600"
        :nudge-width="500"
        :close-on-content-click="false"
        :open-on-hover="!showOrderGeneralInfo"
      >-->
      <!-- eslint-disable-next-line -->
      <!--<template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip open-delay="600" content-class="small" top>-->
      <!-- eslint-disable-next-line -->
      <!--<template v-slot:activator="{ on: tooltip }">
              <v-btn icon v-bind="attrs" v-on="{ ...tooltip, ...menu }">
                <v-icon
                  size="20"
                  :color="showOrderGeneralInfo ? 'primary' : 'white'"
                  >mdi-information-outline</v-icon
                >
              </v-btn>
            </template>
            <span>{{ $t('orderGeneralInfo') }}</span>
          </v-tooltip>
        </template>
        <orders-general-info
          v-if="showOrderGeneralInfo"
          :order="order"
          @close="showOrderGeneralInfo = false"
        >
        </orders-general-info>
      </v-menu>-->
    </div>

    <v-spacer></v-spacer>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="mr-2"
          icon
          small
          :to="`/cdp/${selectOrder}`"
          nuxt
          v-bind="attrs"
          v-on="on"
        >
          <v-icon size="20" color="white"
            >mdi-file-document-edit-outline</v-icon
          >
        </v-btn>
      </template>
      <span>{{ $t('editOrder') }}</span>
    </v-tooltip>

    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="mr-2"
          icon
          small
          v-bind="attrs"
          v-on="on"
          @click="handleActiveChat"
        >
          <v-icon size="20" color="white">mdi-forum-plus-outline</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('orderChat') }}</span>
    </v-tooltip>

    <v-menu
      v-model="showPropertyHistoryDrawerOos"
      bottom
      offset-y
      :nudge-width="500"
      :close-on-content-click="false"
      max-height="600"
      open-delay="600"
      :open-on-hover="!showPropertyHistoryDrawerOos"
    >
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on: menu, attrs }">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              id="property-history-btn"
              icon
              small
              class="mr-2"
              v-bind="attrs"
              v-on="{ ...tooltip, ...menu }"
            >
              <!-- @click="handleToggleDrawers('showPropertyHistoryDrawer', true)" -->
              <v-icon
                size="20"
                :color="showPropertyHistoryDrawerOos ? 'primary' : 'white'"
                >mdi-home-clock-outline</v-icon
              >
            </v-btn>
          </template>
          <span>{{
            !showPropertyHistoryDrawerOos
              ? $t('showPropertyHistory')
              : $t('hidePropertyHistory')
          }}</span>
        </v-tooltip>
      </template>

      <property-history
        v-if="showPropertyHistoryDrawerOos"
        :order="order"
        @close="showPropertyHistoryDrawerOos = false"
      ></property-history>
    </v-menu>

    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          small
          class="mr-1"
          v-bind="attrs"
          v-on="on"
          @click="handleToggleDrawers('jobNotesDrawer', true)"
        >
          <v-icon size="20" :color="showJobNotesDrawerOos ? 'primary' : 'white'"
            >mdi-notebook-edit-outline</v-icon
          >
        </v-btn>
      </template>

      <span>{{
        !showJobNotesDrawerOos ? $t('showJobNotes') : $t('hideJobNotes')
      }}</span>
    </v-tooltip>
    <v-tooltip open-delay="600" content-class="small" top>
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="mr-2"
          icon
          small
          v-bind="attrs"
          v-on="on"
          @click="handleInvoice"
        >
          <v-icon size="20" :color="showInvoice ? 'primary' : 'white'"
            >mdi-invoice-list-outline</v-icon
          >
        </v-btn>
      </template>
      <span>{{ $t('invoice') }}</span>
    </v-tooltip>
  </header>
</template>

<script>
import { mapState } from 'vuex'
// import OrdersGeneralInfo from './ordersGeneralInfo.vue'
import PropertyHistory from '~/components/orders/propertyHistory/PropertyHistory.vue'

import { CATEGORY_OPTIONS, ORDER_STATUS } from '@/utils/dictionaries'

export default {
  name: 'OrdersToolbar',
  components: { PropertyHistory /* OrdersGeneralInfo */ },
  props: {
    order: { type: Object, required: true },
  },

  data() {
    return {
      CATEGORY_OPTIONS: null,
      ORDER_STATUS: null,
    }
  },
  computed: {
    ...mapState('oos/routes', { routes: (state) => state.routes }),
    ...mapState('oos/orders', { orders: (state) => state.orders }),
    showOrderGeneralInfo: {
      get() {
        return this.$store.state.oos.order.showOrderGeneralInfo
      },
      set(val) {
        this.$store.commit('oos/order/set_showOrderGeneralInfo', val)
      },
    },
    route() {
      return this.routes.find((route) => route.id === this.selectRoute)
    },
    orderR() {
      return {
        ...this.route.ordersR[this.selectOrder],
        id: this.selectOrder,
      }
    },
    stopsFormatted() {
      const stops = []

      if (this.routes && this.routes.length) {
        const indexOfRouteSelected = this.routes.findIndex(
          (route) => route.id === this.selectRoute
        )
        if (indexOfRouteSelected === -1) {
          return []
        }

        for (
          let i = 0;
          i < this.routes[indexOfRouteSelected].stops.length;
          i++
        ) {
          const stop = this.routes[indexOfRouteSelected].stops[i]
          const stopOrders = stop.orders
          const ordersFormatted = []

          for (let i = 0; i < this.orders.length; i++) {
            if (stopOrders.includes(this.orders[i].id)) {
              ordersFormatted.push(this.orders[i])
            }
          }
          stops.push({
            ...stop,
            orders: ordersFormatted,
          })
        }
      }

      return stops
    },
    orderFormatted() {
      const order = this.orders.find((order) => order.id === this.selectOrder)
      if (!order) {
        return null
      }
      return order
      // let index = this.ordersInRouteFormatted
      //   .map((e) => e.id)
      //   .indexOf(this.selectOrder)

      // if (this.selectOrder === null && this.ordersInRouteFormatted[0]) {
      //   // this.hendleSelectOrder(this.ordersInRouteFormatted[0].id)
      //   return this.ordersInRouteFormatted[0]
      // }

      // if (index === -1 && this.ordersInRouteFormatted[0]) {
      //   index = index + 1
      //   // this.hendleSelectOrder(this.ordersInRouteFormatted[index].id)
      // }
      // return this.ordersInRouteFormatted[index]
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
    isChatInState() {
      return this.$store.getters['chats/isChatInState'](this.order.chatRoomId)
    },
    oosDrawer: {
      get() {
        return this.$store.state.oos.routes.oosDrawer
      },
      set(val) {
        this.$store.commit('oos/routes/set_routeDrawer', val)
      },
    },
    oosDrawerOrder: {
      get() {
        return this.$store.state.oos.routes.oosDrawerOrder
      },
      set(val) {
        this.$store.commit('oos/routes/set_routeDrawerOrder', val)
      },
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
    showPropertyHistoryDrawerOos: {
      get() {
        return this.$store.state.oos.orders.showPropertyHistoryDrawerOos
      },
      set(val) {
        this.$store.commit('oos/orders/set_showPropertyHistoryDrawerOos', val)
      },
    },
    showJobNotesDrawerOos: {
      get() {
        return this.$store.state.oos.orders.showJobNotesDrawerOos
      },
      set(val) {
        this.$store.commit('oos/orders/set_showJobNotesDrawerOos', val)
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
    selectOrder(newVal) {
      this.$store.commit('oos/orders/hide_notification_order_by_id', newVal)
    },
    ordersInRouteFormatted(newVal) {
      if (newVal.length && this.selectOrder === null) {
        this.handleSelectOrder(newVal[0].id)
      }
    },
    selectRoute(newVal) {
      this.selectStop = 1
      if (this.ordersInRouteFormatted.length) {
        this.handleSelectOrder(this.ordersInRouteFormatted[0].id)
      }
    },
    // orderFormatted() {
    //   if (!this.resizeObserver) {
    //     this.resizeObserver = new ResizeObserver(this.handleResize)
    //     this.$nextTick(() => {
    //       this.resizeObserver.observe(this.$refs.toolbar.$el)
    //     })
    //   }
    // },
  },
  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
    this.ORDER_STATUS = ORDER_STATUS
  },
  mounted() {
    this.$store.commit(
      'oos/orders/hide_notification_order_by_id',
      this.selectOrder
    )
    if (this.selectOrder === null && this.orders[0]) {
      this.handleSelectOrder(this.orders[0].id)
    }
  },
  methods: {
    handleResize(entries) {
      for (const entry of entries) {
        const toolbarWidth = entry.contentRect.width

        const toolbarTitle = entry.target.querySelector('.toolbar-title')

        if (toolbarWidth < 726) {
          if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout)
          }
          this.resizeTimeout = setTimeout(() => {
            const toolbarTitleWidth = toolbarTitle.getBoundingClientRect().width
            toolbarTitle.style.setProperty('--width', toolbarTitleWidth + 'px')
            toolbarTitle.classList.add('truncate')
            this.resizeTimeout = null
          }, 210)
        } else {
          toolbarTitle.style.setProperty('--width', 'auto')
          toolbarTitle.classList.remove('truncate')
        }
      }
    },
    async handleOrderStatus(status) {
      try {
        await this.$store.dispatch('oos/orders/handleOrderStatus', {
          orderId: this.orderFormatted.id,
          status,
        })
        this.$mainAlertSuccess(this.$t('Success! Updated order status'))
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },
    handleEditOrder() {
      // this.$store.commit('oos/orders/set_showJobNotesDrawerOos', false)
      // this.$store.commit('oos/orders/set_openEditOrder', true)
      // this.$router.push(`/cdp/${this.selectOrder}`)
    },

    handleToggleDrawers(drawer, toggle) {
      switch (drawer) {
        case 'jobNotesDrawer':
          this.showPropertyHistoryDrawerOos = false
          this.showJobNotesDrawerOos = toggle
            ? !this.showJobNotesDrawerOos
            : true
          break
        case 'showPropertyHistoryDrawer':
          this.showJobNotesDrawerOos = false
          this.showPropertyHistoryDrawerOos = toggle
            ? !this.showPropertyHistoryDrawerOos
            : true
          break

        default:
          this.showJobNotesDrawerOos = false
          this.showPropertyHistoryDrawerOos = false
          break
      }
    },
    showChat() {
      this.$store.commit('chats/set_roomSelected', this.order.chatRoomId)
      this.$store.commit('chats/toggleShowChats')
    },
    async handleActiveChat() {
      try {
        if (!this.order) {
          return
        }
        if (!this.order.chatRoomId) {
          alert(this.$t('thisOrderHasNoChat'))
          return
        }

        if (!this.isChatInState) {
          this.loading = true
          await this.$store.dispatch('chats/update_chatRoomForOrder', {
            chatRoomId: this.order.chatRoomId,
            objectToSend: {
              active: true,
            },
          })
          let cont = 0
          const waiter = setInterval(() => {
            if (this.isChatInState) {
              this.showChat()
              clearInterval(waiter)
              this.loading = false
            }
            if (cont === 10000) {
              clearInterval(waiter)
              alert(this.$t('timeOut'))
              this.loading = false
            }
            cont++
          }, 1000)
          return
        }
        this.showChat()
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },

    handleShowNotification(e, orderId) {
      const el = e.target
      const box = el.getBoundingClientRect()

      this.$store.commit('oos/orders/set_showOrderNotification', {
        orderId,
        position: { x: box.right, y: box.bottom },
      })
    },
    handleShowNotificationLeave() {
      this.$store.commit('oos/orders/set_showOrderNotification', null)
    },
    handleSelectOrder(orderId) {
      if (
        this.$route.fullPath.includes('task') ||
        this.$route.name === 'cdp-id'
      ) {
        this.$router.replace('/cdp/route')
        this.$store.commit('oos/orders/set_showTask', false)
      }
      this.selectOrder = orderId
    },
    handleInvoice() {
      this.showInvoice = !this.showInvoice
    },
  },
}
</script>

<style lang="scss" scoped>
.orders-toolbar {
  background-color: var(--v-toolbarCdp-base);
  min-height: 48px;
}

.orders {
  background-color: var(--v-secondary-base) !important;
  color: #fff !important;
}

.orderSelected {
  background-color: var(--v-secondary-darken1) !important;
  color: #fff !important;
}
.orders:hover {
  background-color: var(--v-secondary-darken1) !important;
  color: #fff !important;
}
::v-deep .theme--dark {
  .orders {
    background-color: var(--v-secondary-base) !important;
  }
  .orders:hover {
    background-color: var(--v-secondary-darken1) !important;
  }
  .orderSelected {
    background-color: var(--v-secondary-darken1) !important;
  }
}

.notification-badge {
  width: 12px;
  height: 12px;
  margin-left: 3px;
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

::v-deep .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
