<template>
  <div class="routing-content">
    <div class="contractor-list-container">
      <div class="contractor-list pa-4">
        <h3 class="mb-4">{{ $t('ordersByContractor') }}</h3>
        <v-expansion-panels class="mb-4">
          <v-expansion-panel
            v-for="contractor in contractorsInOrders"
            :key="contractor.uid"
          >
            <v-expansion-panel-header>
              {{ contractor.fullName }} ({{ contractor.orders.length }})
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="headers order-grid align-center mb-2">
                <div class="order-property">No.</div>
                <div class="order-property">{{ $t('category') }}</div>
                <div class="order-property">{{ $t('address') }}</div>
                <div class="order-property">{{ $t('county') }}</div>
                <div class="order-property">{{ $t('zip') }}</div>
                <div class="order-action">{{ $t('action') }}</div>
              </div>
              <div class="order-list">
                <div
                  v-for="(order, i) in contractor.orders"
                  :key="i"
                  :ref="order.id"
                  class="order-item"
                  draggable="true"
                  @dragstart="handleDrag($event, order, true)"
                  @dragend="handleDrag($event, order, false)"
                >
                  <div class="order-content order-grid">
                    <div class="item-property">{{ i + 1 }}</div>
                    <div class="item-property">{{ order.category }}</div>
                    <div class="item-property">{{ order.address }}</div>
                    <div class="item-property">{{ order.county }}</div>
                    <div class="item-property">{{ order.zip }}</div>
                    <v-btn small icon @click="handleViewOrder(true, order)">
                      <v-icon small>mdi-eye-circle-outline</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
    <div class="routes-list-container">
      <v-toolbar dense class="elevation-1">
        <v-toolbar-title>{{ $t('routes') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <span class="mr-2">{{ forDateStrFormatted }}</span>
        <v-btn icon small>
          <v-icon small>mdi-calendar</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          small
          depressed
          color="secondary"
          :disabled="!localNeedToSave"
          @click="handleSaveRoutes"
        >
          {{ $t('save') }}
        </v-btn>
      </v-toolbar>
      <div v-if="routes.length" class="routes pa-4">
        <route
          v-for="(route, i) in routes"
          :key="route.id"
          class="route d-flex flex-column"
          :num="i + 1"
          :route="route"
          :put-back-option="false"
          :get-info="true"
          :google="google"
          @dragenter="dragEnter($event, route)"
          @dragover="dragOver($event, route)"
          @dragleave="dragLeave($event, route)"
          @drop="drop($event, route)"
          @assign-route="handleAssignRoute(route)"
          @close-route="handleCloseRoute(route)"
          @put-back-order="putBackOrder"
        />
      </div>
      <div v-else class="pa-3 text--disabled">{{ $t('routesForDate') }}</div>
    </div>
    <order-view
      :show="showOrderView"
      :order="orderToView"
      @close="handleViewOrder(false)"
    />
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { getGoogleMapsAPI } from 'gmap-vue'
import Route from '@/components/routes/Route.vue'
import OrderView from '@/components/orders/orderView.vue'
export default {
  name: 'RoutingContent',
  components: { Route, OrderView },
  data() {
    return {
      contractorsList: [],
      showOrderView: false,
      forDateStr: '',
      orderToView: {},
      originalRoutes: [],
    }
  },
  computed: {
    google: getGoogleMapsAPI,
    ...mapState({
      routes: (state) => state.routes.routes,
    }),
    localNeedToSave() {
      return !this._.isEqual(this.originalRoutes, this.routes)
    },
    orders() {
      return this.$store.state.orders.orders
    },
    ordersAssigned() {
      return this.orders.filter((o) => o.contractor.length > 0)
    },
    contractorsInOrders() {
      const _contractors = []
      this.ordersAssigned.forEach((order) => {
        order.contractor.forEach((c) => {
          const indexOfContractor = _contractors
            .map((c) => c.uid)
            .indexOf(c.uid)
          if (indexOfContractor > -1) {
            _contractors[indexOfContractor].orders.push(order)
          } else {
            _contractors.push({
              ...c,
              orders:
                !c.orders || !c.orders.length ? [order] : [...c.orders, order],
            })
          }
        })
      })
      return _contractors
    },
    dummyRoute: {
      get() {
        return this.$store.state.routes.dummyRoute
      },
      set(payload) {
        this.$store.commit('routes/set_dummyRoute', payload)
      },
    },
    forDateStrFormatted() {
      if (!this.forDateStr) {
        return ''
      }
      const [year, month, day] = this.forDateStr.split('-')
      return `${month}-${day}-${year}`
    },
  },
  watch: {
    localNeedToSave(val) {
      this.$store.commit('set_needToSave', val)
    },
  },
  async mounted() {
    try {
      this.loading = true
      const _contractorList = await this.$store.dispatch('get_contractors')
      this.contractorsList = _contractorList
      const tomorrow = this.getTomorrow()
      this.setForDate(tomorrow)
      await this.getRoutes(this.forDateStr)

      this.routes.forEach((route) => {
        this.originalRoutes.push({
          ...route,
          orders: [...route.orders],
        })
      })
      this.loading = false
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },
  methods: {
    ...mapActions('routes', {
      getRoutes: 'get_routes',
      saveRoutes: 'save_routes',
    }),
    ...mapMutations('routes', {
      addOrderToRoute: 'add_order_to_route',
      removeOrderFromRoute: 'remove_order_from_route',
      insertOrderToRoute: 'insert_order_to_route',
    }),
    async handleSaveRoutes() {
      const hayRoutes = this.routes.length > 0
      const allRoutesHasAssignedTo =
        this.routes.filter((route) => route.assignedTo === '').length === 0
      const routesHasOrders =
        this.routes.filter((r) => r.orders.length === 0).length === 0

      if (!hayRoutes || !allRoutesHasAssignedTo || !routesHasOrders) {
        this.$mainAlertInfo(this.$t('routesAndOrderComplete'))
        return
      }
      try {
        this.loading = true
        await this.saveRoutes()
        this.originalRoutes = []
        this.routes.forEach((route) => {
          this.originalRoutes.push({
            ...route,
            orders: [...route.orders],
          })
        })
        this.$mainAlertSuccess(this.$t('routesSaved'))
        this.loading = false
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
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
          ...(order.contractor.length && {
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
    dragEnter(e, route) {
      if (route.forDateStr !== this.forDateStr) {
        return
      }
      e.target.classList.add('dragover')
    },
    dragOver(e, route) {
      e.preventDefault()
    },
    dragLeave(e, route) {
      e.target.classList.remove('dragover')
    },
    drop(event, route) {
      const { e, afterElement } = event

      e.preventDefault()
      if (route.forDateStr !== this.forDateStr) {
        return
      }
      const data = e.dataTransfer.getData('text/plain')
      const { orderId, originRouteId } = JSON.parse(data)

      if (!route.orders.map((o) => o.id).includes(orderId)) {
        if (!afterElement) {
          this.addOrderToRoute({ routeId: route.id, orderId })
        } else {
          const afterOrderId = afterElement.id
          this.insertOrderToRoute({ orderId, afterOrderId, routeId: route.id })
        }

        if (originRouteId) {
          const routeOrigin = this.routes.filter(
            (r) => r.id === originRouteId
          )[0]

          this.removeOrderFromRoute({ routeId: routeOrigin.id, orderId })
        }
      } else if (!afterElement) {
        this.removeOrderFromRoute({ routeId: originRouteId, orderId })
        this.$nextTick(() => {
          this.addOrderToRoute({ orderId, routeId: originRouteId })
        })
      } else {
        const afterOrderId = afterElement.id
        this.removeOrderFromRoute({ routeId: originRouteId, orderId })
        this.$nextTick(() => {
          this.insertOrderToRoute({
            routeId: originRouteId,
            afterOrderId,
            orderId,
          })
        })
      }
    },
    handleAssignRoute(route) {},
    handleCloseRoute(route) {},
    putBackOrder({ order, route }) {},
    setForDate(date) {
      const forDateStr = this.$formatDate(date, { iso: true })
      this.forDateStr = forDateStr
      this.dummyRoute = {
        ...this.dummyRoute,
        forDate: date,
        forDateStr,
      }
    },
    getTomorrow(type) {
      const tomorrow = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      if (type && type.iso) {
        const dateUTCStr = tomorrow.toISOString().substr(0, 10)
        return dateUTCStr
      }
      return tomorrow
    },
    getContractorInOrders(_ordersAssigned) {},
  },
}
</script>
<style lang="scss" scoped>
.routing-content {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 250px 1fr;
  @media (min-width: 600px) {
    grid-template-columns: minmax(350px, 1fr) minmax(200px, 400px);
    grid-template-rows: 100%;
  }
}
.contractor-list-container {
  height: 100%;
  position: relative;
}
.routes-list-container {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ddd;
}
.contractor-list {
  position: absolute;
  inset: 0;
  overflow-y: auto;
}
.routes {
  flex: 1 1 100%;
  overflow-y: auto;
}
.headers {
  font-size: 0.75rem;
  font-weight: 600;
  gap: 1rem;
}
.order-content {
  gap: 1rem;
}
.order-list {
  font-size: 0.75rem;
}
.order-item {
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  padding: 1px 4px;
}
.order-grid {
  display: grid;
  grid-template-columns: 20px 15% auto 16% 16% 10%;
  gap: 1rem;
  align-items: center;
}
.order-property {
  flex: 1 0 16.66%;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
</style>
