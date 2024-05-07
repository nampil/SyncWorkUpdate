import { httpsCallable } from 'firebase/functions'
import { functions } from '~/plugins/firebase'

export function unassign_orders(_, { contractors, orders }) {
  const unassignOrder = httpsCallable(functions, 'unassignOrder')
  const promises = []

  orders.forEach((order) => {
    const response = unassignOrder({
      orderId: order.id,
      contractors,
    })
    promises.push(response)
  })
  return Promise.all(promises)
}
