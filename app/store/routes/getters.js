import { ROUTES_FILTER_OPTIONS } from '~/utils/dictionaries'

export default {
  routesFormatted(state) {
    const _routes = []
    const baseOrders = state.baseOrders

    state.routes.forEach((route) => {
      const orders = route.orders.map((id) => {
        const order = baseOrders.filter((o) => o.id === id)[0]
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
  routeSelectedFormatted(state, getters) {
    if (!state.routeSelected) return null
    const routeId = state.routeSelected

    const route = getters.routesFormatted.filter((r) => r.id === routeId)[0]

    return route
  },
  orderList(state) {
    const _orders = []
    const ordersInRoutes = []
    state.routes.forEach((route) => {
      route.orders.forEach((orderId) => {
        const index = state.baseOrders.map((o) => o.id).indexOf(orderId)
        if (index > -1) {
          ordersInRoutes.push(state.baseOrders[index])
        }
      })
    })

    if (state.baseOrders && typeof state.baseOrders === 'object') {
      state.baseOrders.forEach((order) => {
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
  filteredOrderList(state, getters, rooState) {
    if (!state.filter || state.filter === ROUTES_FILTER_OPTIONS.route)
      return getters.orderList

    return getters.orderList.filter((o) => {
      const categoryOptions = rooState.categoryOptions.map((co) => co.title)
      const priority = categoryOptions.includes(o.category)
        ? o.category
        : ROUTES_FILTER_OPTIONS.other

      return priority === state.filter
    })
  },

  markersFiltered(state, getters) {
    if (!state.filter) return state.markers
    if (state.filter === ROUTES_FILTER_OPTIONS.route) {
      if (!getters.routeSelectedFormatted) return []
      // const route = getters.routesFormatted.filter(
      //   (r) => r.id === getters.routeSelectedFormatted.id
      // )[0]
      const routeOrdersId = getters.routeSelectedFormatted.orders.map(
        (o) => o.id
      )
      return state.markers.filter((m) => routeOrdersId.includes(m.id))
    }
    if (state.filter === ROUTES_FILTER_OPTIONS.none) {
      return []
    }

    const orderList = getters.filteredOrderList

    return state.markers.filter((m) => {
      return !m.orderId || orderList.map((o) => o.id).includes(m.orderId)
    })
  },
}
