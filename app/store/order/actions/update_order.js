import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_order({ rootState }, { orderId, objectToSend }) {
  const docRef = doc(db, 'orders', orderId)
  const user = rootState.auth.user.profile

  await updateDoc(docRef, {
    ...objectToSend,
    updatedBy: user,
    updatedAt: serverTimestamp(),
  })
  return 'Order Updated'
}
