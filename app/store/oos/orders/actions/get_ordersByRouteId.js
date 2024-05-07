import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export function get_ordersByRouteId(
  { state, commit, dispatch, rootState },
  { orders, routeId }
) {
  if (!orders || !orders.length) throw new Error('orders is required')

  if (!routeId) throw new Error('routeId is required')

  const user = auth.currentUser
  if (!user) {
    throw new Error('User is not logged in')
  }
  const route = rootState.oos.routes.routes.find((r) => r.id === routeId)
  if (!route) {
    return
  }
  // const userIsOosSupervisor = route.oosSupervisors?.includes(user.uid)
  // hacer un flush del la lista de ordenes en la ruta y de sus listener
  // commit('oos/routes/flush_orders_in_route', { routeId }, { root: true })

  const chuckSize = 30
  const chunks = []
  const listeners = []
  for (let i = 0; i < orders.length; i += chuckSize) {
    chunks.push(orders.slice(i, i + chuckSize))
  }

  for (let i = 0; i < chunks.length; i++) {
    const _orders = chunks[i]

    if (
      _orders.some((o) =>
        route?.ordersListeners?.some((l) => l.orderIds.includes(o))
      )
    ) {
      continue
    }

    const q = query(
      collection(db, 'orders'),
      where('id', 'in', _orders /* [1, 2, 3, 4] */)
    )
    const listener = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const order = {
          ...doc.data(),
          notifications: [],
          id: doc.id,
        }

        commit('set_order', { order })

        // if (userIsOosSupervisor) {
        // dispatch('get_JobTasks', { orderId: order.id })
        // }
      })
    })
    listeners.push({ orderIds: _orders, listener })
  }

  commit(
    'oos/routes/add_order_listener_to_route',
    {
      routeId,
      listeners,
    },
    { root: true }
  )
}
