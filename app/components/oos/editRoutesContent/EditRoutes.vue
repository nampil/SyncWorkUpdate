<template>
  <div
    v-if="route"
    class="container-route | h-100"
    :class="`${isStopsDrawer ? '' : 'route-border'}`"
    @dragenter="$emit('dragenter', $event)"
    @dragover="$emit('dragover', $event)"
    @dragleave="$emit('dragleave', $event)"
    @drop="handleDrop"
  >
    <v-card
      class="route | h-100 d-flex flex-column rounded-lg"
      outlined
      color="background_drawer"
    >
      <div v-if="editing" class="close-box | d-flex">
        <v-tooltip open-delay="600" content-class="small" top>
          <!-- eslint-disable-next-line -->
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-auto"
              icon
              x-small
              v-bind="attrs"
              v-on="on"
              @click="$emit('delete_route', route.id)"
            >
              <v-icon small color="error" class="close-route">mdi-close</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('deleteRoute') }}</span>
        </v-tooltip>
      </div>

      <div class="pa-4 pb-1">
        <header-route
          :route="route"
          :num="num"
          :editing="editing"
          :is-history="isHistory"
          :is-stops-drawer="isStopsDrawer"
          @update-group-name="$emit('update-group-name', $event)"
        ></header-route>

        <div v-if="!isHistory" class="container-location pt-1">
          <lead-location :route="route" />
        </div>
        <Supervisors :route="route" :editing="editing"></Supervisors>

        <div
          v-if="route.contractors"
          class="contractors-container | d-flex flex-wrap wraper align-center"
        >
          <span class="caption info_stops--text">{{ $t('contractors') }}</span>
          <v-tooltip open-delay="600" content-class="small" top>
            <!-- eslint-disable-next-line -->
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-show="editing"
                icon
                x-small
                v-bind="attrs"
                v-on="on"
                @click="showSelectContractor = !showSelectContractor"
              >
                <v-icon small color="primary">mdi-pencil-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('editContractors') }}</span>
          </v-tooltip>
          <span class="caption info_stops--text pr-1">: </span>

          <span
            v-for="(contractor, c) in route.contractors"
            :id="contractor.uid"
            :key="contractor.uid"
            :ref="`routeContractor_${contractor.uid}`"
            :class="[
              'content-contractors | caption mr-1',
              { editing: editing },
            ]"
            :draggable="editing"
            @dragstart="
              handleDragContractor($event, contractor.uid, true, route.id)
            "
            @dragend="
              handleDragContractor($event, contractor.uid, false, route.id)
            "
          >
            <v-menu
              v-model="showUserContractor"
              bottom
              offset-y
              :nudge-width="500"
              :close-on-content-click="false"
              max-width="400"
              min-width="400"
              open-delay="600"
              :open-on-click="isAdmin && !editing"
              :open-on-hover="isAdmin && !editing"
              @input="userInfoSelected = contractor.uid"
            >
              <!-- eslint-disable-next-line -->
              <template v-slot:activator="{ on, attrs }">
                <span
                  :class="[
                    `${
                      Object.entries(route.assignedTo)?.length !== 0 &&
                      route.assignedTo.uid === contractor.uid
                        ? 'text_stops--text'
                        : ''
                    }`,
                    `${!editing ? 'container-user' : ''}`,
                  ]"
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ contractor.fullName
                  }}{{ c !== route.contractors.length - 1 ? ',' : '.' }}
                </span>
              </template>

              <user-info
                v-if="showUserContractor && contractor.uid === userInfoSelected"
                :user-uid="contractor.uid"
              ></user-info>
            </v-menu>
          </span>
        </div>

        <route-summary :route-summary="routeSummaryFormatted"></route-summary>

        <v-btn
          v-if="!isStopsDrawer && editing"
          class="depressed elevation-0 mt-3"
          color="primary"
          x-small
          @click="handleAddOrder"
        >
          <span
            ><v-icon x-small>mdi-plus-circle-outline</v-icon>
            {{ $t('addOrders') }}
          </span>
        </v-btn>
      </div>

      <div class="container-stops flex-grow-1">
        <div v-for="(type, t) in typeStops" :key="t">
          <span
            v-if="type === 'stopsCompleted' && stopsFormatted[type]?.length"
            class="text-subtitle-2 success--text"
            >Completed</span
          >

          <div
            v-for="(stop, i) in stopsFormatted[type]"
            :id="i"
            :key="i"
            :ref="`routeStop_${route.id}`"
          >
            <distance-times
              v-if="
                distanceTimes?.length && distanceTimes[i]?.stopNum === stop.num
              "
              :distance-times="distanceTimes[i]"
            ></distance-times>

            <div
              :class="[
                'content-stop | mb-4 pa-2',
                {
                  editing:
                    editing && !stopsFormatted.stopsCompleted.includes(stop),
                },
              ]"
              :draggable="
                editing && !stopsFormatted.stopsCompleted.includes(stop)
              "
              @dragstart="handleDrag($event, stop, i, true, route.id)"
              @dragend="handleDrag($event, stop, i, false, route.id)"
              @mousedown="handleStopCompleted(stop)"
            >
              <stop-content
                :stop="stop"
                :editing="editing"
                :is-stops-drawer="isStopsDrawer"
                :is-supervisor="isSupervisor"
                :is-stop-completed="
                  stopsFormatted.stopsCompleted.includes(stop)
                "
                :is-history="isHistory"
                :route-id="route.id"
                @handle-delete-stop="handleDeleteStop($event)"
                @handle-delete-order="handleDeleteOrder($event)"
              ></stop-content>
            </div>
          </div>
        </div>
      </div>

      <div class="container-more-info">
        <reports-routes-updates
          :route="route"
          :is-history="isHistory"
        ></reports-routes-updates>
        <more-info
          :route="route"
          :editing="editing"
          :google="google"
          @update-origin="handleSaveOriginAddress($event)"
        ></more-info>
      </div>
    </v-card>

    <assignRouteModal
      :show="showSelectContractor"
      :contractors="route.contractors"
      :route-lead="route.assignedTo"
      :route-id="route.id"
      @update-contractors="handleContractors($event)"
      @close="showSelectContractor = !showSelectContractor"
    ></assignRouteModal>
    <orders-view
      v-if="route && route.orders && !route.orders.includes(undefined)"
      :show="showOrdersView"
      :base-orders="ordersOnRoutes"
      @send="handleAddOrderToBaseOrders"
      @close="showOrdersView = false"
    />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import LeadLocation from '../routesToolbar/routesDrawerItem/LeadLocation.vue'
import RouteSummary from '../routesSummary/RouteSummary.vue'
import Supervisors from './Supervisors.vue'
import AssignRouteModal from './AssignRouteModal.vue'
import HeaderRoute from './HeaderRoute.vue'
import ReportsRoutesUpdates from './ReportsRoutesUpdates.vue'
import StopContent from './StopContent.vue'
import DistanceTimes from './DistanceTimes.vue'
import MoreInfo from './MoreInfo.vue'
import ordersView from '~/components/orders/ordersView.vue'
import UserInfo from '~/components/user/UserInfo.vue'
import { ROL_TYPES, ORDER_STATUS } from '@/utils/dictionaries'

export default {
  name: 'EditRoute',
  components: {
    AssignRouteModal,
    ordersView,
    MoreInfo,
    ReportsRoutesUpdates,
    HeaderRoute,
    StopContent,
    DistanceTimes,
    UserInfo,
    LeadLocation,
    RouteSummary,
    Supervisors,
  },
  props: {
    inModal: { type: Boolean, default: false },
    editRoute: { type: Object, default: () => ({}) },
    google: { type: [Object, Boolean], default: () => ({}) },
    num: { type: Number, default: 0 },
    putBackOption: { type: Boolean, default: false },
    getInfo: { type: Boolean, default: false },
    selectOrigin: { type: Boolean, default: false },
    ordersOnRoutes: { type: Array, default: () => [] },
    isDash: { type: Boolean, default: false },
    editing: { type: Boolean, default: true },
    isStopsDrawer: { type: Boolean, default: false },
    isHistory: { type: Boolean, default: false },
  },
  data() {
    return {
      addingOOSSupervisor: false,
      loading: false,
      orderToView: {},
      showOrderView: false,
      ordersInRoute: [],
      distanceTimes: [],
      showSelectContractor: false,
      showOrdersView: false,
      allStops: [],
      route: {},
      ordersInOtherRoutes: [],
      assignedToUid: null,
      showUserContractor: null,
      userInfoSelected: '',
      expanded: false,
      ORDER_STATUS: null,
      ROL_TYPES: null,
    }
  },
  computed: {
    typeStops() {
      return !this.editing ? ['stopsToComplete', 'stopsCompleted'] : ['stops']
    },
    homeLocation() {
      return this.$store.state.config.homeLocation
    },
    user() {
      return this.$store.state.auth.user.profile
    },
    userClaims() {
      return this.$store.state.auth.user.userCredential.claims
    },
    isAdmin() {
      if (!this.userClaims) return false
      return (
        this.userClaims.rol === ROL_TYPES.admin && this.userClaims.authLevel > 6
      )
    },
    isSupervisor() {
      return this.route.oosSupervisors
        ?.map((s) => s.uid)
        .includes(this.user.uid)
    },
    stopsFormatted() {
      if (!this.route || !this.route.orders) {
        return []
      }
      if (
        this.route.orders.some((e) => {
          return e == null
        })
      ) {
        return []
      }
      const stops = JSON.parse(JSON.stringify(this.route.stops))
      stops.map((stop) => {
        stop.orders = stop.orders.map((orderId) => {
          const order = this.route.ordersR?.[orderId]
          if (!order) return orderId

          const workToDos = Object.entries(order?.workToDos || {}).map(
            ([key, value]) => {
              return {
                ...value,
                id: key,
              }
            }
          )

          const inspections = Object.entries(order?.inspections || {}).map(
            ([key, value]) => {
              return {
                ...value,
                id: key,
              }
            }
          )
          const allowables = Object.entries(order?.allowables || {}).map(
            ([key, value]) => {
              return {
                ...value,
                id: key,
              }
            }
          )

          return {
            status: order?.status || '',
            woNumber: order?.woNumber || '',
            id: orderId || '',
            isReopen: order?.isReopen || false,
            dateDueStr: order?.dateDueStr || '',
            workToDos: workToDos || [],
            inspections: inspections || [],
            allowables: allowables || [],
          }
        })
        return stop
      })

      const stopsCompleted = stops.filter((stop) => {
        return stop.orders.every(
          (order) =>
            order.status?.trim().toLowerCase() ===
            ORDER_STATUS.readyForOffice.toLowerCase()
        )
      })
      const stopsToComplete = stops.filter((stop) => {
        return stop.orders.some(
          (order) =>
            order.status?.trim().toLowerCase() !==
            ORDER_STATUS.readyForOffice.toLowerCase()
        )
      })

      return { stops, stopsToComplete, stopsCompleted }
    },
    selectOrder() {
      return this.$store.state.oos.routes.selectOrder
    },
    statusesOrders() {
      return this.$store.state.oos.orders.statusOrders
    },
    routeSummaryFormatted() {
      let reopen = 0
      let ordersLength = 0
      let RFO = 0
      let incomplete = 0
      const dateToday = new Date()
      const dateActual = this.$formatDate(dateToday, { iso: true })
      let dueTodayOpen = 0
      let pastDueOpen = 0
      let dueTodayOpenCompleted = 0
      let pastDueOpenCompleted = 0
      let dueTomorrow = 0
      let dueTomorrowCompleted = 0
      let partiallyComplete = 0
      const dateTomorrow = this.$formatDate(
        new Date(dateToday.getTime() + 24 * 60 * 60 * 1000),
        { iso: true }
      )
      const validateCompleted = (status) => {
        if (!status) return false
        const _status = status.trim().toLowerCase()
        return (
          _status === ORDER_STATUS.readyForOffice.toLowerCase() ||
          _status === ORDER_STATUS.invoiced.toLowerCase() ||
          _status === ORDER_STATUS.closed.toLowerCase()
        )
      }

      if (this.route.ordersR) {
        const orderResumenList = Object.entries(this.route.ordersR).map(
          ([key, value]) => {
            return {
              ...value,
              id: key,
            }
          }
        )

        ordersLength = orderResumenList.length

        orderResumenList.forEach((order) => {
          if (order.isReopen) {
            reopen++
          }
          if (validateCompleted(order.status)) {
            RFO++
          }
          if (
            order.status?.toLowerCase() ===
              ORDER_STATUS.inactive.toLowerCase() ||
            order.status?.toLowerCase() === 'idle'
          ) {
            incomplete++
          }
          if (order.status?.toLowerCase() === 'partially complete') {
            partiallyComplete++
          }
          if (order.dateDueStr === dateActual) {
            dueTodayOpen++
            if (validateCompleted(order.status)) {
              dueTodayOpenCompleted++
            }
          }
          if (Date.parse(order.dateDueStr) < Date.parse(dateActual)) {
            pastDueOpen++
            if (validateCompleted(order.status)) {
              pastDueOpenCompleted++
            }
          }
          if (order.dateDueStr === dateTomorrow) {
            dueTomorrow++
            if (validateCompleted(order.status)) {
              dueTomorrowCompleted++
            }
          }
        })
      }
      return {
        WO: ordersLength,
        reopen,
        RFO,
        incomplete,
        dueTodayOpen,
        pastDueOpen,
        dueTodayOpenCompleted,
        pastDueOpenCompleted,
        dueTomorrow,
        dueTomorrowCompleted,
        partiallyComplete,
      }
    },
  },
  watch: {
    stopsFormatted: {
      handler(newVal, oldVal) {
        // this.getDistanceTime(newVal.stops)
      },
      deep: true,
      inmediate: true,
    },
    editRoute: {
      handler() {
        this.route = this.editing
          ? JSON.parse(JSON.stringify(this.editRoute))
          : this.editRoute
      },
      deep: true,
    },
    editing(val) {
      if (val) {
        this.route = JSON.parse(JSON.stringify(this.editRoute))
      }
    },
    selectOrder(newVal) {
      this.$store.commit('oos/orders/hide_notification_order_by_id', newVal)
    },
  },
  mounted() {
    this.route = this.editing
      ? JSON.parse(JSON.stringify(this.editRoute))
      : this.editRoute
  },
  methods: {
    ...mapMutations('routes', {
      updateRoute: 'update_route',
    }),

    handleSaveOriginAddress(origin) {
      this.$emit('update-origin', origin)
    },
    getDistanceTime(stops) {
      if (!stops || (stops && !stops.length) || !this.google) {
        return
      }
      stops.forEach((stop, i) => {
        if (!stop) {
          return
        }

        let originAddress = this.route.originAddress
        if (i > 0) {
          originAddress = stops[i - 1].address
        }
        const destinationAddress = stop.address
        const service = new this.google.maps.DistanceMatrixService()

        service.getDistanceMatrix(
          {
            origins: [originAddress],
            destinations: [destinationAddress],
            travelMode: 'DRIVING',
            unitSystem: this.google.maps.UnitSystem.IMPERIAL,
          },
          (response, status) => {
            if (!response) {
              return
            }
            this.distanceTimes.splice(i, 1, {
              distance: response.rows[0].elements[0].distance?.text || 'N/A',
              duration: response.rows[0].elements[0].duration?.text || 'N/A',
              stopNum: stop.num,
            })
          }
        )
      })
    },
    handleDrop(e) {
      const data = e.dataTransfer.getData('text/plain')
      if (!data) return

      const { type } = JSON.parse(data)
      e.preventDefault()
      const route = this.route
      const afterElement = this.getDrafAfterElement(route.id, e.clientY, type)
      this.$emit('drop', { e, afterElement, type })
    },
    getDrafAfterElement(routeId, y, type) {
      let ordersDivs = null
      if (type === 'stop') {
        ordersDivs = this.$refs[`routeStop_${routeId}`]
      }
      if (type === 'contractor') {
        ordersDivs = this.$refs[`routeContractor_${routeId}`]
      }
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
      } catch (error) {
        // eslint-disable-next-line
        console.log('error', error)
        this.$mainAlertError(this.$t('oopsProblem'))
      } finally {
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
    handleStopCompleted(stop) {
      if (this.stopsFormatted.stopsCompleted.includes(stop) && this.editing) {
        this.$mainAlertInfo('This stop is completed, can not move.')
      }
    },

    handleDrag(e, stop, i, start, routeId) {
      const el = e.target

      if (start) {
        const objData = {
          stop,
          index: i,
          type: 'stop',
          originRouteId: routeId,
        }
        e.dataTransfer.setData('text/plain', JSON.stringify(objData))
        el.classList.add('dragging')
      } else {
        el.classList.remove('dragging')
      }
    },
    handleDragContractor(e, uid, start, routeId) {
      const el = e.target

      if (start) {
        const objData = {
          uid,
          type: 'contractor',
          originRouteId: routeId,
        }
        e.dataTransfer.setData('text/plain', JSON.stringify(objData))
        el.classList.add('dragging')
      } else {
        el.classList.remove('dragging')
      }
    },
    handleAddOrder() {
      this.showOrdersView = true
      this.ordersInOtherRoutes = this.ordersOnRoutes.filter((e) => {
        return !this.editRoute.orders.map((i) => i.id).includes(e.id)
      })
    },
    handleAddOrderToBaseOrders(orders) {
      let _orders = JSON.parse(JSON.stringify(orders))
      _orders = _orders.filter((e) => {
        return !this.ordersInOtherRoutes.map((i) => i.id).includes(e.id)
      })
      const idOrdersInRoute = this.route.orders.map((o) => o.id)
      const newOrders = _orders.filter(
        (order) => !idOrdersInRoute.includes(order.id)
      )
      const _route = JSON.parse(JSON.stringify(this.route))
      _route.orders = [..._route.orders, ...newOrders]
      _route.stops = this.getStops(_route.orders)
      _route.orders = _route.orders.map((o) => o.id)
      _route.contractors = _route.contractors.map((c) => c.uid)
      _route.oosSupervisors = _route.oosSupervisors.map((c) => c.uid)
      this.$emit('update_orders', newOrders)
      this.$emit('update_route', _route)
      this.showOrdersView = false
    },
    getStops(orders) {
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

      if (!this.route.stops || !this.route.stops.length) {
        return stops
      }
      const orderedStops = []
      this.route.stops.forEach((routeStop, i) => {
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
    handleContractors({ lead, contractors }) {
      this.$emit('update_contractors', {
        lead,
        contractors,
        routeId: this.route.id,
      })
      contractors.forEach((contractor) => {
        this.$store.commit('users/add_user', contractor)
      })
      const newGroupName = `${lead.name}'s Crew`
      this.$emit('update-group-name', newGroupName)
    },
    handleDeleteOrder(orderId) {
      const indexOfOrder = this.route.orders.map((o) => o.id).indexOf(orderId)
      if (indexOfOrder === -1) {
        return
      }
      this.route.orders.splice(indexOfOrder, 1)
      const _route = JSON.parse(JSON.stringify(this.route))
      _route.stops = this.getStops(_route.orders)
      _route.orders = _route.orders.map((o) => o.id)
      _route.contractors = _route.contractors.map((c) => c.uid || c)
      _route.oosSupervisors = _route.oosSupervisors.map((o) => o.uid || o)
      this.$emit('update_route', _route)
      this.$emit('delete_order', orderId)
    },
    handleDeleteStop(stop) {
      for (let i = 0; i < stop.orders.length; i++) {
        this.handleDeleteOrder(stop.orders[i].id)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.container-route {
  flex: 0 0 400px;
  border-radius: 0.5rem;
  position: relative;
  &.route-border {
    border: 1px solid var(--v-secondary-base);
  }
}
.container-stops {
  padding: 16px 16px 115px;
  overflow-y: scroll;
}
.container-stops::-webkit-scrollbar {
  display: none;
}
.content-stop {
  border-radius: 5px;
  font-size: 0.8rem;
  background-color: var(--v-background_stops-base);
  &.editing {
    cursor: move;
  }
}
.content-contractors {
  &.editing {
    cursor: move;
  }
}
.close-route {
  display: none;
}
.route {
  position: relative;
}
.close-box {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}
.route:hover {
  .close-route {
    display: block;
  }
}
.container-user {
  cursor: pointer;
}
.container-more-info {
  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;
}
</style>
