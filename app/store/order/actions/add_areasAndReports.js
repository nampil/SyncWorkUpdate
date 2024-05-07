import { arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_areasAndReports(_, { areas, orderId, type, taskId }) {
  const _areas = []
  const taskRef = doc(db, `orders/${orderId}/${type}`, taskId)
  for (let i = 0; i < areas.length; i++) {
    _areas.push(areas[i].titleArea)
  }
  await updateDoc(taskRef, {
    areasInReports: arrayUnion(..._areas),
  })
}
