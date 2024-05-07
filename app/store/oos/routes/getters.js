export default {
  routesFormatted:
    (state, _, rootState) =>
    ({ localRoutes, localOrders, supervisedRoutes }) => {
      let baseRoutes = localRoutes || state.routes
      const baseOrders = localOrders || rootState.oos.orders.orders

      if (supervisedRoutes) {
        const user = rootState.auth.user.profile
        const _routes = []
        baseRoutes.forEach((route) => {
          if (route.oosSupervisors.includes(user.uid)) {
            _routes.push(route)
          }
        })
        baseRoutes = _routes
      }
      const routes = []
      baseRoutes.forEach((route) => {
        const orders = []
        const _orders = route.orders
        const finalOrders = baseOrders.filter((order) => {
          return _orders.includes(order.id)
        })
        orders.push(...finalOrders)

        const usersProfiles = rootState.users.users
        const contractors = usersProfiles.filter((c) =>
          route.contractors.includes(c.uid)
        )

        const oosSupervisors = route.oosSupervisors?.map((uid) => {
          const profile = usersProfiles.find((u) => u.uid === uid)
          if (!profile) return uid

          return profile
        })

        routes.push({
          ...route,
          // orders,
          contractors,
          oosSupervisors,
        })
      })

      const routesBaseBd = routes
        .filter((r) => r.createdAt)
        .sort((a, b) => {
          const aCreatedAt = new Date(a.createdAt.seconds * 1000)
          const bCreatedAt = new Date(b.createdAt.seconds * 1000)
          return aCreatedAt > bCreatedAt ? 1 : -1
        })
      const routesNew = routes.filter((r) => !r.createdAt)
      return routesBaseBd.concat(routesNew)
    },
  routeSelectedFormatted: (state, getters) => {
    const _routesFormatted = getters.routesFormatted({
      localRoutes: null,
      localOrders: null,
    })
    const routeSelected = _routesFormatted.find(
      (r) => r.id === state.selectRoute
    )
    return routeSelected
  },
}
