import { doc, writeBatch } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_reports({ _ }, { reports }) {
  // eslint-disable-next-line
  console.log(reports)
  const batch = writeBatch(db)

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i]
    const { orderId, task, id: reportId } = report

    const reportRef = doc(
      db,
      'orders',
      orderId,
      task.type,
      task.id,
      'reports',
      reportId
    )
    batch.set(reportRef, {
      ...report,
    })
  }

  await batch.commit()
}
