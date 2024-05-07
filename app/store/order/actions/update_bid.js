import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_bid(
  { rootState },
  { objectToSend, orderId, bidId, reportsDelete, reportsNew }
) {
  const user = rootState.auth.user.profile
  const bidRef = doc(db, `orders/${orderId}/bids`, bidId)
  const batch = writeBatch(db)

  batch.update(bidRef, {
    ...objectToSend,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  })

  for (let i = 0; i < reportsNew.length; i++) {
    const report = reportsNew[i]
    const reportRef = doc(
      collection(db, `orders/${orderId}/bids/${bidId}/reports`)
    )

    batch.set(reportRef, {
      ...report,
    })

    const reportUpdateRef = doc(
      db,
      `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports/${report.codeName}`
    )

    batch.update(reportUpdateRef, {
      bidsFlagged: arrayUnion(bidRef.id),
    })
  }

  for (let i = 0; i < reportsDelete.length; i++) {
    const report = reportsDelete[i]
    const reportRef = doc(
      db,
      `orders/${orderId}/bids/${bidId}/reports`,
      report.id
    )
    batch.delete(reportRef)

    const reportUpdateRef = doc(
      db,
      `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports/${report.codeName}`
    )

    batch.update(reportUpdateRef, {
      bidsFlagged: arrayRemove(bidRef.id),
    })
  }

  await batch.commit()
}
