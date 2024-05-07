import { collection, getCountFromServer, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reportsCount({ commit }, { orderId, type, taskId }) {
  const reportsRef = collection(
    db,
    `orders/${orderId}/${type}/${taskId}/reports`
  )

  const q = query(reportsRef)
  const snapshot = await getCountFromServer(q)

  return snapshot.data().count
}
