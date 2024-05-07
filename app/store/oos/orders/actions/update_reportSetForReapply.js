import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function update_reportSetForReapply(_, { report }) {
  const orderId = report.orderId
  const type = report.task.type
  const taskId = report.task.id

  const reportRef = doc(
    collection(db, `orders/${orderId}/${type}/${taskId}/reports`),
    report.id
  )

  return updateDoc(reportRef, { markedForReapply: true })
}
