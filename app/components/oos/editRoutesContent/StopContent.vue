<template>
  <div class="stop-content">
    <div class="d-flex align-center justify-space-between">
      <span class="text_stops--text text-subtitle-2"
        >{{ $t('stop') }} {{ stop.num }}</span
      >
      <v-tooltip
        v-if="editing && !isStopCompleted && !isHistory"
        open-delay="600"
        content-class="small"
        top
      >
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            x-small
            v-bind="attrs"
            v-on="on"
            @click="$emit('handle-delete-stop', stop)"
          >
            <v-icon class="close-stop" small color="error">mdi-close</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('deleteStop') }}</span>
      </v-tooltip>
    </div>

    <p>{{ stop.address }}</p>

    <div
      v-for="(order, index) in stop.orders"
      :id="order ? order.id : ''"
      :key="index"
      class="container-orders | gap-2"
      :class="[`${isStopsDrawer ? 'pb-1' : ''}`]"
    >
      <div v-if="order" class="d-flex align-center flex-wrap">
        <v-tooltip v-if="!editing" open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              x-small
              icon
              color="primary"
              class="mr-1"
              v-bind="attrs"
              v-on="on"
              @click="handleExpanded(order)"
              ><v-icon size="20">{{
                expanded && orderProgressSelected.id === order.id
                  ? 'mdi-chevron-up'
                  : 'mdi-chevron-down'
              }}</v-icon></v-btn
            >
          </template>
          <span>Show Progress</span>
        </v-tooltip>
        <v-btn
          v-if="!isHistory"
          class="py-1 d-flex aling-center gap-2"
          :class="[
            { selected: selectOrder === order.id && isStopsDrawer },
            `${isStopsDrawer ? 'order | pl-2 pr-2' : ''}`,
          ]"
          small
          :ripple="!isHistory"
          plain
          color="accent"
          :text="isHistory"
          :to="
            !isHistory
              ? {
                  name: 'cdp-route',
                  query: {
                    selectRoute: routeId,
                    selectOrder: order.id || order,
                  },
                }
              : null
          "
        >
          <!-- @click="handleSelectOrder(order.id)" -->
          <v-icon
            v-if="order.category"
            small
            :color="
              $getCategoryColor({ category: order.category, className: true })
            "
          >
            mdi-flag
          </v-icon>
          {{ order.woNumber ? 'WO# ' + order.woNumber : 'WO ID: ' + order }}
        </v-btn>
        <div v-else>
          <v-btn nuxt :to="`/dispatching/${order.id ?? order}`" text small>
            <v-icon
              v-if="order.category"
              small
              :color="
                $getCategoryColor({ category: order.category, className: true })
              "
            >
              mdi-flag
            </v-icon>
            <span class="accent--text font-weight-bold">
              {{ order.woNumber ? 'WO# ' + order.woNumber : 'WO ID: ' + order }}
            </span>
          </v-btn>
        </div>

        <v-menu
          v-if="order.isReopen"
          offset-y
          left
          max-height="400"
          max-width="300"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              small
              class="order-status-historial-btn | ml-2"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon small color="error">mdi-alpha-r-circle</v-icon>
            </v-btn>
          </template>
          <ReopenHistory :order-id="order.id" />
        </v-menu>

        <v-tooltip
          v-if="editing && !isStopCompleted && !isHistory"
          open-delay="600"
          content-class="small"
          top
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click.stop="$emit('handle-delete-order', order.id)"
            >
              <v-icon class="close-order" small color="error">mdi-close</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('deleteOrder') }}</span>
        </v-tooltip>
        <v-spacer></v-spacer>

        <order-status
          v-if="order"
          :route-id="routeId"
          :order-id="order.id || order"
          :editing="editing"
          :current-status="order.status"
          :is-history="isHistory"
        ></order-status>

        <div
          v-if="
            notificationsByOrderId[order.id]?.length &&
            isSupervisor &&
            !isHistory
          "
          class="notification-badge"
          @mousemove="handleShowNotification($event, order.id, true)"
        ></div>
      </div>
      <div
        v-if="order && !editing"
        :class="[
          'order-progress',
          { expanded: expanded && orderProgressSelected.id === order.id },
        ]"
      >
        <order-progress
          :order="order"
          :route-id="routeId"
          :is-history="isHistory"
        ></order-progress>
      </div>
    </div>
  </div>
</template>

<script>
import OrderStatus from './OrderStatus.vue'
import OrderProgress from './OrderProgress.vue'
import ReopenHistory from './ReopenHistory.vue'
import { ORDER_STATUS } from '@/utils/dictionaries'
export default {
  components: { OrderStatus, OrderProgress, ReopenHistory },
  props: {
    stop: { type: Object, default: () => ({}) },
    editing: { type: Boolean, default: true },
    isStopsDrawer: { type: Boolean, default: false },
    isSupervisor: { type: Boolean, default: false },
    isStopCompleted: { type: Boolean, default: false },
    routeId: { type: String, required: true },
    isHistory: { type: Boolean, default: false },
  },

  data() {
    return {
      ORDER_STATUS: null,
      expanded: false,
      orderProgressSelected: {},
      typesTasks: ['workToDos', 'inspections', 'allowables'],
    }
  },
  computed: {
    selectOrder: {
      get() {
        return this.$store.state.oos.routes.selectOrder
      },
      set(val) {
        this.$store.commit('oos/routes/set_selectOrder', val)
      },
    },
    notificationsByOrderId() {
      return this.$store.getters['oos/orders/notificationsByOrdersId']
    },
  },
  created() {
    this.ORDER_STATUS = ORDER_STATUS
  },
  methods: {
    handleSelectOrder(orderId) {
      this.selectOrder = orderId
      const params = {
        selectRoute: this.routeId,
        selectOrder: orderId,
      }

      if (
        this.$route.fullPath.includes('task') ||
        this.$route.name === 'cdp-id'
      ) {
        this.$router.replace({ name: 'cdp-route', params })
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

    handleExpanded(order) {
      if (this.orderProgressSelected.id === order.id) {
        this.expanded = !this.expanded
      }
      if (this.orderProgressSelected.id !== order.id && this.expanded) {
        this.orderProgressSelected = order
      }
      if (this.orderProgressSelected.id !== order.id && !this.expanded) {
        this.orderProgressSelected = order
        this.expanded = !this.expanded
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.stop-content:hover {
  .close-stop {
    display: block;
  }
}
.close-stop,
.close-order {
  display: none;
}
.container-orders:hover {
  .close-order {
    display: inline-flex;
  }
}
.order {
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 200ms ease-in-out;
}
.order:hover {
  cursor: pointer;
  background-color: var(--v-background_select-base);
  color: #fff;
}
.selected {
  background-color: var(--v-background_select-base) !important;
  color: #fff;
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
.order-progress {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms cubic-bezier(0, 1, 0, 1);
  &.expanded {
    // max-height: fit-content;
    max-height: 10000px;
    transition: max-height 500ms ease-in-out;
  }
}
</style>
