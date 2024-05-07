import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_payments(_, orderId) {
  const payments = []
  const q = query(
    collection(db, `orders/${orderId}/invoice/invoiceData/payments`)
  )
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    payments.push({
      ...doc.data(),
      id: doc.id,
    })
  })
  return payments
}
