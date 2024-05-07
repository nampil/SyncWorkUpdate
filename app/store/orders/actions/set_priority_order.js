import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function set_priority_order(
  { rootState },
  { orderIds, priority }
) {
  const batch = writeBatch(db)
  const user = rootState.auth.user.profile
  for (let i = 0; i < orderIds.length; i++) {
    const orderId = orderIds[i]
    const orderRef = doc(db, 'orders', orderId)
    batch.update(orderRef, {
      category: priority,
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
