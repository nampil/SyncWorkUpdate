export default {
  set_dummyRoute(state, payload) {
    const _dummyRoute = {
      ...state.dummyRoute,
      ...payload,
    }
    state.dummyRoute = _dummyRoute
  },
  set_routes(state, payload) {
    state.routes = payload
  },
  add_route(state, route) {
    state.routes.push({
      ...route,
      rowFiles: route.rowFiles || [],
    })
  },
  update_route(state, payload) {
    const _route = state.routes.filter((r) => r.id === payload.id)[0]
    const objectUpdated = { ..._route, ...payload }
    const index = state.routes.map((r) => r.id).indexOf(payload.id)

    state.routes.splice(index, 1, {
      ...objectUpdated,
    })
  },
  remove_route(state, routeId) {
    const index = state.routes.map((r) => r.id).indexOf(routeId)
    state.routes.splice(index, 1)
  },

  add_order_to_route(state, { routeId, orderId }) {
    const routeIndex = state.routes.map((r) => r.id).indexOf(routeId)
    if (routeIndex > -1) {
      state.routes[routeIndex].orders.push(orderId)
    }
  },
  update_order_in_route(state, { routeId, orderUpdated }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)
    const indexOfOrderInRoute = state.routes[indexOfRoute].orders.indexOf(
      orderUpdated.id
    )
    if (indexOfOrderInRoute > -1) {
      state.routes[indexOfRoute].orders.splice(
        indexOfOrderInRoute,
        1,
        orderUpdated
      )
    }
  },
  insert_order_to_route(state, { routeId, afterOrderId, orderId }) {
    const routeIndex = state.routes.map((r) => r.id).indexOf(routeId)
    const indexToInsert = state.routes[routeIndex].orders.indexOf(afterOrderId)
    if (routeIndex > -1 && indexToInsert > -1) {
      state.routes[routeIndex].orders.splice(indexToInsert, 0, orderId)
    }
  },
  remove_order_from_route(state, { routeId, orderId }) {
    const routeIndex = state.routes.map((r) => r.id).indexOf(routeId)
    const indexToRemove = state.routes[routeIndex].orders.indexOf(orderId)
    if (routeIndex > -1 && indexToRemove > -1) {
      state.routes[routeIndex].orders.splice(indexToRemove, 1)
    }
  },
  update_stopsInroute(state, { stops, routeId }) {
    const routeIndex = state.routes.map((r) => r.id).indexOf(routeId)
    if (routeIndex === -1) {
      return
    }
    state.routes[routeIndex].stops = stops
  },

  add_listener(state, listener) {
    state.listeners.push(listener)
  },
  detach_listeners(state) {
    // eslint-disable-next-line
    console.log('detach listener')

    state.listeners.forEach((unsuscribe) => {
      unsuscribe()
    })
  },

  add_baseOrder(state, orders) {
    state.baseOrders.push(...orders)
  },
  update_baseOrder(state, { orderId, objectToUpdate }) {
    const index = state.baseOrders.map((o) => o.id).indexOf(orderId)

    if (index === -1) return
    state.baseOrders.splice(index, 1, {
      ...state.baseOrders[index],
      ...objectToUpdate,
    })
  },
  remove_baseOrder(state, order) {
    const index = state.baseOrders.map((o) => o.id).indexOf(order.id)

    if (index === -1) return
    state.baseOrders.splice(index, 1)
  },
  set_forDateStr(state, { forDateStr }) {
    state.forDateStr = forDateStr
  },

  add_marker(state, marker) {
    state.markers.push(marker)
  },
  update_marker(state, { id, objectToUpdate }) {
    const idx = state.markers.findIndex((mar) => mar.id === id)

    if (idx === -1) return
    state.markers.splice(idx, 1, {
      ...state.markers[idx],
      ...objectToUpdate,
    })
  },

  remove_marker(state, { id }) {
    const idx = state.markers.findIndex((mar) => mar.id === id)

    if (idx === -1) return
    state.markers.splice(idx, 1)
  },

  set_map(state, map) {
    state.map = map
  },
  set_orderSelected(state, order) {
    state.orderSelected = order
  },
  set_google(state, { google }) {
    state.google = google
  },

  set_loadingRoutes(state, payload) {
    state.loadingRoutes = payload
  },
  set_savingRoutes(state, payload) {
    state.savingRoutes = payload
  },
  set_filter(state, { filter }) {
    state.filter = filter
  },
  set_showRouteInMap(state, showRouteInMap) {
    state.showRouteInMap = showRouteInMap
  },
  set_routeSelected(state, routeId) {
    state.routeSelected = routeId
  },

  flush_state(state) {
    state.routes = []
    state.baseRoutes = []
    state.markers = []
    state.map = null
  },
}

// routes: [],
//   baseOrders: [],
//   forDateStr: '',
//   markers: [],
//   map: null,
//   orderSelected: null,
//   listeners: [],
//   google: null,
//   savingRoutes: false,
//   dummyRoute: {
//     active: true,
//     originLocation: { lat: 40.755664200841004, lng: -74.149279748704 },
//     originAddress: '65 Davis Avenue, Kearny, NJ, USA',
//     forDateStr: '',
//     stops: [
//       // {num: 0, orders: [], address: ''}
//     ],
//     orders: [],
//     assignedTo: {},
//     contractors: [],
//     instructions: '',
//     files: [],
//     rowFiles: [],
//     groupName: null,
//     createdAt: null,
//     updatedAt: null,
//     oosSupervisors: [],
//     notification: false,
//   },
