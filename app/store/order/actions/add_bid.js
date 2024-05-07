import {
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_bid(
  { rootState },
  { orderId, objectToSend, reports }
) {
  const bidsRef = doc(collection(db, `orders/${orderId}/bids`))
  const user = rootState.auth.user.profile
  const batch = writeBatch(db)

  batch.set(bidsRef, {
    ...objectToSend,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  })

  for (let i = 0; i < reports?.length; i++) {
    const report = reports[i]
    const reportRef = doc(collection(bidsRef, 'reports'))
    batch.set(reportRef, {
      ...report,
      position: i + 1,
    })

    const reportUpdateRef = doc(
      db,
      `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports/${report.codeName}`
    )

    batch.update(reportUpdateRef, {
      bidsFlagged: arrayUnion(bidsRef.id),
    })
  }
  await batch.commit()

  return ''
}
