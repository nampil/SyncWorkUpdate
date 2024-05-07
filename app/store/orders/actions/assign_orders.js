import { httpsCallable } from 'firebase/functions'
import { functions } from '~/plugins/firebase'

export function assign_orders(_, { contractors, orders }) {
  const assignOrder = httpsCallable(functions, 'assignOrder')
  const usersIds = contractors.map((c) => c.uid)
  const promises = []

  orders.forEach((order) => {
    const response = assignOrder({
      orderId: order.id,
      usersIds,
    })
    promises.push(response)
  })
  return Promise.all(promises)
}
