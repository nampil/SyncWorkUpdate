import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_allowablePoolApproved(
  _,
  { orderId, allowablePoolId, approved }
) {
  const taskRef = doc(db, `orders/${orderId}/allowablesPools`, allowablePoolId)
  await updateDoc(taskRef, { approved })
}
