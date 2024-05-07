export default {
  set_allOrders(state, orders) {
    state.allOrders = orders
  },
  add_allOrder(state, order) {
    const _order = {
      ...state.dummyOrder,
      ...order,
    }
    state.allOrders.push(_order)
  },
  set_search(state, search) {
    state.search = search
  },
  set_ordersSelected(state, ordersSelected) {
    state.ordersSelected = ordersSelected
  },

  set_listUrl(state, listUrl) {
    state.listUrl = listUrl
  },
  update_allOrder(state, order) {
    const indexToUpdate = state.allOrders.map((o) => o.id).indexOf(order.id)
    if (indexToUpdate > -1) {
      state.allOrders.splice(indexToUpdate, 1, order)
    }
  },
  remove_allOrder(state, id) {
    const indexToRemove = state.allOrders.map((o) => o.id).indexOf(id)
    if (indexToRemove > -1) {
      state.allOrders.splice(indexToRemove, 1)
    }
  },
  add_ordersFilters(state, ordersFilters) {
    state.ordersFilters = ordersFilters
  },
  add_orderProperties(state, payload) {
    state.orderProperties = payload
  },
  add_allOrders_listener(state, payload) {
    state.allOrdersListeners.push(payload)
  },
  remove_allOrders_listeners(state) {
    state.allOrdersListeners.forEach((unsubscribe) => {
      unsubscribe()
    })
    state.allOrdersListeners = []
  },
}
