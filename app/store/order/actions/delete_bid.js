import {
  arrayRemove,
  collection,
  doc,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_bid(_, { orderId, objectDelete }) {
  const batch = writeBatch(db)
  const bidRef = doc(db, `orders/${orderId}/bids`, objectDelete.id)
  const reportsRef = query(
    collection(db, `orders/${orderId}/bids/${objectDelete.id}/reports`)
  )
  const querySnapshotReports = await getDocs(reportsRef)

  querySnapshotReports.forEach((docReport) => {
    const _report = docReport.data()
    const reportUpdateRef = doc(
      db,
      `orders/${_report.orderId}/${_report.task.type}/${_report.task.id}/reports/${_report.codeName}`
    )
    batch.update(reportUpdateRef, {
      bidsFlagged: arrayRemove(bidRef.id),
    })

    batch.delete(docReport.ref)
  })

  batch.delete(bidRef)

  await batch.commit()
  return ''
}
