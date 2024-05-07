<template>
  <div class="route-container | d-flex flex-column py-1">
    <div class="routes-toolbar | flex-grow-0 d-flex align-center px-2 mb-4">
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="addRoute"
            ><v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('addRoute') }}</span>
      </v-tooltip>
      <div class="toolbar-title text-h6">{{ $t('routes') }}</div>
      <v-spacer></v-spacer>
      <div class="for-date d-flex align-center">
        <p class="mr-2 mb-0 text-h6"></p>
      </div>
      <v-spacer></v-spacer>
    </div>

    <div class="routes-list-container | flex-grow-1">
      <div v-if="loadingRoutes" class="loading">Loading...</div>
      <div
        v-if="routes.length && !loadingRoutes"
        class="routes-list | px-4 pt-2"
      >
        <route
          v-for="(route, i) in routesFormatted"
          :ref="route.id"
          :key="route.id"
          class="route d-flex flex-column"
          :num="i + 1"
          :route="route"
          :put-back-option="true"
          :select-origin="true"
          :google="google"
          @show-route-view="handleShowRouteView(route)"
          @dragenter="dragEnter($event, route)"
          @dragover="dragOver($event, route)"
          @dragleave="dragLeave($event, route)"
          @drop="drop($event, route)"
          @assign-route="handleAssignRoute(route)"
          @close-route="handleCloseRoute(route)"
          @put-back-order="putBackOrder"
          @select-origin="selectOrigin(route)"
        />
      </div>
    </div>
    <local-route-view
      :google="google"
      :show="showRouteView"
      :route="routeSelected"
      @save-instructions="handleSaveInstructions($event, routeSelected)"
      @close="handleCloseLocalRouteView"
      @dragenter="dragEnter($event, routeSelected)"
      @dragover="dragOver($event, routeSelected)"
      @dragleave="dragLeave($event, routeSelected)"
      @drop="drop($event, routeSelected, true)"
    />
    <AssignOrderModal
      :show="showSelectContractor"
      :orders="routeSelected.orders"
      :in-route="true"
      :route-lead="routeSelected.assignedTo"
      @close="handleCloseAssignOrderModal"
      @save="assignRoute"
      @update-orders="handleUpdateLocalOrders"
    />
    <SelectOriginAddress
      :show="showSelectOrigin"
      :google="google"
      :home-location="homeLocation"
      :route="routeSelected"
      @close="handleCloseSelectOriginAddress"
      @new-address-preselected="handleAddMarker($event, routeSelected)"
      @save-origin-address="handleSaveOriginAddress"
    />
  </div>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'
import { createNamespacedHelpers } from 'vuex'
import Route from '@/components/routes/Route.vue'
import LocalRouteView from '@/components/routes/RouteView'
import AssignOrderModal from '~/components/orders/modals/AssignOrderModal.vue'
import SelectOriginAddress from '~/components/modals/SelectOriginAddress.vue'
const { mapState, mapActions, mapMutations, mapGetters } =
  createNamespacedHelpers('routes')
export default {
  name: 'RoutesPanel',
  components: { Route, LocalRouteView, AssignOrderModal, SelectOriginAddress },

  data() {
    return {
      routeSelected: { orders: [], assignedTo: {} },
      showRouteView: false,
      showSelectContractor: false,
      showSelectOrigin: false,
    }
  },
  computed: {
    homeLocation() {
      return this.$store.state.config.homeLocation
    },
    ...mapState({
      showRouteInMap: (state) => state.showRouteInMap,

      routes: (state) => state.routes,
      forDateStr: (state) => state.forDateStr,
      baseOrders: (state) => state.baseOrders,
      markers: (state) => state.markers,
      loadingRoutes: (state) => state.loadingRoutes,
    }),

    dummyRoute: {
      get() {
        return this.$store.state.routes.dummyRoute
      },
      set(payload) {
        this.$store.commit('routes/set_dummyRoute', payload)
      },
    },
    ...mapGetters({
      routesFormatted: 'routesFormatted',
      routeSelectedFormatted: 'routeSelectedFormatted',
    }),
    google: getGoogleMapsAPI,
  },

  watch: {
    forDateStr: {
      async handler(val, oldVal) {
        if (oldVal) {
          this.dummyRoute = {
            ...this.dummyRoute,
            forDateStr: val,
          }
          await this.getRoutes(val)
        }
      },
      immediate: true,
    },
    routes: {
      handler(newVal) {
        newVal.forEach((route) => {
          const orders = route.orders
          if (orders && orders.length) {
            orders.forEach((orderId) => {
              const index = this.baseOrders.map((o) => o.id).indexOf(orderId)
              if (index === -1) {
                this.addOrderToBaseOrders(orderId)
              }
            })
          }

          this.handleAddMarker(
            {
              location: { ...route.originLocation },
              address: route.originAddress,
            },
            route
          )
        })
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    try {
      this.loading = true
      await this.$gmapApiPromiseLazy()
      if (this.forDateStr) {
        this.setLoadingRoutes(true)
        await this.getRoutes(this.forDateStr)
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log('error routes panel mounted', error)
      this.$mainAlertError(
        'There was an error getting routes for today. Please try later. If the error persists, contact support.'
      )
    } finally {
      this.setLoadingRoutes(false)
    }
  },
  methods: {
    ...mapActions({
      getRoutes: 'get_routes',
      saveRoutes: 'save_routes',
      deleteRoute: 'delete_route',
    }),
    ...mapMutations({
      addBaseOrder: 'add_baseOrder',
      addRouteStore: 'add_route',
      removeBaseOrder: 'remove_baseOrder',
      insertOrderToRoute: 'insert_order_to_route',
      addOrderToRoute: 'add_order_to_route',
      removeOrderFromRoute: 'remove_order_from_route',
      datachListeners: 'datach_listeners',
      flushState: 'flush_state',
      updateRoute: 'update_route',
      updateOrderInRoute: 'update_order_in_route',
      addMarker: 'add_marker',
      removeMarker: 'remove_marker',
      setLoadingRoutes: 'set_loadingRoutes',
      setDummyRoute: 'set_dummyRoute',
      setShowRouteInMap: 'set_showRouteInMap',
      setRouteSelected: 'set_routeSelected',
    }),

    async addOrderToBaseOrders(orderId) {
      try {
        const order = await this.$store.dispatch(
          'orders/get_order_by_id',
          orderId
        )
        if (order.error) {
          this.$mainAlertError(`${order.error}`)
          return
        }
        const _order = {
          ...this.$store.state.orders.dummyOrder,
          ...order,
          assigned: order.contractors.length > 0,
          unassigned: order.contractors.length === 0,
          contractorList: order.contractors.map((c) => ` ${c.fullName}`),
        }
        this.$emit('get-markers', { orders: [_order] })
        this.addBaseOrder([_order])
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },

    addRoute() {
      const id = +this.$generateId()
      const newRoute = Object.assign({}, this.dummyRoute)
      newRoute.id = id
      newRoute.orders = []
      this.setDummyRoute({
        forDateStr: this.forDateStr,
      })

      this.addRouteStore(newRoute)
    },
    handleAddMarker(origin, route) {
      if (!route) return
      const idx = this.markers.findIndex((m) => {
        return m.id === route.id
      })
      if (idx > -1) {
        this.removeMarker({ id: route.id })
      }

      const isSameHomeLocation = this._.isEqual(
        route.originLocation,
        this.homeLocation
      )
      const isSameHomeAddress =
        route.originAddress === '65 Davis Ave, Kearny, NJ 07032, USA'

      if (isSameHomeAddress || isSameHomeLocation || !origin.location) return

      const num = this.routes.findIndex((r) => r.id === route.id) + 1

      const marker = {
        position: origin.location,
        title: `${num}. ${route.groupName ?? 'Route'} Origin`,
        label: {
          // eslint-disable-next-line
          text: `R${num}`,
          color: '#ffffff',
          fontSize: '18px',
        },
        background: '#000000',
        optimized: true,
        id: route.id,
      }

      this.addMarker(marker)
    },
    putBackOrder({ route, order }) {
      this.removeOrderFromRoute({ routeId: route.id, orderId: order.id })
      this.$nextTick(() => {
        if (
          this.showRouteInMap &&
          this.routeSelectedFormatted?.id === route.id
        ) {
          this.resetShowRouteInMap()
        }
      })
    },
    handleShowRouteView(route) {
      this.routeSelected = route
      this.showRouteView = true
    },
    handleUpdateLocalOrders(orders) {
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i]

        this.removeBaseOrder(order)

        // this.baseOrders.splice(index, 1, order)
      }
    },
    dragEnter(e, route) {
      e.preventDefault()
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
    drop(event, route, isRouterView) {
      const { e, afterElement } = event

      e.preventDefault()
      e.target.classList.remove('dragover')

      if (route.forDateStr !== this.forDateStr) {
        return
      }

      const data = e.dataTransfer.getData('text/plain')

      const { orderId, originRouteId } = JSON.parse(data)

      if (!route.orders.map((o) => o.id).includes(orderId)) {
        if (!afterElement) {
          // eslint-disable-next-line
          console.log('No After Element')

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
          if (
            this.showRouteInMap &&
            this.routeSelectedFormatted?.id === routeOrigin.id
          ) {
            this.resetShowRouteInMap()
          }
        }
      } else if (!afterElement) {
        // eslint-disable-next-line
        console.log('route.orders includes orderId and No After Element')
        this.removeOrderFromRoute({ routeId: originRouteId, orderId })
        this.$nextTick(() => {
          this.addOrderToRoute({ orderId, routeId: originRouteId })
          this.handleRouteView(isRouterView, originRouteId)
        })
      } else {
        const afterOrderId = afterElement.id

        // eslint-disable-next-line
        console.log(
          'route.orders includes orderId and After Element',
          afterOrderId
        )

        this.removeOrderFromRoute({ routeId: originRouteId, orderId })
        this.$nextTick(() => {
          this.insertOrderToRoute({
            routeId: originRouteId,
            afterOrderId,
            orderId,
          })
          this.handleRouteView(isRouterView, originRouteId)
        })
      }

      if (this.showRouteInMap && this.routeSelectedFormatted?.id === route.id) {
        this.resetShowRouteInMap()
      }
    },
    resetShowRouteInMap() {
      const oldRouteSelected = this.routeSelectedFormatted.id
      this.setShowRouteInMap(false)
      this.setRouteSelected(null)
      this.$nextTick(() => {
        this.setRouteSelected(oldRouteSelected)
        this.$nextTick(() => {
          this.setShowRouteInMap(true)
        })
      })
    },
    handleRouteView(isRouterView, originRouteId) {
      if (isRouterView && originRouteId) {
        this.routeSelected = this.routesFormatted.filter(
          (route) => route.id === originRouteId
        )[0]
      }
    },

    handleSaveOriginAddress(origin) {
      // eslint-disable-next-line
      console.log('origin', origin)

      const route = this.routes.filter((r) => r.id === this.routeSelected.id)[0]

      this.updateRoute({
        ...route,
        originAddress: origin?.address ?? '',
        originLocation: origin?.location ?? null,
      })
    },

    handleCloseAssignOrderModal() {
      this.routeSelected = { orders: [] }
      this.showSelectContractor = false
    },
    handleCloseSelectOriginAddress(reset) {
      this.showSelectOrigin = false

      if (reset) {
        this.removeMarker({ id: this.routeSelected.id })

        const indexOfRoute = this.routes.findIndex(
          (r) => r.id === this.routeSelected.id
        )

        if (indexOfRoute > -1 && this.routes[indexOfRoute].originAddress) {
          this.handleAddMarker(
            {
              location: { ...this.routes[indexOfRoute].originLocation },
              address: this.routes[indexOfRoute].originAddress,
            },
            this.routes[indexOfRoute]
          )
        }
      }
    },
    handleAssignRoute(route) {
      if (!route.orders?.length) {
        this.$mainAlertInfo(
          'Please add orders before adding contractors to this route'
        )
        return
      }
      this.routeSelected = route

      this.showSelectContractor = true
    },
    assignRoute({ lead, contractors }) {
      const route = this.routes.filter((r) => r.id === this.routeSelected.id)[0]
      this.updateRoute({
        ...route,
        assignedTo: lead,
        contractors: contractors.map((c) => c.uid),
        contractorsProfiles: contractors,
        groupName: `${lead.name}'s Crew`,
      })
    },
    handleCloseRoute(route) {
      const removeKey = !isNaN(route.id) ? 'onLocal' : 'onDb'
      const putBackOrders = () => {
        if (route.orders.length) {
          removeKeyOption[removeKey]()
          route.orders.forEach((order) => {
            this.putBackOrder({ route, order })
          })
        }
      }
      const removeKeyOption = {
        onLocal: () => {
          putBackOrders()
          this.$store.commit('routes/remove_route', route.id)
        },
        onDb: () => {
          if (
            confirm(
              'Confirma que deseas eliminar esta ruta. Esta accion no se puede deshacer'
            )
          ) {
            putBackOrders()
            this.deleteRoute(route.id)
          }
        },
      }
      removeKeyOption[removeKey]()
    },
    toggleBounce() {},
    selectOrigin(route) {
      this.selectingOrigin = true
      this.routeSelected = route
      this.showSelectOrigin = true
    },
    handleSaveInstructions(objToUpdate, route) {
      this.updateRoute(objToUpdate)
      this.$nextTick(() => {
        const routeUpdated = this.routesFormatted.filter(
          (r) => r.id === route.id
        )[0]
        this.routeSelected = routeUpdated
      })
    },
    handleCloseLocalRouteView() {
      this.routeSelected = { orders: [], assignedTo: {} }
      this.showRouteView = false
    },
  },
}
</script>

<style lang="scss" scoped>
.routes-list-container {
  position: relative;
}
.routes-list {
  position: absolute;
  inset: 0;
  height: 100%;
  overflow-y: auto;
}

.dragover:not(.order-address) {
  background-color: var(--v-terciary-base);
  .route-sign {
    background-color: var(--v-terciary-base);
  }
}
</style>
