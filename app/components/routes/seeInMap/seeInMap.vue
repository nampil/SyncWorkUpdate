<template>
  <div class="see-in-map">
    <v-toolbar dense dark falt color="secondary" class="top-bar elevation-0">
      <v-tooltip open-delay="600" content-class="small" top>
        <!-- eslint-disable-next-line -->
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="mr-6 ml-1"
            icon
            small
            v-bind="attrs"
            v-on="on"
            @click.stop="$router.go(-1)"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('back') }}</span>
      </v-tooltip>
      <v-toolbar-title class="text-md-h5 font-weight-bold">{{
        $t('routing')
      }}</v-toolbar-title>
      <span>{{ $root.historyCount }}</span>

      <v-spacer></v-spacer>
      <div v-if="forDateStr" class="d-flex align-center text-h6">
        <v-menu
          ref="dateMenu"
          v-model="dateMenu"
          transition="scale-transition"
          :close-on-content-click="false"
        >
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn small color="primary" class="mr-4" v-bind="attrs" v-on="on">
              <span class="mr-2">{{ forDateStrFormatted }}</span>
              <v-icon small>mdi-calendar</v-icon>
            </v-btn>
          </template>
          <v-date-picker
            v-model="forDateStr"
            color="primary"
            @input="dateMenu = false"
          >
          </v-date-picker>
        </v-menu>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        small
        color="success"
        class="elevation-0 mr-4"
        @click="handleSave"
        >{{ $t('save') }}</v-btn
      >
      <v-btn small color="error" outlined>{{ $t('cancel') }}</v-btn>
    </v-toolbar>
    <div class="content">
      <div ref="grid" class="grid-container">
        <OrdersPanel
          class="orders-panel"
          :base-orders="baseOrders"
          @delete-order="handleDeleteOrder($event)"
          @toggle-bounce="toggleBounce($event)"
          @add-order-to-map="handleAddOrderToMap"
        />

        <div class="routes">
          <div class="route-container | h-100 d-flex flex-column">
            <div
              class="routes-toolbar | flex-grow-0 d-flex align-center px-4 py-1"
            >
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
              <div v-if="routes.length && !loading" class="routes-list">
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
                  @toggle-bounce="toggleBounce"
                  @put-back-order="putBackOrder"
                  @select-origin="selectOrigin(route)"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="map">
          <GmapMap
            ref="gmap"
            :center="homeLocation"
            :zoom="11"
            map-type-id="roadmap"
            style="width: 100%; height: 100%"
            :options="{
              styles: $vuetify.theme.dark ? mapStyles : [],
            }"
          >
          </GmapMap>
        </div>
      </div>
    </div>

    <assignOrderModal
      :show="showSelectContractor"
      :orders="routeSelected.orders"
      :in-route="true"
      :route-lead="routeSelected.assignedTo"
      @close="handleCloseAssignOrderModal"
      @save="assignRoute"
      @update-orders="handleUpdateLocalOrders"
    />

    <!-- <select-contractor
      :show="showSelectContractor"
      :multiple="false"
      @close="showSelectContractor = false"
      @save="assignRoute"
    /> -->
    <order-view
      :show="showOrderView"
      :order="orderToView"
      @close="handleViewOrder(false)"
    />

    <orders-view
      :show="showOrdersView"
      :base-orders="baseOrders"
      @send="handleAddOrderToBaseOrders"
      @close="showOrdersView = false"
    />
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
    >
    </local-route-view>

    <SelectOriginAddress
      :show="showSelectOrigin"
      :google="google"
      :home-location="homeLocation"
      :route="routeSelected"
      @close="handleCloseSelectOriginAddress"
      @new-address-preselected="addMarker($event, routeSelected)"
      @save-origin-address="handleSaveOriginAddress"
    />

    <loader-overlay v-if="loading" />
  </div>
</template>

<script>
import { getGoogleMapsAPI } from 'gmap-vue'

import { createNamespacedHelpers } from 'vuex'
import LocalRouteView from '@/components/routes/RouteView'
import LoaderOverlay from '@/components/misc/LoaderOverlay.vue'
import SelectOriginAddress from '@/components/modals/SelectOriginAddress.vue'
// import SelectContractor from '@/components/orders/modals/SelectContractor.vue'
import OrderView from '@/components/orders/orderView.vue'
import OrdersView from '@/components/orders/ordersView.vue'
import Route from '@/components/routes/Route.vue'
import AssignOrderModal from '@/components/orders/modals/AssignOrderModal.vue'
import OrdersPanel from '@/components/routes/seeInMap/OrdersPanel.vue'
import { CATEGORY_OPTIONS } from '@/utils/dictionaries'

const { mapState, mapActions, mapMutations } = createNamespacedHelpers('routes')

export default {
  name: 'SeeInMap',
  components: {
    AssignOrderModal,
    LoaderOverlay,
    OrderView,
    OrdersView,
    Route,
    LocalRouteView,
    OrdersPanel,
    SelectOriginAddress,
  },

  data() {
    return {
      CATEGORY_OPTIONS: null,
      loading: false,
      showRouteView: false,
      showSelectContractor: false,
      routeSelected: { orders: [], assignedTo: {} },
      selectingOrigin: false,
      showSelectOrigin: false,
      dateMenu: false,
      forDateStr: '',
      orders: [],
      showOrdersView: false,
      showOrderView: false,
      orderToView: {},
      baseOrders: [],
      markers: [],
      labels: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'Aa',
        'Ba',
        'Ca',
        'Da',
        'Ea',
        'Fa',
        'Ga',
        'Ha',
        'Ia',
        'Ja',
        'Ka',
        'La',
        'Ma',
        'Na',
        'Oa',
        'Pa',
        'Qa',
        'Ra',
        'Sa',
        'Ta',
        'Ua',
        'Va',
        'Wa',
        'Xa',
        'Ya',
        'Za',
        'Ab',
        'Bb',
        'Cb',
        'Db',
        'Eb',
        'Fb',
        'Gb',
        'Hb',
        'Ib',
        'Jb',
        'Kb',
        'Lb',
        'Mb',
        'Nb',
        'Ob',
        'Pb',
        'Qb',
        'Rb',
        'Sb',
        'Tb',
        'Ub',
        'Vb',
        'Wb',
        'Xb',
        'Yb',
        'Zb',
        'Ac',
        'Bc',
        'Cc',
        'Dc',
        'Ec',
        'Fc',
        'Gc',
        'Hc',
        'Ic',
        'Jc',
        'Kc',
        'Lc',
        'Mc',
        'Nc',
        'Oc',
        'Pc',
        'Qc',
        'Rc',
        'Sc',
        'Tc',
        'Uc',
        'Vc',
        'Wc',
        'Xc',
        'Yc',
        'Zc',
        'Ad',
        'Bd',
        'Cd',
        'Dd',
        'Ed',
        'Fd',
        'Gd',
        'Hd',
        'Id',
        'Jd',
        'Kd',
        'Ld',
        'Md',
        'Nd',
        'Od',
        'Pd',
        'Qd',
        'Rd',
        'Sd',
        'Td',
        'Ud',
        'Vd',
        'Wd',
        'Xd',
        'Yd',
        'Zd',
      ],
      usedLabels: [],
      map: null,
      mapStyles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }],
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }],
        },
      ],
    }
  },

  computed: {
    prioritiesInOrders() {
      const ordersPriorities = this.orderList.map((o) => o.category)
      const priorityMap = ordersPriorities.reduce((prev, cur) => {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})

      return priorityMap
    },
    dummyRoute: {
      get() {
        return this.$store.state.routes.dummyRoute
      },
      set(payload) {
        this.$store.commit('routes/set_dummyRoute', payload)
      },
    },
    homeLocation() {
      return this.$store.state.config.homeLocation
    },
    ordersSelected() {
      return this.$store.state.orders.ordersSelected
    },
    ...mapState({
      routes: (state) => state.routes,
    }),

    routesFormatted() {
      const _routes = []

      this.routes.forEach((route) => {
        const orders = route.orders.map((id) => {
          const order = this.baseOrders.filter((o) => o.id === id)[0]
          return order
        })

        const _contractors = []
        if (orders.length) {
          orders.forEach((order) => {
            if (order) {
              order.contractors.forEach((contractor) => {
                _contractors.push(contractor)
              })
            }
          })
        }
        // const stops = this.getStops(orders)

        const _route = {
          ...route,
          orders,
          assignedContractors: _contractors,
        }

        _routes.push(_route)
      })
      const routesBaseBd = _routes
        .filter((r) => r.createdAt)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })

      const routesNew = _routes
        .filter((r) => !r.createdAt)
        .sort((a, b) => {
          const aCreatedAt = a.createdAt
          const bCreatedAt = b.createdAt
          return aCreatedAt > bCreatedAt ? 1 : -1
        })

      return routesBaseBd.concat(routesNew)
    },
    orderList() {
      const _orders = []
      const ordersInRoutes = []
      this.routes.forEach((route) => {
        route.orders.forEach((orderId) => {
          const index = this.baseOrders.map((o) => o.id).indexOf(orderId)
          if (index > -1) {
            ordersInRoutes.push(this.baseOrders[index])
          }
        })
      })

      if (this.baseOrders && typeof this.baseOrders === 'object') {
        this.baseOrders.forEach((order) => {
          const indexOfOrderInRoutes = ordersInRoutes
            .map((o) => o.id)
            .indexOf(order.id)
          if (indexOfOrderInRoutes < 0) {
            _orders.push(order)
          }
        })
      }

      return _orders
        .map((o) => o)
        .sort((a, b) => {
          if (a.label < b.label) {
            return -1
          }
          if (a.label > b.label) {
            return 1
          }
          return 0
        })
    },
    google: getGoogleMapsAPI,
    forDateStrFormatted() {
      if (!this.forDateStr) {
        return ''
      }
      const [year, month, day] = this.forDateStr.split('-')
      return `${month}-${day}-${year}`
    },
    sorttedOrders() {
      return this.orders
        .map((o) => o)
        .sort((a, b) => {
          if (a.label < b.label) {
            return -1
          }
          if (a.label > b.label) {
            return 1
          }
          return 0
        })
    },
  },

  watch: {
    async forDateStr(val, oldVal) {
      if (oldVal) {
        this.dummyRoute = {
          ...this.dummyRoute,
          forDateStr: val,
        }
        await this.getRoutes(val)
      }
    },
    baseOrders(val) {},
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

          if (route.originAddress) {
            this.addMarker(
              {
                location: { ...route.originLocation },
                address: route.originAddress,
              },
              route
            )
          }
        })
      },
      deep: true,
      immediate: true,
    },
    ordersSelected(val) {
      this.handleAddOrderToBaseOrders(val)
    },
  },

  created() {
    this.CATEGORY_OPTIONS = CATEGORY_OPTIONS
  },

  async mounted() {
    this.$nextTick(async () => {
      const map = await this.$refs.gmap.$mapPromise
      this.map = map

      await this.$gmapApiPromiseLazy()

      const marker = new this.google.maps.Marker({
        position: this.homeLocation,
        title: 'Daytona Home Office',
        label: {
          // eslint-disable-next-line
          text: '\u{F02DC}',
          fontFamily: 'Material Design Icons',
          color: '#ffffff',
          fontSize: '18px',
        },
        optimized: true,
      })

      marker.setMap(this.map)
    })
    const _orders = this.$route.params.orders

    this.loading = true

    this.setForDate(new Date())
    await this.getRoutes(this.forDateStr)
    if (_orders && _orders.length) {
      this.setInitState(_orders)
    }
    this.loading = false
  },
  beforeDestroy() {
    this.datachListeners()
    this.flushState()
  },

  methods: {
    handleSaveOriginAddress(origin) {
      const route = this.routes.filter((r) => r.id === this.routeSelected.id)[0]

      this.updateRoute({
        ...route,
        originAddress: origin?.address ?? '',
        originLocation: origin?.location ?? null,
      })
    },
    handleCloseSelectOriginAddress(reset) {
      this.showSelectOrigin = false
      // eslint-disable-next-line
      console.log('reset', reset)

      if (reset) {
        const idx = this.markers.findIndex((m) => {
          return m.marker.id === this.routeSelected.id
        })
        if (idx > -1) {
          this.markers[idx].marker.setMap(null)
          this.markers.splice(idx, 1)
        }

        const indexOfRoute = this.routes.findIndex(
          (r) => r.id === this.routeSelected.id
        )

        if (indexOfRoute > -1 && this.routes[indexOfRoute].originAddress) {
          this.addMarker(
            {
              location: { ...this.routes[indexOfRoute].originLocation },
              address: this.routes[indexOfRoute].originAddress,
            },
            this.routes[indexOfRoute]
          )
        }
      }
    },
    addMarker(origin, route) {
      const idx = this.markers.findIndex((m) => {
        return m.marker.id === route.id
      })
      if (idx > -1) {
        this.markers[idx].marker.setMap(null)
        this.markers.splice(idx, 1)
      }

      const num = this.routes.findIndex((r) => r.id === route.id) + 1

      const marker = new this.google.maps.Marker({
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
      })

      marker.setMap(this.map)
      this.markers.push({ marker })
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
    handleShowRouteView(route) {
      this.routeSelected = route
      this.showRouteView = true
    },
    handleCloseAssignOrderModal() {
      this.routeSelected = { orders: [] }
      this.showSelectContractor = false
    },
    handleUpdateLocalOrders(orders) {
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i]
        const index = this.baseOrders.map((o) => o.id).indexOf(order.id)
        this.baseOrders.splice(index, 1, order)
      }
    },
    selectOrigin(route) {
      this.selectingOrigin = true
      this.routeSelected = route
      this.showSelectOrigin = true
    },
    setLabelsOptions() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const repeat = 5
      const options = []

      for (let i = 1; i <= repeat; i++) {
        for (let j = 0; j < letters.length; j++) {
          if (i === 1) {
            options.push(letters[j])
          } else if (i === 2) {
            options.push(letters[j] + letters[0].toLowerCase())
          } else if (i === 3) {
            options.push(letters[j] + letters[1].toLowerCase())
          } else if (i === 4) {
            options.push(letters[j] + letters[2].toLowerCase())
          } else if (i === 5) {
            options.push(letters[j] + letters[3].toLowerCase())
          } else {
            options.push(letters[j] + letters[4].toLowerCase())
          }
        }
      }
      this.labels = options
    },
    handleAddOrderToBaseOrders(orders) {
      const mainOrders = this.$store.state.orders.orders

      const _baseOrders = []

      orders.forEach((order) => {
        const index = mainOrders.map((o) => o.id).indexOf(order.id)
        if (index > -1) {
          _baseOrders.push({
            ...mainOrders[index],
          })
        }
      })

      this.setInitState(_baseOrders)
      this.showOrdersView = false
    },
    handleAddOrderToMap() {
      this.showOrdersView = true
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
    async setInitState(_orders) {
      this.baseOrders = _orders
      this.cleanMarkers()
      await this.getMarkers(this.baseOrders)

      this.loading = false
    },
    ...mapActions({
      getRoutes: 'get_routes',
      saveRoutes: 'save_routes',
      deleteRoute: 'delete_route',
    }),
    ...mapMutations({
      addRouteStore: 'add_route',
      insertOrderToRoute: 'insert_order_to_route',
      addOrderToRoute: 'add_order_to_route',
      removeOrderFromRoute: 'remove_order_from_route',
      datachListeners: 'datach_listeners',
      flushState: 'flush_state',
      updateRoute: 'update_route',
      updateOrderInRoute: 'update_order_in_route',
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
        await this.getMarkers([_order])
        this.baseOrders.push(_order)
      } catch (error) {
        this.$mainAlertError(this.$t('oopsProblem'))
        // eslint-disable-next-line
        console.log('error: ', error)
      }
    },

    async handleSave() {
      const hayRoutes = this.routes.length > 0
      const allRoutesHasAssignedTo =
        this.routes.filter((route) => this._.isEmpty(route.assignedTo))
          .length === 0
      const routesHasOrders =
        this.routes.filter((r) => r.orders.length === 0).length === 0

      if (!hayRoutes || !allRoutesHasAssignedTo || !routesHasOrders) {
        this.$mainAlertInfo(this.$t('routesAndOrderComplete'))
        return
      }
      try {
        this.loading = true

        this.routesFormatted.forEach((route) => {
          const stops = this.getStops(route.orders)
          this.$store.commit('routes/update_stopsInroute', {
            stops,
            routeId: route.id,
          })
        })

        await this.saveRoutes({ baseOrders: this.baseOrders })

        // this.datachListeners()
        // this.flushState()

        // this.$router.replace('/dispatching')
        this.$mainAlertSuccess(this.$t('routesSaved'))

        this.loading = false
      } catch (error) {
        this.loading = false
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      }
    },

    setForDate(date) {
      const forDateStr = this.$formatDate(date, { iso: true })
      this.forDateStr = forDateStr

      // const dateTimestamp =

      this.dummyRoute = {
        ...this.dummyRoute,
        forDateStr,
      }
    },
    handleCloseRoute(route) {
      if (route.orders.length) {
        route.orders.forEach((order) => {
          this.putBackOrder({ route, order })
        })
      }

      if (isNaN(route.id)) {
        this.deleteRoute(route.id)
      } else {
        this.$store.commit('routes/remove_route', route.id)
      }
    },
    handleDeleteOrder(order) {
      const indexToDelete = this.markers
        .map((m) => m.marker.orderId)
        .indexOf(order.id)
      if (indexToDelete > -1) {
        this.markers[indexToDelete].marker.setMap(null)
        this.markers.splice(indexToDelete, 1)
      }

      const indexToRemove = this.baseOrders.map((o) => o.id).indexOf(order.id)
      this.baseOrders.splice(indexToRemove, 1)
    },
    putBackOrder({ route, order }) {
      this.removeOrderFromRoute({ routeId: route.id, orderId: order.id })
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
          this.handleRouteView(isRouterView, originRouteId)
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
          this.handleRouteView(isRouterView, originRouteId)
        })
      }
    },
    handleRouteView(isRouterView, originRouteId) {
      if (isRouterView && originRouteId) {
        this.routeSelected = this.routesFormatted.filter(
          (route) => route.id === originRouteId
        )[0]
      }
    },

    toggleBounce({ orderId, value }) {
      if (
        !this.markers.filter((m) => {
          return m.marker.orderId === orderId
        })[0]
      ) {
        return
      }

      const { marker } = this.markers.filter((m) => {
        return m.marker.orderId === orderId
      })[0]

      if (value) {
        marker.setAnimation(this.google.maps.Animation.BOUNCE)
      } else {
        marker.setAnimation(null)
      }
    },

    addRoute() {
      const id = new Date().getTime()
      const newRoute = Object.assign({}, this.dummyRoute)
      newRoute.id = id
      newRoute.orders = []
      this.addRouteStore(newRoute)
    },
    cleanMarkers() {
      this.markers.forEach((marker, i) => {
        marker.marker.setMap(null)
      })
      this.markers = []
    },
    async getMarkers(orders) {
      if (!orders && !orders.length) {
        return
      }

      try {
        for (let i = 0; i < orders.length; i++) {
          const order = orders[i]

          const orderMarked = this.markers
            .map((m) => m.marker.orderId)
            .includes(order.id)
          if (orderMarked) {
            continue
          }

          const address = encodeURIComponent(
            `${order.address} ${order.city} ${order.county || ''} ${
              order.state || ''
            } ${order.zip}`
          )
          const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?'
          const apiKey = this.$config.gmapApiKey
          const res = await this.$axios.$get(
            baseUrl + 'address=' + address + '&key=' + apiKey
          )
          let location = null

          if (!res || !res.results[0]) {
            if (res.status === 'ZERO_RESULTS') {
              alert(
                `The WO# ${order.woNumber} address does not have result in google map`
              )
              order.noAddressResults = true
            }

            continue
          }

          location = res.results[0].geometry.location

          const nextLabel = this.labels[this.markers.length]
          this.$nextTick(() => {
            order.label = nextLabel
          })

          const pinColor = this.$getCategoryColor({
            category: order.category,
            hex: true,
          })

          const title = `${order.address}, ${order.county} \n ${order.city}, ${order.zip} \n ${order.workType} - ${order.category}`
          const pinSVGFilled =
            'M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z'
          const labelOriginFilled = new this.google.maps.Point(12, 9)

          const label = {
            text: `${nextLabel}`,
            color: 'white',
            fontSize: '16px',
          }

          const markerImage = {
            // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
            path: pinSVGFilled,
            anchor: new this.google.maps.Point(12, 17),
            fillOpacity: 1,
            fillColor: pinColor,
            strokeWeight: 2,
            strokeColor: 'black',
            scale: 2,
            labelOrigin: labelOriginFilled,
          }

          const marker = new this.google.maps.Marker({
            position: location,
            orderId: order.id,
            map: this.map,
            title,
            label,
            optimized: true,
            icon: markerImage,
          })

          this.markers.push({
            location,
            label: nextLabel,
            marker,
          })
        }
        return { status: 'ok' }
      } catch (error) {
        // eslint-disable-next-line
        console.log('error: ', error)

        this.$mainAlertError(this.$t('problemsAddressOrder'))
      }
    },
    getStops(orders) {
      if (!orders.length) {
        return []
      }

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

      return stops
    },
  },
}
</script>

<style lang="scss" scoped>
.see-in-map {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.top-bar {
  flex: 0 0 auto;
}
.content {
  flex: 1 1 auto;
  position: relative;
}
.grid-container {
  --border-right: 1px solid #ffffff;
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr) minmax(
      300px,
      1fr
    );

  .orders-panel {
    grid-column: 1/2;
  }
  .routes {
    grid-column: 2/3;
    border-right: 1px solid;
  }

  .map {
    grid-column: 3/4;
  }
}

// .routes-toolbar {
// }
.routes-list-container {
  position: relative;
}
.routes-list {
  padding: 1rem;
  position: absolute;
  inset: 0;
  overflow-y: auto;
}

.route {
  max-width: 100%;
  max-height: 400px;
  border-radius: 0.5rem;
  border: 1px solid var(--v-secondary-base);

  position: relative;

  .route-sign {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 13px;
    background-color: #fff;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.6);
  }

  .route-top {
    &-title {
      font-size: 0.75rem;
      font-weight: 600;
      padding-inline: 0.5rem;
    }
  }
  .order-list {
    font-size: 0.75rem;
    overflow-y: auto;
  }
  .order-mark {
    padding: 4px;
    font-size: 0.6rem;
  }
  .order-address {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.actions {
  align-self: end;
}

.dragover:not(.order-address) {
  background-color: var(--v-terciary-base);
  .route-sign {
    background-color: var(--v-terciary-base);
  }
}

.dragging {
  opacity: 0.5;
}
.order-metadata,
.order-list-metadata {
  font-size: 0.9em;
}
</style>
