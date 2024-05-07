import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_order_by_id(_, orderId) {
  const orderRef = doc(db, 'orders', orderId)
  const docSnap = await getDoc(orderRef)

  if (docSnap.exists()) {
    const doc = { ...docSnap.data(), id: docSnap.id }
    const _doc = {
      ...doc,

      dateDueFormatted: this.$formatDate(doc.dateDue.toDate()),
    }
    return _doc
  } else {
    throw new Error('No doc here')
  }
}
