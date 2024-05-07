import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_payment({ rootState }, { objToSend, orderId }) {
  const user = rootState.auth.user.profile
  const paymentsRef = await addDoc(
    collection(db, `orders/${orderId}/invoice/invoiceData/payments`),
    {
      ...objToSend,
      updatedBy: user,
      updatedAt: serverTimestamp(),
    }
  )
  return {
    ...objToSend,
    id: paymentsRef.id,
  }
}
