import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_ordersTemplates(_) {
  const orders = []
  const q = query(collection(db, `admin/config/orders-templates`))
  const querySnapshot = await getDocs(q)

  for (let i = 0; i < querySnapshot.docs.length; i++) {
    const doc = querySnapshot.docs[i]
    const order = {
      ...doc.data(),
      id: doc.id,
    }
    orders.push(order)
  }
  return orders
}
