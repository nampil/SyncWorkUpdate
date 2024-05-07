import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_rating(
  { commit },
  { reqId, taskId, orderId, taskType, contractorUid, processTime }
) {
  const userRatingsRef = collection(db, `users/${contractorUid}/ratings`)
  const queryContrains = []
  queryContrains.push(where('taskId', '==', taskId))
  queryContrains.push(where('taskType', '==', taskType))
  queryContrains.push(where('orderId', '==', orderId))
  queryContrains.push(where('processTime', '==', processTime))

  if (reqId) {
    queryContrains.push(where('reqId', '==', reqId))
  }

  const q = query(userRatingsRef, ...queryContrains)
  const snapshot = await getDocs(q)
  const rating = snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))[0]

  commit('add_rating', rating)
}
