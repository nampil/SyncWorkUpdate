import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_ect(
  { commit },
  { routeId, orderId, taskId, taskType, objectToSend }
) {
  const taskRef = doc(collection(db, `orders/${orderId}/${taskType}`), taskId)
  await updateDoc(taskRef, { ect: { ...objectToSend } })
  commit(
    'oos/routes/update_ect',
    { routeId, orderId, taskId, taskType, objectToSend },
    { root: true }
  )
}
