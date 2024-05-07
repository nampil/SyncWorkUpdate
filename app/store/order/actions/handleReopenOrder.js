import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function handleReopenOrder(
  { rootState },
  { orderId, status, isReopen, reopenReason }
) {
  const batch = writeBatch(db)
  const userProfile = rootState.auth.user.profile
  const orderRef = doc(collection(db, `orders`), orderId)
  const reopensRef = doc(collection(db, `orders/${orderId}/reopens`))

  batch.update(orderRef, {
    status,
    isReopen,
  })
  batch.set(reopensRef, {
    reopenReason,
    reopenBy: userProfile,
    reopenAt: serverTimestamp(),
  })
  await batch.commit()
}
