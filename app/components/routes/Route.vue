<template>
  <div
    class="route d-flex flex-column mb-4"
    :class="{ active: routeSelected === route.id }"
    @dragenter="$emit('dragenter', $event)"
    @dragover.prevent="$emit('dragover', $event)"
    @dragleave="$emit('dragleave', $event)"
    @drop.prevent="handleDrop"
  >
    <div
      :class="['route-sign', { dark: $vuetify.theme.dark }]"
      class="d-flex align-center"
    >
      <span></span>
      <span class="text-truncate">
        {{
          route.groupName
            ? `${num}. ${route.groupName}`
            : `${$t('route')} ${num}`
        }}
      </span>

      <v-btn
        x-small
        icon
        class="ml-1"
        @click="showEditgroupName = !showEditgroupName"
      >
        <v-icon x-small>mdi-pencil-outline</v-icon>
      </v-btn>
    </div>

    <div class="route-top d-flex align-center">
      <div class="route-top-title">
        {{ route.assignedTo ? route.assignedTo.fullName : '' }}
      </div>
      <v-spacer></v-spacer>

      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            class="show-route-btn"
            :class="{ active: routeSelected === route.id }"
            v-bind="attrs"
            v-on="on"
            @click="handleShowRouteInMap(route)"
          >
            <v-icon small>mdi-map-marker-circle</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('ShowInMap') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click="$emit('show-route-view')"
          >
            <v-icon small>mdi-eye-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('routeInfo') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            class="assign-btn"
            :title="
              route.assignedTo
                ? `Assigned to ${route.assignedTo.fullName}`
                : 'Assingn lead'
            "
            v-bind="attrs"
            v-on="on"
            @click="$emit('assign-route')"
          >
            <v-icon small>mdi-clipboard-account</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('assignContractor(s)') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="selectOrigin"
            icon
            small
            class="origin-btn"
            :title="route.originAddress || 'Set route origin'"
            v-bind="attrs"
            v-on="on"
            @click="$emit('select-origin')"
          >
            <v-icon small>mdi-home-map-marker</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('setRouteOrigin') }}</span>
      </v-tooltip>
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            small
            class="close-btn"
            title="Delete Route"
            v-bind="attrs"
            v-on="on"
            @click="$emit('close-route')"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('deleteRoute') }}</span>
      </v-tooltip>
    </div>
    <div
      class="route-metadata terciary d-flex align-center pa-1 grey--text text--darken-1"
    >
      <div v-if="routeFormatted.orders.length > 0">
        <span>{{ $t('orders') }} {{ routeFormatted.orders.length }}</span>
      </div>
      <v-spacer></v-spacer>
      <div v-for="(value, k) in prioritiesInOrders" :key="k" class="mr-1">
        <v-icon
          :color="$getCategoryColor({ category: k, className: true })"
          small
          >mdi-flag</v-icon
        >
        <span>{{ value }}</span>
      </div>
    </div>
    <!-- <div class="asignedTo-bar text-center route-top-title mb-4"></div> -->
    <div v-if="stops && stops[0]" class="order-list">
      <div
        v-for="(stop, idx) in stops"
        :key="stop.num"
        class="stop-container | ma-2"
      >
        <div
          class="stop-toolbar | d-flex justify-space-between px-2 grey--text text--darken-1"
        >
          <span>{{ $t('stop') }} {{ stop.num }}</span>

          <span v-if="distanceTimes[idx]" class="distance | ml-auto">
            {{ distanceTimes[idx].distance }}
          </span>
          <span v-if="distanceTimes[idx]" class="ml-1 mr-1">|</span>
          <span v-if="distanceTimes[idx]" class="duration">
            {{ distanceTimes[idx].duration }}
          </span>
        </div>

        <div class="stop-content | pa-2 terciary">
          <div class="pa-2">
            {{
              `${stop.orders[0].address} ${stop.orders[0].county} ${stop.orders[0].city}, ${stop.orders[0].state} ${stop.orders[0].zip}`
            }}
            {{ stop.orders[0].noAddressResults ? '(Not in Map)' : '' }}
          </div>
          <div
            v-for="(order, index) in stop.orders"
            :id="order ? order.id : ''"
            :key="index"
            :ref="`routeOrders_${route.id}`"
            class="order-item | mb-2"
          >
            <div
              class="order-content | d-flex align-center"
              :class="{ active: orderSelected?.id === order.id }"
              draggable="true"
              @dragstart="handleDrag($event, order, true, route.id)"
              @dragend="handleDrag($event, order, false, route.id)"
              @click="toggleOrderSelected(order)"
            >
              <div class="mr-2">{{ index + 1 }}.</div>
              <v-tooltip
                v-if="order && order.noAddressResults"
                open-delay="600"
                content-class="small"
                top
              >
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <div class="order-mark mr-2" v-bind="attrs" v-on="on">
                    <span>{{ order.label }}</span>
                  </div>
                </template>
                <span>(Not in map)</span>
              </v-tooltip>
              <div v-else class="order-mark mr-2">
                <span>{{ order ? order.label : '' }}</span>
              </div>
              <div v-if="order" class="order-info">
                <div class="order-address">
                  {{ order.woNumber }}
                </div>
                <div class="order-metadata grey--text text--darken-1">
                  {{ order.workType }}
                </div>
              </div>

              <v-spacer></v-spacer>
              <v-icon
                v-if="order"
                small
                :color="
                  $getCategoryColor({
                    category: order.category,
                    className: true,
                  })
                "
                class="mr-1"
                >mdi-flag</v-icon
              >

              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="order"
                    x-small
                    icon
                    v-bind="attrs"
                    v-on="on"
                    @click="handleViewOrder(true, order)"
                  >
                    <v-icon small>mdi-eye-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('orderInfo') }}</span>
              </v-tooltip>
              <v-tooltip open-delay="600" content-class="small" top>
                <!-- eslint-disable-next-line -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="order"
                    icon
                    x-small
                    v-bind="attrs"
                    v-on="on"
                    @click="handlePutBack(route, order)"
                  >
                    <v-icon small>mdi-arrow-up-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('moveOrderToList') }}</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <order-view
      :show="showOrderView"
      :order="orderToView"
      @close="handleViewOrder(false)"
    />
    <v-dialog
      v-model="showEditgroupName"
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <edit-group-name
        :route="route"
        :group-name="groupNameFormatted"
        @close="showEditgroupName = false"
      >
      </edit-group-name>
    </v-dialog>
    <loader-overlay v-if="loading" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import EditGroupName from './EditGroupName.vue'
import OrderView from '@/components/orders/orderView.vue'
import LoaderOverlay from '@/components/misc/LoaderOverlay.vue'
import { CATEGORY_OPTIONS } from '@/utils/dictionaries'

const { mapState, mapActions, mapMutations } = createNamespacedHelpers('routes')

export default {
  name: 'RouteView',
  components: { OrderView, LoaderOverlay, EditGroupName },
  props: {
    inModal: { type: Boolean, default: false },
    route: { type: Object, default: () => ({}) },
    google: { type: [Object, Boolean], default: () => ({}) },
    num: { type: Number, default: 0 },
    putBackOption: { type: Boolean, default: false },
    getInfo: { type: Boolean, default: false },
    selectOrigin: { type: Boolean, default: false },
  },
  data() {
    return {
      CATEGORY_OPTIONS: null,
      loading: false,
      orderToView: {},
      showOrderView: false,
      ordersInRoute: [],
      distanceTimes: [],
      showEditgroupName: false,
    }
  },

  computed: {
    ...mapState({
      orderSelected: (state) => state.orderSelected,
      routeSelected: (state) => state.routeSelected,
      showRouteInMap: (state) => state.showRouteInMap,
    }),
    prioritiesInOrders() {
      if (!this.route || !this.route.orders || !this.route.orders.length) {
        return {}
      }
      const ordersPriorities = this.route.orders.map((o) => {
        if (o) {
          return o.category
        }

        return null
      })
      const priorityMap = ordersPriorities.reduce((prev, cur) => {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})

      return priorityMap
    },
    orders() {
      return this.$store.state.orders.orders
    },

    stops() {
      if (!this.route.orders.length) {
        return []
      }

      const _stopsOrders = this.route.orders.reduce((stops, order) => {
        if (!order) {
          return stops
        }
        const address = `${order.address} ${order.city}, ${order.state} ${order.zip}`

        const current = {
          address,
          propertyId: this.$getPropertyId(order),
        }

        const indexOfCurrent = stops.findIndex(
          (stop) => stop.propertyId === current.propertyId
          // stop.address.trim().split(' ').join('').toLowerCase() ===
          // address.trim().split(' ').join('').toLowerCase()
        )

        if (indexOfCurrent < 0) {
          return [...stops, current]
        }
        return stops
      }, [])

      const stops = _stopsOrders.map(({ address, propertyId }, index) => {
        const orders = this.route.orders.filter((o) => {
          if (o) {
            const _propertyId = this.$getPropertyId(o)
            return _propertyId === propertyId
          }
          return false
        })

        return {
          num: index + 1,
          address,
          orders,
        }
      })
      return stops
    },
    routeFormatted() {
      if (!this.getInfo) {
        return this.route
      }
      const _orders = this.route.orders.map((orderId) => {
        const indexOfOrder = this.orders
          .map((order) => order.id)
          .indexOf(orderId)
        if (indexOfOrder > -1) {
          return this.orders[indexOfOrder]
        }

        return orderId
      })

      return {
        ...this.route,
        orders: _orders,
      }
    },
    groupNameFormatted() {
      return this.route.groupName ? this.route.groupName : `Route ${this.num}`
    },
  },
  watch: {
    stops: {
      handler(newVal, oldVal) {
        // if (this._.isEqual(newVal.orders, oldVal.orders)) {
        //   return
        // }
        // this.getDistanceTime(newVal)
      },
      deep: true,
      inmediate: true,
    },
  },
  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },

  mounted() {
    if (this.getInfo) {
      this.route.orders.forEach((orderId) => {
        this.getOrderInfoById(orderId)
      })
    }
  },

  methods: {
    ...mapActions({
      toggleBounce: 'toggle_bounce',
    }),
    ...mapMutations({
      setOrderSelected: 'set_orderSelected',
      setShowRouteInMap: 'set_showRouteInMap',
      setRouteSelected: 'set_routeSelected',
    }),
    // getDistanceTime(stops) {
    //   if (!stops || (stops && !stops.length) || !this.google) {
    //     return
    //   }
    //   for (let i = 0; i < stops.length; i++) {
    //     const stop = stops[i]
    //     if (!stop) {
    //       return
    //     }

    //     let originAddress = this.route.originAddress
    //     if (i > 0) {
    //       originAddress = stops[i - 1].address
    //     }

    //     const destinationAddress = stop.address

    //     const service = new this.google.maps.DistanceMatrixService()

    //     service.getDistanceMatrix(
    //       {
    //         origins: [originAddress],
    //         destinations: [destinationAddress],
    //         travelMode: 'DRIVING',
    //         unitSystem: this.google.maps.UnitSystem.IMPERIAL,
    //       },
    //       (response, status) => {
    //         this.distanceTimes.splice(i, 1, {
    //           distance: response.rows[0].elements[0].distance?.text || 'N/A',
    //           duration: response.rows[0].elements[0].duration?.text || 'N/A',
    //         })
    //       }
    //     )
    //   }
    // },
    handlePutBack(route, order) {
      if (this.putBackOption) {
        this.$emit('put-back-order', { route, order })
      } else {
        this.$store.commit('routes/remove_order_from_route', {
          routeId: route.id,
          orderId: order.id,
        })
      }
    },
    handleDrop(e) {
      e.preventDefault()
      const route = this.route

      const afterElement = this.getDrafAfterElement(route.id, e.clientY)

      this.$emit('drop', { e, afterElement })
    },
    getDrafAfterElement(routeId, y) {
      const ordersDivs = this.$refs[`routeOrders_${routeId}`]

      if (!ordersDivs) {
        return null
      }
      return ordersDivs.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect()
          const offset = y - box.top - box.height / 2
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child }
          } else {
            return closest
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element
    },
    async getOrderInfoById(orderId) {
      try {
        this.loading = true
        const order = await this.$store.dispatch(
          'orders/get_order_by_id',
          orderId
        )

        this.ordersInRoute.push(order)
        this.loading = false
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
        this.loading = false
      }
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
          ...(order.contractor &&
            order.contractor.length && {
              contractor: order.contractor
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
    handleShowRouteInMap(route) {
      const isSameRoute = this.routeSelected === route.id

      if (isSameRoute) {
        this.setRouteSelected(null)
        this.setShowRouteInMap(false)
        return
      }

      if (!this.showRouteInMap) {
        this.setRouteSelected(route.id)
        this.setShowRouteInMap(true)
        return
      }

      this.resetShowRouteInMap(route.id)
    },
    resetShowRouteInMap(newRouteSelected) {
      this.setShowRouteInMap(false)
      this.setRouteSelected(null)
      this.$nextTick(() => {
        this.setRouteSelected(newRouteSelected)
        this.$nextTick(() => {
          this.setShowRouteInMap(true)
        })
      })
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
  },
}
</script>

<style lang="scss" scoped>
.route {
  flex: 0 0 600px;
  // max-width: 350px;
  // height: 100%;
  max-height: 600px;
  border-radius: 0.5rem;
  border: 1px solid var(--v-secondary-base);
  position: relative;

  &:has(.dragover),
  &.dragover,
  &.active {
    background-color: var(--v-terciary-base);
    .route-sign {
      background-color: var(--v-terciary-base);
    }
  }

  .route-top {
    min-height: 40px;
    &-title {
      font-size: 0.75rem;
      font-weight: 600;
      padding-inline: 0.5rem;
    }
  }
  .stop-content {
    border-radius: 10px;
  }
  .order-list {
    font-size: 0.75rem;
    overflow-y: auto;
  }
  .order-item {
    cursor: move;
  }
  .order-mark {
    border-radius: 50%;
    background-color: #ea4335;
    color: #fff;
    width: 3ch;
    height: 3ch;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .order-content {
    padding: 4px;
    border: 1px solid var(--v-primary-base);
    background-color: var(--clr-bg-alt);
    border-radius: 4px;
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
  .order-address,
  .order-info {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.route-sign {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -60%);
  font-size: 13px;
  background-color: #fff;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
  padding: 0.25rem;
  border-radius: 0.25rem;
  line-height: 1;
  &.dark {
    background-color: var(--clr-bg-base);
    color: currentColor;
  }
}

.show-route-btn {
  &.active {
    background-color: var(--v-primary-base);
  }
}
.route-metadata {
  font-size: 0.75rem;
  min-height: 27px;
}
</style>
