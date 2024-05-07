<template>
  <div v-if="!editing" class="order-status d-flex">
    <v-menu v-if="!isHistory" offset-y max-height="400">
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="order-status-btn text_stops--text elevation-0"
          x-small
          :loading="loading"
          :ripple="!isHistory"
          v-bind="attrs"
          v-on="on"
          >{{
            currentStatus ? $truncate(currentStatus, 17) : 'No Status yet'
          }}</v-btn
        >
      </template>

      <v-list dense>
        <v-list-item-group
          v-model="statusSelected"
          color="primary"
          @change="handleChangeStatus(orderStatusList[$event])"
        >
          <v-list-item
            v-for="(routeStatus, index) in orderStatusList"
            :key="index"
            :disabled="statusSelected === index"
            dense
          >
            <v-list-item-title>{{ routeStatus.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>

    <span v-else>{{
      currentStatus ? $truncate(currentStatus, 25) : 'No Status yet'
    }}</span>

    <v-menu offset-y right max-height="400" max-width="300">
      <!-- eslint-disable-next-line -->
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          x-small
          class="order-status-historial-btn"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon x-small color="info">mdi-clock</v-icon>
        </v-btn>
      </template>
      <order-status-history :order-id="orderId" />
    </v-menu>
  </div>
</template>

<script>
import OrderStatusHistory from './orderStatusHistory.vue'
export default {
  name: 'OrderStatus',
  components: { OrderStatusHistory },
  props: {
    routeId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    currentStatus: { type: String, default: '' },
    editing: { type: Boolean, default: false },
    isHistory: { type: Boolean, default: false },
  },
  data() {
    return {
      statusSelected: null,
      loading: false,
      orderStatusHistory: [],
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user.profile
    },
    users() {
      return this.$store.state.auth.users
    },
    orderStatusList() {
      return this.$store.state.orderStatusList
        .map((s) => s)
        .sort((a, b) => {
          return a.title > b.title ? 1 : -1
        })
    },
    statusesOrders() {
      return this.$store.state.oos.orders.statusOrders
    },
  },

  methods: {
    async handleChangeStatus(status) {
      const oldStatus = this.currentStatus

      // eslint-disable-next-line
      console.log('oldStatus, status', oldStatus, status)

      try {
        this.$store.commit('oos/routes/set_orderStatus_on_route', {
          orderId: this.orderId,
          routeId: this.routeId,
          status: status.title,
        })

        await this.$store.dispatch('oos/orders/add_statusOrder', {
          orderId: this.orderId,
          status: status.title,
        })

        // this.handleOrderStatus(status.title)
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(
          `Error setting order status: ${JSON.stringify(error)}`
        )
        this.$store.commit('oos/routes/set_orderStatus_on_route', {
          orderId: this.orderId,
          routeId: this.routeId,
          status: oldStatus,
        })
      }
    },
    // async handleOrderStatus(status) {
    //   try {
    //     await this.$store.dispatch('oos/orders/handleOrderStatus', {
    //       orderId: this.orderId,
    //       status,
    //     })

    //     this.$store.commit('oos/routes/set_orderStatusInRoute', {
    //       routeId: this.routeId,
    //       orderId: this.orderId,
    //       status,
    //     })
    //   } catch (error) {
    //     // eslint-disable-next-line
    //     console.log('error: ', error)
    //     this.$mainAlertError(this.$t('oopsProblem'))
    //   }
    // },
  },
}
</script>

<style lang="scss" scoped>
.metadata {
  font-size: 0.6rem;
}
.order-status-btn {
  background-color: rgba(55, 102, 205, 0.097) !important;
}
.theme--dark {
  .order-status-btn {
    background-color: #dcef3011 !important;
  }
}
</style>
