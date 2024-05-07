import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_payment({ rootState }, { objToSend, orderId }) {
  const user = rootState.auth.user.profile
  const paymentRef = doc(
    db,
    `orders/${orderId}/invoice/invoiceData/payments`,
    objToSend.id
  )

  await updateDoc(paymentRef, {
    ...objToSend,
    updatedBy: user,
    updatedAt: serverTimestamp(),
  })
}
