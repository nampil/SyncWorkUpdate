export default {
  set_orders(state, orders) {
    state.orders = orders
  },

  add_order(state, order) {
    const _order = {
      ...state.dummyOrder,
      ...order,
    }
    state.orders.push(_order)
  },

  update_order(state, order) {
    const indexToUpdate = state.orders.map((o) => o.id).indexOf(order.id)
    if (indexToUpdate > -1) {
      state.orders.splice(indexToUpdate, 1, order)
    }
  },

  remove_order(state, id) {
    const indexToRemove = state.orders.map((o) => o.id).indexOf(id)
    if (indexToRemove > -1) {
      state.orders.splice(indexToRemove, 1)
    }
  },

  add_orders_listener(state, payload) {
    state.listeners.push(payload)
  },
  remove_orders_listeners(state) {
    state.listeners.forEach((unsubscribe) => {
      unsubscribe()
    })
    state.listeners = []
  },

  set_addNewOrderModal(state, payload) {
    state.addNewOrderModal = payload
  },
  set_totalEntries(state, payload) {
    state.totalEntries = payload
  },
  set_orderNew(state, payload) {
    state.orderNew = payload
  },
  set_onHold(state, payload) {
    state.onHold = payload
  },
  set_assigned(state, payload) {
    state.assigned = payload
  },
  set_unassigned(state, payload) {
    state.unassigned = payload
  },
  set_edited(state, payload) {
    state.edited = payload
  },

  // set_archived(state, payload) {
  //   state.archived = payload
  // },

  flush_state(state) {
    state.orders = []
    state.ordersSelected = []

    state.addNewOrderModal = false
    state.totalEntries = true
    state.orderNew = false
    state.onHold = false
    state.assigned = false
    state.unassigned = false
    state.edited = false
    state.listeners.forEach((unsubscribe) => {
      unsubscribe()
    })
    state.listeners = []
  },
}
