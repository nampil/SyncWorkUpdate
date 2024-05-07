<template>
  <div class="d-flex h-100">
    <section
      :class="[
        'container-routes | d-flex flex-column flex-grow-1 h-100',
        { showSummaryDrawer: showSummaryDrawer },
      ]"
    >
      <header class="header-content | d-flex align-center pa-4 gap-8">
        <div class="flex-grow-1">
          <h4 class="white--text subtitle-2">CDP - {{ $t('Dashboard') }}</h4>
        </div>
        <v-menu offset-y>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn text small v-bind="attrs" v-on="on">{{
              forDateStrFormatted || $t('selectDate')
            }}</v-btn>
          </template>
          <v-date-picker v-model="forDateStr" :min="minDate"></v-date-picker>
        </v-menu>

        <v-btn
          v-if="editing"
          class="mr-2 ml-0 elevation-0"
          color="primary"
          x-small
          @click="addRoute"
        >
          <span
            ><v-icon x-small>mdi-plus-circle-outline</v-icon>
            {{ $t('addRoute') }}
          </span>
        </v-btn>
        <v-btn
          v-if="editing"
          class="mr-2 elevation-0"
          outlined
          x-small
          color="error"
          @click="handleCancel"
          >{{ $t('cancel') }}
        </v-btn>
        <v-btn
          v-if="editing"
          class="mr-2 elevation-0"
          x-small
          color="primary"
          :loading="loading"
          @click="handleSend"
        >
          {{ $t('save') }}
        </v-btn>
        <v-spacer></v-spacer>
        <span class="switch-text">{{
          editing ? 'Go to OOS ' : 'Go to Edit Routes '
        }}</span>
        <v-switch
          v-if="isDash"
          v-model="editing"
          inset
          dense
          class="ml-2"
          @click="handleEditing"
        ></v-switch>

        <span v-if="!editing" class="switch-text">{{
          supervisedRoutes ? 'All Routes' : 'Supervised Routes'
        }}</span>
        <v-switch
          v-if="isDash && !editing"
          v-model="supervisedRoutes"
          inset
          dense
          class="ml-2"
        ></v-switch>

        <v-btn icon small @click="showSummaryDrawer = !showSummaryDrawer">
          <v-icon size="20" :color="showSummaryDrawer ? 'primary' : ''"
            >mdi-poll</v-icon
          >
        </v-btn>
      </header>

      <loader-overlay v-if="loadingRoutes"></loader-overlay>

      <div
        v-if="routesFormatted?.length"
        ref="scroll_container"
        class="routes | pa-4 h-100"
      >
        <edit-routes
          v-for="(route, i) in routesFormatted"
          :key="route.id"
          :num="i + 1"
          :edit-route="route"
          :put-back-option="false"
          :get-info="true"
          :orders-on-routes="ordersOnRoutes"
          :is-dash="isDash"
          :editing="editing"
          :google="google"
          @dragenter="dragEnter($event, route)"
          @dragover="dragOver($event, route)"
          @dragleave="dragLeave($event, route)"
          @drop="drop($event, route)"
          @update_route="handleUpdateRoute($event, route.id)"
          @delete_route="handleDeleteRoute($event)"
          @update_contractors="handleUpdateContractors($event)"
          @update_orders="handleUpdateOrders($event)"
          @delete_order="handleDaleteOrder($event)"
          @update-group-name="handleUpdateGroupName($event, route.id)"
          @update-origin="handleUpdateOrigin($event, route.id)"
        />
      </div>
    </section>

    <routes-summary-drawer
      :routes="routesFormatted"
      :show-summary-drawer="showSummaryDrawer"
    ></routes-summary-drawer>
  </div>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import { mapState, mapActions } from 'vuex'
import RoutesSummaryDrawer from '../routesSummary/RoutesSummaryDrawer.vue'
import EditRoutes from './EditRoutes.vue'
import LoaderOverlay from '~/components/misc/LoaderOverlay.vue'

export default {
  name: 'RoutingContentEdit',
  components: { EditRoutes, RoutesSummaryDrawer, LoaderOverlay },
  props: { isDash: { type: Boolean, default: false } },
  data() {
    return {
      showOrderView: false,
      forDateStr: '',
      minDate: '',
      orderToView: {},
      originalRoutes: [],
      loading: false,
      localRoutes: [],
      localOrders: [],
      routesDelete: [],
      editing: false,
      supervisedRoutes: false,
      showSummaryDrawer: false,
    }
  },
  computed: {
    google: getGoogleMapsAPI,
    ...mapState('oos/routes', {
      routes: (state) => state.routes,
      routeListeners: (state) => state.listeners,
      loadingRoutes: (state) => state.loadingRoutes,
    }),
    ...mapState('oos/orders', { orders: (state) => state.orders }),
    localNeedToSave() {
      let dataIsEmpty = false
      const local = this.localRoutes.map((e) => {
        if (
          e.orders.length === 0 ||
          e.contractors.length === 0 ||
          Object.entries(e.assignedTo).length === 0
        ) {
          dataIsEmpty = true
        }
        return {
          orders: e.orders,
          contractors: e.contractors,
          stops: e.stops,
          assignedTo: e.assignedTo,
          groupName: e.groupName,
          originAddress: e.originAddress,
        }
      })
      const _routes = this.routes.map((e) => {
        return {
          orders: e.orders,
          contractors: e.contractors,
          stops: e.stops,
          assignedTo: e.assignedTo,
          groupName: e.groupName,
          originAddress: e.originAddress,
        }
      })
      return dataIsEmpty || this._.isEqual(local, _routes)
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
    ordersOnRoutes() {
      const _ordersOnRoutes = this.routesFormatted
        .map((r) => {
          return r.orders
        })
        .flat(1)
      // .concat(this.localOrders)
      return _ordersOnRoutes
    },

    routesFormatted() {
      const _orders = this.localOrders.filter((e) => {
        return !this.orders.map((i) => i.id).includes(e.id)
      })

      return this.$store.getters['oos/routes/routesFormatted']({
        localRoutes: this.editing ? this.localRoutes : null,
        localOrders: this.editing ? [...this.orders, ..._orders] : null,
        supervisedRoutes: this.supervisedRoutes,
      })
    },
    validateLead() {
      return this.localRoutes.filter(
        (r) => Object.keys(r.assignedTo).length === 0
      ).length
    },
    validateOrders() {
      return this.localRoutes.filter((r) => r.orders.length === 0).length
    },
  },

  watch: {
    forDateStr(val) {
      if (val) {
        this.$store.dispatch('oos/routes/get_route_for_day_date', val)
      }
    },
    localNeedToSave(val) {
      if (this.editing) {
        this.$store.commit('set_needToSave', val)
      }
    },
    routes(val) {
      if (!val.length) {
        this.localRoutes = []
      }
    },
  },

  async mounted() {
    try {
      this.loading = true
      await this.$gmapApiPromiseLazy()

      const today = this.getToday()
      this.minDate = this.$formatDate(today, { iso: true })
      this.setForDate(today)

      if (!this.routeListeners.length) {
        // eslint-disable-next-line
        console.log('RoutingContentEdit Get routes')

        // await this.getRoutes(this.forDateStr)
      }

      this.loading = false
    } catch (error) {
      this.$mainAlertError(this.$t('oopsProblem'))
      // eslint-disable-next-line
      console.log('error: ', error)
    }
  },

  methods: {
    init() {
      this.localRoutes = []
      if (!this.routes.length) {
        return
      }

      this.routes.forEach((route) => {
        const _route = JSON.parse(JSON.stringify(route))
        this.localRoutes.push({
          ..._route,
          orders: [..._route.orders],
        })
      })

      this.routesDelete = []
      this.localOrders = []
    },

    handleEditing() {
      this.init()
      this.supervisedRoutes = false
      // this.editing = !this.editing
    },
    handleUpdateRoute(newRoute, routeId) {
      const indexOfRoute = this.localRoutes.findIndex((r) => r.id === routeId)
      if (indexOfRoute === -1) return
      this.localRoutes.splice(indexOfRoute, 1, newRoute)
    },
    handleDeleteRoute(routeId) {
      const indexOfRoute = this.localRoutes.findIndex((r) => r.id === routeId)
      if (indexOfRoute === -1) return
      this.localRoutes.splice(indexOfRoute, 1)
      this.routesDelete.push(routeId)
    },
    handleUpdateOrigin(origin, routeId) {
      const indexOfRoute = this.localRoutes.findIndex((r) => r.id === routeId)
      if (indexOfRoute === -1) return
      this.localRoutes[indexOfRoute].originAddress = origin.address
      this.localRoutes[indexOfRoute].originLocation = {
        ...origin.location,
      }
    },
    handleUpdateGroupName(newGroupName, routeId) {
      const indexOfRoute = this.localRoutes.findIndex((r) => r.id === routeId)
      if (indexOfRoute === -1) return
      this.localRoutes[indexOfRoute].groupName = newGroupName
    },
    ...mapActions('routes', {
      getRoutes: 'get_routes',
    }),
    handleCancel() {
      this.init()
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
    handleDrag(e, stop, index, start, routeId) {
      const el = e.target
      if (start) {
        const objData = {
          stop,
          index,
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
      if (this.isDash && !this.editing) {
        return
      }
      e.target.classList.add('dragover')
    },
    dragOver(e, route) {
      if (this.isDash && !this.editing) {
        return
      }
      e.preventDefault()
    },
    dragLeave(e, route) {
      if (this.isDash && !this.editing) {
        return
      }
      e.target.classList.remove('dragover')
    },
    drop(event, route) {
      // eslint-disable-next-line
      console.log('routing')

      if (this.isDash && !this.editing) {
        return
      }

      const { e, afterElement, type } = event
      e.preventDefault()

      if (route.forDateStr !== this.forDateStr) return
      const data = e.dataTransfer.getData('text/plain')
      if (type === 'stop') {
        const { stop, index, originRouteId } = JSON.parse(data)
        const indexOfRoute = this.localRoutes.map((c) => c.id).indexOf(route.id)
        if (indexOfRoute === -1) return
        if (route.id === originRouteId) {
          this.localRoutes[indexOfRoute].stops.splice(index, 1)
          const _stop = JSON.parse(JSON.stringify(stop))
          _stop.orders = stop.orders.map((o) => o.id)
          if (afterElement) {
            const afterStopId = afterElement.id
            _stop.num = afterStopId + 1
            this.localRoutes[indexOfRoute].stops.splice(afterStopId, 0, _stop)
          } else if (!afterElement) {
            this.localRoutes[indexOfRoute].stops.push(_stop)
          }
        }
        if (route.id !== originRouteId) {
          const _stop = JSON.parse(JSON.stringify(stop))
          const indexOfRouteToMover = this.localRoutes
            .map((c) => c.id)
            .indexOf(originRouteId)

          if (indexOfRoute === -1 || indexOfRouteToMover === -1) return

          this.localRoutes[indexOfRouteToMover].stops.splice(index, 1)

          /* Orders */
          this.localRoutes[indexOfRouteToMover].orders = this.localRoutes[
            indexOfRouteToMover
          ].orders.filter((e) => {
            return !stop.orders.map((i) => i.id).includes(e)
          })

          stop.orders.forEach((e) => {
            this.localRoutes[indexOfRoute].orders.push(e.id)
          })

          let alreadyHasStop = false
          let i = 0
          while (i < route.orders.length && !alreadyHasStop) {
            const order = route.orders[i]
            if (
              this.$getPropertyId(order) === this.$getPropertyId(stop.orders[0])
            ) {
              alreadyHasStop = true
            }
            i++
          }

          _stop.orders = stop.orders.map((o) => o.id)

          if (afterElement) {
            const afterStopId = afterElement.id
            _stop.num = afterStopId + 1

            if (alreadyHasStop) {
              const _stops = this.getStops({
                orders: this.ordersOnRoutes,
                route: this.localRoutes[indexOfRoute],
              })
              this.localRoutes[indexOfRoute].stops = _stops
            } else {
              this.localRoutes[indexOfRoute].stops.splice(afterStopId, 0, _stop)
            }
          } else {
            this.localRoutes[indexOfRoute].stops.push(_stop)
          }
          this.localRoutes[indexOfRouteToMover].stops.map((e, i) => {
            e.num = i + 1
            return e
          })
        }
        this.localRoutes[indexOfRoute].stops.map((e, i) => {
          e.num = i + 1
          return e
        })
      }
      if (type === 'contractor') {
        const { uid, originRouteId } = JSON.parse(data)
        const indexOfRoute = this.localRoutes.map((c) => c.id).indexOf(route.id)
        const indexOfRouteToMover = this.localRoutes
          .map((c) => c.id)
          .indexOf(originRouteId)
        const indexOfContractor =
          this.localRoutes[indexOfRouteToMover].contractors.indexOf(uid)

        if (
          indexOfRoute === -1 ||
          indexOfRouteToMover === -1 ||
          indexOfContractor === -1 ||
          route.id === originRouteId
        ) {
          return
        }

        if (!this.localRoutes[indexOfRoute].contractors.includes(uid)) {
          this.localRoutes[indexOfRoute].contractors.push(uid)
        }
        /* delete */
        if (this.localRoutes[indexOfRouteToMover].assignedTo.uid !== uid) {
          this.localRoutes[indexOfRouteToMover].contractors.splice(
            indexOfContractor,
            1
          )
        }
      }
    },

    getStops({ orders, route }) {
      const _stopsOrders = orders.reduce((stops, order) => {
        if (!order) {
          return stops
        }
        const address = `${order.address} ${order.county} ${order.city}, ${order.state} ${order.zip}`
        const current = {
          address,
          propertyId: this.$getPropertyId(order),
        }
        const indexOfCurrent = stops.findIndex(
          (stop) =>
            stop.address.trim().split(' ').join('').toLowerCase() ===
            address.trim().split(' ').join('').toLowerCase()
        )

        if (indexOfCurrent < 0) {
          return [...stops, current]
        }
        return stops
      }, [])

      const stops = _stopsOrders.map(({ address, propertyId }, index) => {
        const _orders = orders.filter((o) => {
          if (o) {
            const _propertyId = this.$getPropertyId(o)
            return _propertyId === propertyId
          }
          return false
        })

        return {
          num: index + 1,
          address,
          orders: _orders.map((o) => o.id),
        }
      })

      if (!route.stops || !route.stops.length) {
        return stops
      }
      const orderedStops = []
      route.stops.forEach((routeStop, i) => {
        stops.forEach((order) => {
          if (routeStop.address.toLowerCase() === order.address.toLowerCase()) {
            orderedStops.push({ ...order, num: i + 1 })
          }
          return order
        })
      })
      orderedStops.map((e, i) => {
        e.num = i + 1
        return e
      })

      stops.forEach((item) => {
        if (!orderedStops.map((s) => s.address).includes(item.address)) {
          orderedStops.push(item)
        }
      })

      return orderedStops
    },
    setForDate(date) {
      const forDateStr = this.$formatDate(date, { iso: true })
      this.forDateStr = forDateStr
      this.dummyRoute = {
        ...this.dummyRoute,
        forDate: date,
        forDateStr,
      }
    },
    getToday(type) {
      const today = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
      today.setUTCDate(today.getUTCDate())
      if (type && type.iso) {
        const dateUTCStr = today.toISOString().substr(0, 10)

        return dateUTCStr
      }

      return today
    },
    addRoute() {
      const id = new Date().getTime()
      const newRoute = JSON.parse(JSON.stringify(this.dummyRoute))
      newRoute.id = id.toString()
      newRoute.orders = []
      newRoute.groupName = `Route ${this.localRoutes.length + 1}`
      this.localRoutes.push(newRoute)

      this.$nextTick(() => {
        this.$refs.scroll_container.scrollTo({
          left: this.$refs.scroll_container.scrollWidth,
          behavior: 'smooth',
        })
      })
    },
    async handleSend() {
      if (this.validateLead) {
        this.$mainAlertInfo('Need to add a leader')
        return
      }
      if (this.validateOrders) {
        this.$mainAlertInfo('Need to add at least one order')
        return
      }
      if (this.localNeedToSave) {
        this.$mainAlertInfo('No changes to save routes')
        return
      }

      this.loading = true

      try {
        await this.$store.dispatch('oos/routes/save_routes', {
          routes: this.localRoutes,
          routesDelete: this.routesDelete,
        })
        this.$mainAlertSuccess('Route updated successfully')
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      } finally {
        this.loading = false

        /* setTimeout(()=>{
          this.init()
        },1000) */
      }
    },
    handleUpdateContractors({ lead, contractors, routeId }) {
      const idx = this.localRoutes.findIndex((r) => r.id === routeId)
      if (idx === -1) return
      const newRoute = this.localRoutes[idx]
      newRoute.contractors = contractors.map((c) => c.uid)
      newRoute.assignedTo = lead
      this.localRoutes.splice(idx, 1, newRoute)
    },
    handleUpdateOrders(orders) {
      this.localOrders = [...this.localOrders, ...orders]
    },
    handleDaleteOrder(orderId) {
      const indexOfOrder = this.localOrders.findIndex((r) => r.id === orderId)
      if (indexOfOrder === -1) return
      this.localOrders.splice(indexOfOrder, 1)
    },
  },
}
</script>
<style lang="scss" scoped>
.container-routes {
  width: 100%;
  transition: width 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  &.showSummaryDrawer {
    width: calc(100% - 340px);
    transition: width 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.routes {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
}
.header-content {
  background-color: var(--v-secondary-base);
  max-height: 48px;
  min-height: 48px;
}
.switch-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.761);
}
</style>
