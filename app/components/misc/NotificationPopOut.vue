<template>
  <div
    v-click-outside="handleClose"
    class="notifications-list"
    :style="`--y: ${position.y}px; --x: ${position.x}px;`"
  >
    <ul v-if="notifications?.length">
      <!-- <li v-for="noti in notifications" :key="noti.id" class="noti-item | pa-3"> -->
      <nuxt-link
        v-for="noti in notifications"
        :key="noti.id"
        class="noti-item | pa-3"
        tag="li"
        :to="{
          name: 'cdp-route-task',
          query: {
            selectOrder: orderId,
            selectRoute: noti.routeId,
            taskSelected: noti.taskId,
          },
        }"
      >
        <!-- @click="handleOnItemClick(noti)" -->
        <v-icon color="error">mdi-circle-medium</v-icon>
        <!-- <v-btn color="error" icon small @click.stop="handleDeleteNoti(noti)">
          <v-icon small>mdi-close-thick</v-icon>
        </v-btn> -->
        <span>{{ noti.itemTitle }}:</span>
        <span class="font-weight-medium accent--text">{{ noti.update }}</span>
      </nuxt-link>
      <!-- </li> -->
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    position: { type: Object, default: () => ({ x: 0, y: 0 }) },
    orderId: { type: String, default: '' },
  },
  computed: {
    notificationsByOrderId() {
      return this.$store.getters['oos/orders/notificationsByOrdersId']
    },
    notifications() {
      if (!this.orderId) {
        return []
      }

      return this.notificationsByOrderId[this.orderId] ?? []
    },
    order() {
      if (!this.orderId) {
        return null
      }

      return this.$store.state.oos.orders.orders.find(
        (order) => order.id === this.orderId
      )
    },
    selectOrder() {
      return this.$store.state.oos.routes.selectOrder
    },
  },
  watch: {
    $route() {
      this.$store.commit('oos/orders/set_showOrderNotification', null)
    },
  },

  methods: {
    handleClose() {
      this.$store.commit('oos/orders/set_showOrderNotification', null)
    },
    // handleDeleteNoti(noti) {
    //   this.$store.commit('oos/orders/remove_notification', {
    //     orderId: this.orderId,
    //     notiId: noti.id,
    //   })
    // },
    handleOnItemClick(noti) {
      const orderId = this.orderId
      this.$store.commit('oos/routes/set_selectRoute', noti.routeId)
      this.$store.commit('oos/routes/set_selectOrder', this.orderId)
      this.$store.commit('oos/orders/set_taskSelected', {
        orderId,
        taskId: noti.taskId,
        taskTitle: noti.taskTitle,
        type: noti.type,
        wo: this.order.woNumber,
      })

      if (noti.reportId) {
        this.$store.commit('oos/orders/set_hightlightTaskChat', noti.reportId)
        this.$store.commit('oos/orders/set_showTaskChats', noti.showTaskChat)
      }

      this.$router.push('/cdp/route/task')
      this.handleClose()
    },
  },
}
</script>

<style lang="scss" scoped>
.notifications-list {
  --x: 100px;
  --y: 100px;
  max-width: 600px;
  max-height: 400px;
  width: 100%;

  position: fixed;
  top: var(--y);
  left: var(--x);
  transform: translate(-50%, 25px);
  z-index: 999;
  background-color: var(--clr-bg-alt);
  box-shadow: 0 3px 6px rgba($color: #000000, $alpha: 0.3);
  border-radius: 0.5rem;
  overflow: hidden auto;
}

ul {
  padding: 0;
  list-style: none;
}

.noti-item {
  border-bottom: 1px solid var(--v-terciary-base);
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: var(--v-secondary-base);
  }
}
.noti-link,
a {
  color: inherit;
  text-decoration: none;
}
</style>
