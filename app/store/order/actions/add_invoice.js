import { Timestamp, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_invoice(
  { commit, rootState },
  { orderId, localInvoice }
) {
  const invoiceRef = doc(db, `orders/${orderId}/invoice`, 'invoiceData')
  const user = rootState.auth.user.profile

  await setDoc(invoiceRef, {
    ...localInvoice,
    ...(localInvoice.createdAt && {
      createdAt: new Timestamp(
        localInvoice.createdAt.seconds,
        localInvoice.createdAt.nanoseconds
      ),
      updatedBy: user,
      updatedAt: serverTimestamp(),
    }),
    ...(!localInvoice.createdAt && {
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    }),
  })

  return ''
}
