export default {
  set_loadingRoutes(state, payload) {
    state.loadingRoutes = payload
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
    const index = state.routes.map((r) => r.id).indexOf(payload.id)
    if (index === -1) {
      return
    }

    state.routes.splice(index, 1, {
      ...payload,
    })
  },
  remove_route(state, routeId) {
    const index = state.routes.map((r) => r.id).indexOf(routeId)

    if (index === -1) {
      return
    }
    state.routes.splice(index, 1)
  },
  update_ect(state, { routeId, orderId, taskId, taskType, objectToSend }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)

    if (indexOfRoute === -1) {
      return
    }
    const route = state.routes[indexOfRoute]

    const routeToUpdate = JSON.parse(JSON.stringify(route))
    const task = routeToUpdate.ordersR?.[orderId]?.[taskType]?.[taskId]
    if (!task) {
      return
    }
    task.etc = objectToSend

    state.routes.splice(indexOfRoute, 1, routeToUpdate)
  },

  set_orderStatus_on_route(state, { routeId, orderId, status }) {
    // eslint-disable-next-line
    console.log('set_orderStatus_on_route', routeId, orderId, status)
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)

    if (indexOfRoute === -1) {
      return
    }
    const route = state.routes[indexOfRoute]

    const routeToUpdate = JSON.parse(JSON.stringify(route))

    const order = routeToUpdate.ordersR?.[orderId]
    if (!order) {
      return
    }
    order.status = status
    state.routes.splice(indexOfRoute, 1, routeToUpdate)
  },

  add_listener(state, listener) {
    state.listeners.push(listener)
  },
  set_order_in_route(state, { order, routeId }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)
    const indexOfOrder = state.routes[indexOfRoute].orders
      .map((o) => {
        if (typeof o !== 'string') {
          return o.id
        }
        return o
      })
      .indexOf(order.id)
    state.routes[indexOfRoute].orders.splice(indexOfOrder, 1, order)
  },
  set_orderStatusInRoute(state, { orderId, routeId, status }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)
    const ordersR = state.routes[indexOfRoute].ordersR
    if (!ordersR) return
    state.routes[indexOfRoute].ordersR[orderId].status = status
  },
  add_order_listener_to_route(state, { routeId, listeners }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)
    state.routes[indexOfRoute].orderListeners.push(...listeners)
  },
  flush_orders_in_route(state, { routeId }) {
    const indexOfRoute = state.routes.map((r) => r.id).indexOf(routeId)
    const orders = state.routes[indexOfRoute].orders.map((order) => {
      if (typeof order !== 'string') {
        return order.id
      }
      return order
    })
    state.routes[indexOfRoute].orders = orders
    if (state.routes[indexOfRoute].orderListeners.length) {
      state.routes[indexOfRoute].orderListeners.forEach((l) => l.listener())
      state.routes[indexOfRoute].orderListeners = []
    }
  },

  set_routeDrawer(state, payload) {
    state.oosDrawer = payload
  },
  set_routeDrawerOrder(state, payload) {
    state.oosDrawerOrder = payload
  },
  set_selectStop(state, payload) {
    state.selectStop = payload
  },
  set_selectRoute(state, payload) {
    state.selectRoute = payload
  },
  set_selectOrder(state, payload) {
    state.selectOrder = payload
  },
  set_showLoadingDownload(state, payload) {
    state.showLoadingDownload = payload
  },
  /* Notidicaciones de rutas */
  hide_notification_route_by_id(state, routeId) {
    const indexOfOrder = state.routes.map((o) => o.id).indexOf(routeId)
    if (indexOfOrder > -1) {
      state.routes[indexOfOrder].notification = false
    }
  },
  show_notification_route_by_id(state, { routeId, selectedRouteId }) {
    const indexOfOrder = state.routes.map((o) => o.id).indexOf(routeId)
    if (indexOfOrder > -1) {
      const notification =
        this.$router.currentRoute.fullPath !== '/cdp' ||
        selectedRouteId !== routeId
      state.routes[indexOfOrder].notification = notification
      if (notification) {
        state.playNotificationRoute = true
      }
    }
  },
  update_playNotificationRoute(state, payload) {
    state.playNotificationRoute = payload
  },

  add_routeUpdate(state, { routeId, update }) {
    if (!state.routesUpdates[routeId]) {
      state.routesUpdates[routeId] = []
    }
    state.routesUpdates[routeId].push(update)
    state.routesUpdates[routeId].sort((a, b) => {
      const aUpdatedAt = new Date(a.updatedAt.seconds * 1000)
      const bUpdatedAt = new Date(b.updatedAt.seconds * 1000)
      return aUpdatedAt > bUpdatedAt ? -1 : 1
    })
  },
  update_routeUpdate(state, { routeId, update }) {
    const routesUpdates = {
      ...state.routesUpdates,
    }
    const idx = routesUpdates[routeId].findIndex((u) => u.id === update.id)
    if (idx === -1) {
      return
    }

    routesUpdates[routeId].splice(idx, 1, update)

    state.routesUpdates = routesUpdates
  },
  remove_routeUpdate(state, { routeId, update }) {
    const idx = state.routesUpdates[routeId].findIndex(
      (u) => u.id === update.id
    )
    if (idx === -1) {
      return
    }
    state.routesUpdates[routeId].splice(idx, 1)
  },

  add_routeUpdates_listener(state, { routeId, unsubscribe }) {
    const idx = state.routesUpdatesListeners.findIndex(
      (rul) => rul.routeId === routeId
    )
    const update = {
      routeId,
      unsubscribe,
    }

    if (idx > -1) {
      state.routesUpdatesListeners[idx].unsubscribe()
      state.routesUpdatesListeners.splice(idx, 1)
      return
    }
    state.routesUpdatesListeners.push(update)
  },
  flush_routesUpdates(state, { routeId }) {
    const idx = state.routesUpdatesListeners.findIndex(
      (rul) => rul.routeId === routeId
    )
    if (idx > -1) {
      state.routesUpdatesListeners[idx].unsubscribe()
      state.routesUpdatesListeners.splice(idx, 1)
    }
  },

  flush_state(state) {
    for (let i = 0; i < state.listeners.length; i++) {
      const listener = state.listeners[i]
      listener()
    }
    for (let i = 0; i < state.routes.length; i++) {
      const route = state.routes[i]
      route.orderListeners.forEach((l) => {
        l.listener()
      })
    }
    state.routes = []
    state.routesUpdates = {}
  },
}
