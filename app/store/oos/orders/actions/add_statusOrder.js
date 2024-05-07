import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function add_statusOrder({ rootState }, { status, orderId }) {
  if (!orderId || !status) {
    return
  }

  const orderStatusRef = doc(collection(db, `orders/${orderId}/status`))
  const userProfile = rootState.auth.user.profile

  const orderRef = doc(db, `orders/${orderId}`)

  const batch = writeBatch(db)

  batch.update(orderRef, {
    status,
  })

  batch.set(orderStatusRef, {
    title: status,
    createdAt: serverTimestamp(),
    createdBy: userProfile.uid,
  })

  return batch.commit()
}
