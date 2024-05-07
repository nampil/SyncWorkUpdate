import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_orders(
  { rootState },
  { contractorsUids, orders, contractors }
) {
  const batch = writeBatch(db)
  const user = rootState.auth.user.profile
  const objectToSend = {
    contractorsUids,
    contractors,
    assigned: contractors.length > 0,
  }

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i]
    const docRef = doc(db, 'orders', order)
    batch.update(docRef, {
      ...objectToSend,
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
