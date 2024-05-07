import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function handleOrderStatus({ rootState }, { orderId, status }) {
  const orderRef = doc(collection(db, `orders`), orderId)
  let objectToSend = {}
  const userProfile = rootState.auth.user.profile

  objectToSend = {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: userProfile,
  }

  await updateDoc(orderRef, objectToSend)
}
