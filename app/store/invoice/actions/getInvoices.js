import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function getInvoices({ commit }, orderId) {
  if (!orderId) {
    return
  }

  commit('flush_invoice')
  const unsubscribe = onSnapshot(
    doc(db, `orders/${orderId}/invoice`, 'invoiceData'),
    (doc) => {
      const invoice = doc.data()
      if (invoice) {
        commit('set_invoice', {
          ...invoice,
          id: doc.id,
          items: invoice.items && invoice.items.length ? invoice.items : [],
        })
      }
    }
  )
  commit('set_invoiceListener', unsubscribe)
}
