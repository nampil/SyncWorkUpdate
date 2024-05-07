import { doc, getDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_invoiceData({ commit }, orderId) {
  const invoiceRef = doc(db, `orders/${orderId}/invoice`, 'invoiceData')

  const docSnap = await getDoc(invoiceRef)

  // eslint-disable-next-line
  console.log('docSnap.exists()', docSnap.exists())

  if (docSnap.exists()) {
    const invoiceData = {
      ...docSnap.data(),
      id: docSnap.id,
      items:
        docSnap.data().items && docSnap.data().items.length
          ? docSnap.data().items
          : [],
    }
    commit('set_invoice', invoiceData)

    return JSON.parse(
      JSON.stringify(invoiceData)
    ) /* {...invoiceData, items: [...invoiceData.items]} */
  } else {
    return null
  }
}
