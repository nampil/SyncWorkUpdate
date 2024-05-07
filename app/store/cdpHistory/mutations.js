export default {
  add_history(state, { routes }) {
    state.history = routes
  },

  add_routeUpdates(state, { routeId, routesUpdates }) {
    const indexOfRoute = state.history.map((r) => r.id).indexOf(routeId)

    if (!indexOfRoute === -1) return
    state.history.splice(indexOfRoute, 1, {
      ...state.history[indexOfRoute],
      routesUpdates,
    })
  },

  clear_history(state) {
    state.history = {}
  },
}
