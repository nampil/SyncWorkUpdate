import {
  collection,
  /* doc,
  getDoc, */
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_ordersByPropertyId({ dispatch }, { propertyId }) {
  const q = query(
    collection(db, 'orders'),
    where('propertyId', '==', propertyId)
  )
  const orders = []

  const querySnapshot = await getDocs(q)

  querySnapshot.forEach((doc) => {
    const order = {
      ...doc.data(),
      id: doc.id,
      tasks: [],
      loadingTasks: false,
      tasksLoaded: false,
    }
    orders.push(order)
  })

  // for (const order of orders) {
  //   const invoiceRef = doc(db, `orders/${order.id}/invoice`, 'invoiceData')
  //   const snap = await getDoc(invoiceRef)

  //   if (!snap.exists()) {
  //     continue
  //   }
  //   order.invoiceData = {
  //     ...snap.data(),
  //   }
  // }
  return orders
}
