import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_invoice() {
  const q = query(collection(db, 'orders'))
  const querySnapshot = await getDocs(q)

  querySnapshot.forEach(async (order) => {
    const orderId = order.id
    if (orderId) {
      const invoiceRef = doc(db, `orders/${orderId}/invoice/invoiceData`)
      const docSnap = await getDoc(invoiceRef)

      if (docSnap.exists()) {
        const data = docSnap.data()

        let clientInvoiceTotal = 0
        if (data.items && data.items.length) {
          let subTotalFee = 0.0
          data.items.forEach((element) => {
            subTotalFee += parseFloat(element.qty) * parseFloat(element.price)
          })
          clientInvoiceTotal = parseFloat(subTotalFee).toFixed(2)
        }

        const orderRef = doc(db, `orders/${orderId}`)
        await updateDoc(orderRef, {
          clientInvoiceTotal,

          clientDiscount: data.discount,
          ...(data.invoiceNumber && {
            invoiceNumber: data.invoiceNumber,
          }),
          ...(data.completeDate && {
            invoiceDate: data.completeDate,
            invoiceCompletedDate: data.completeDate,
          }),
          ...(data.sentDate && {
            invoiceSentToClientDate: data.sentDate,
          }),
        })

        // await updateDoc(invoiceRef, {
        //   orderId,
        //   completedProcessor: data.sentDate !== undefined,
        // })
      }
    }
  })
}
