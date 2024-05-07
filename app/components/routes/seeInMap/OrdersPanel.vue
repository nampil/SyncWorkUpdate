<template>
  <div class="orders-list-container | d-flex flex-column py-1">
    <div class="order-toolbar | flex-grow-0 d-flex align-center px-2">
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            @click.stop="handleShowOrdersView"
          >
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('addOrdersToMap') }}</span>
      </v-tooltip>
      <div class="toolbar-title text-h6">{{ $t('addOrders') }}</div>
    </div>
    <div class="order-list-container | flex-grow-1">
      <div class="orders-list">
        <div class="order-list-metadata d-flex">
          <div v-if="filteredOrderList.length > 0" class="info--text">
            {{ $t('orders') }} {{ orderList.length }}
          </div>
          <v-spacer></v-spacer>
          <v-btn
            v-if="filteredOrderList.length > 0 && filter"
            color="primary"
            x-small
            text
            @click="handleResetFilter"
            >Reset Filters</v-btn
          >
          <v-btn
            v-for="(value, k) in prioritiesInOrders"
            :key="k"
            class="priorities | mr-1 px-1"
            :class="{ active: k === filter }"
            text
            x-small
            @click="handleFilterByPriority({ priority: k })"
          >
            <v-icon
              :color="$getCategoryColor({ category: k, className: true })"
              small
              >mdi-flag</v-icon
            >

            <span>{{ value }}</span>
          </v-btn>
        </div>
        <div
          v-for="order in filteredOrderList"
          :key="order.id"
          :ref="order.id"
          class="order-item"
          draggable="true"
          @dragstart="handleDrag($event, order, true)"
          @dragend="handleDrag($event, order, false)"
        >
          <div
            class="order-content d-flex align-center gap-8 pa-1"
            :class="{ active: orderSelected?.id === order.id }"
            @click="toggleOrderSelected(order)"
          >
            <v-tooltip
              v-if="order && order.noAddressResults"
              open-delay="600"
              content-class="small"
              top
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <div class="order-mark" v-bind="attrs" v-on="on">
                  <span>{{ order.label }}</span>
                </div>
              </template>
              <span>(Not in map)</span>
            </v-tooltip>
            <div v-else class="order-mark">
              <span>{{ order.label }}</span>
            </div>
            <!-- @mousedown="grabOrder($event, order)" -->
            <div class="order-info">
              <div class="order-address">
                {{
                  `${order.address} ${order.city}, ${order.state || ''} ${
                    order.zip
                  } `
                }}
                {{ order.noAddressResults ? '(Not in Map)' : '' }}
              </div>
              <div class="order-metadata grey--text text--darken-1">
                {{ order.workType }}
              </div>
            </div>

            <v-spacer></v-spacer>
            <v-icon
              small
              :color="
                $getCategoryColor({ category: order.category, className: true })
              "
              class="mr-2"
              >mdi-flag</v-icon
            >

            <v-btn small icon @click="handleViewOrder(true, order)">
              <v-icon>mdi-eye-circle-outline</v-icon>
            </v-btn>
            <v-btn small icon @click="handleRemoveBaseOrder(order)">
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
    <orders-view
      :show="showOrdersView"
      :base-orders="baseOrders"
      @send="handleAddOrderToBaseOrders"
      @close="showOrdersView = false"
    />
    <order-view
      :show="showOrderView"
      :order="orderToView"
      @close="handleViewOrder(false)"
    />
  </div>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import { createNamespacedHelpers } from 'vuex'
import OrderView from '@/components/orders/orderView.vue'
import { CATEGORY_OPTIONS, ROUTES_FILTER_OPTIONS } from '@/utils/dictionaries'
import OrdersView from '~/components/orders/ordersView.vue'

const { mapState, mapActions, mapMutations, mapGetters } =
  createNamespacedHelpers('routes')

export default {
  name: 'OrdersPanel',
  components: {
    OrderView,
    OrdersView,
  },

  data() {
    return {
      showOrderView: false,
      orderToView: {},
      CATEGORY_OPTIONS,
      showOrdersView: false,
      sortByOptions: ['dueDate'],
    }
  },

  computed: {
    ...mapState({
      routes: (state) => state.routes,
      baseOrders: (state) => state.baseOrders,
      markers: (state) => state.markers,
      filter: (state) => state.filter,
      orderSelected: (state) => state.orderSelected,
      showRouteInMap: (state) => state.showRouteInMap,
    }),
    google: getGoogleMapsAPI,
    categoryOptions() {
      return this.$store.state.categoryOptions
    },
    prioritiesInOrders() {
      const categoryOptions = this.categoryOptions.map((co) => co.title)
      const ordersPriorities = this.orderList.map((o) => o.category)
      const priorityMap = ordersPriorities
        .map((priority) => {
          if (categoryOptions.includes(priority)) {
            return priority
          }
          return ROUTES_FILTER_OPTIONS.other
        })
        .reduce((prev, cur) => {
          prev[cur] = (prev[cur] || 0) + 1
          return prev
        }, {})

      return priorityMap
    },
    ...mapGetters({
      orderList: 'orderList',
      filteredOrderList: 'filteredOrderList',
    }),
  },

  methods: {
    ...mapMutations({
      addBaseOrder: 'add_baseOrder',
      setFilter: 'set_filter',
      updateBaseOrder: 'update_baseOrder',
      removeBaseOrder: 'remove_baseOrder',
      addMarker: 'add_marker',
      updateMarker: 'update_marker',
      removeMarker: 'remove_marker',
      setOrderSelected: 'set_orderSelected',
      setRouteSelected: 'set_routeSelected',
      setShowRouteInMap: 'set_showRouteInMap',
    }),
    ...mapActions({
      toggleBounce: 'toggle_bounce',
    }),
    handleResetFilter() {
      this.setShowRouteInMap(false)
      this.setRouteSelected(null)
      this.setFilter({ filter: null })
    },
    handleFilterByPriority({ priority }) {
      if (this.showRouteInMap) {
        this.setShowRouteInMap(false)
        this.setRouteSelected(null)
      }

      this.$nextTick(() => {
        this.setFilter({ filter: priority })
      })

      // this.$nextTick(() => {
      //   this.$emit('get-markers', {
      //     orders: this.filteredOrderList,
      //     reset: true,
      //   })
      // })
    },
    handleShowOrdersView() {
      this.showOrdersView = true
    },
    handleRemoveBaseOrder(order) {
      this.removeBaseOrder(order)
      this.removeMarker({ id: order.id })
    },
    handleAddOrderToBaseOrders(orders) {
      const ordersToAdd = orders.filter(
        (o) => !this.baseOrders.map((bo) => bo.id).includes(o.id)
      )
      this.$emit('get-markers', { orders: ordersToAdd })
      this.addBaseOrder(ordersToAdd)

      this.showOrdersView = false
    },

    handleMouseOver(payload) {
      this.$emit('toggle-bounce', payload)
    },
    handleViewOrder(show, order) {
      if (show) {
        const {
          dateDue,
          orderNew,
          onHold,
          edited,
          archive,
          assigned,
          unassigned,
          id,
          ..._order
        } = order

        const orderFormatted = {
          ..._order,
          dateDue: _order.dateDueFormatted,
          ...(order.contractors.length && {
            contractors: order.contractors
              .map((c) => ` ${c.fullName}`)
              .join(', '),
          }),
        }

        delete orderFormatted.dateDueFormatted
        delete orderFormatted.contractorList
        delete orderFormatted.dateDueStr

        this.orderToView = orderFormatted
        this.$nextTick(() => {
          this.showOrderView = true
        })
      } else {
        this.showOrderView = false
        this.orderToView = {}
      }
    },

    toggleOrderSelected(order) {
      let oldOrderId = ''
      if (this.orderSelected) {
        oldOrderId = this.orderSelected.id
        this.toggleBounce({ orderId: oldOrderId, animation: null })
        this.setOrderSelected(null)
      }

      if (oldOrderId !== order.id) {
        this.setOrderSelected(order)
        this.toggleBounce({
          orderId: order.id,
          animation: this.google.maps.Animation.BOUNCE,
        })
      }
    },

    handleDrag(e, order, start, routeId) {
      const el = e.target
      if (start) {
        const objData = {
          orderId: order.id,
          originRouteId: routeId,
        }
        e.dataTransfer.setData('text/plain', JSON.stringify(objData))
        el.classList.add('dragging')
      } else {
        el.classList.remove('dragging')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.priorities {
  &.active {
    background-color: var(--v-secondary-lighten2);
  }
}
.order-list-container {
  position: relative;
}
.orders-list {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 1rem;
}

.order-item {
  cursor: move;
}
.order-content {
  border-radius: 0.5rem;
  // border: 1px solid #ddd;
  border: 1px solid var(--v-primary-base);
  background-color: var(--clr-bg-alt);
  &:hover {
    background-color: var(--v-terciary-lighten1);
  }
  &.active {
    background-color: var(--v-terciary-darken1);
  }
}

.order-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  span {
    border-radius: 50%;
    background-color: #ea4335;
    color: #fff;
    text-align: center;
    vertical-align: middle;
    width: 24px;
    aspect-ratio: 1;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
.dragging {
  opacity: 0.5;
}
</style>
