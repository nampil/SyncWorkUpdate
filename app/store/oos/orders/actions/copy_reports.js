import { doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function copy_reports(_, newReportsList) {
  const batch = writeBatch(db)

  for (let i = 0; i < newReportsList.length; i++) {
    const report = newReportsList[i]

    const reportRef = doc(
      db,
      `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports`,
      report.codeName
    )

    batch.set(reportRef, report, {
      merge: true,
    })
  }

  return batch.commit()
}
