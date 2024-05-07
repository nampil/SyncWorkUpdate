import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_payment(_, { orderId, paymentId }) {
  const paymentRef = doc(
    db,
    `orders/${orderId}/invoice/invoiceData/payments`,
    paymentId
  )
  await deleteDoc(paymentRef)
}
