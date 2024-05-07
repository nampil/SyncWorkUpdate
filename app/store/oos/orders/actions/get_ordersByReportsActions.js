import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_ordersByReportsActions(
  { dispatch },
  { numberOrder }
) {
  const q = query(
    collection(db, 'orders'),
    where('woNumber', '==', numberOrder)
  )
  let _order = []
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    const order = {
      ...doc.data(),
      id: doc.id,
    }
    _order.push(order)
  })

  const tasks = await dispatch('getJobTasksForOrderId', {
    orderId: _order[0].id,
  })

  _order = {
    ..._order[0],
    tasks,
  }
  return _order
}
