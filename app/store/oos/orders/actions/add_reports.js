import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_reports({ dispatch }, arrayToSend) {
  const batch = writeBatch(db)

  if (arrayToSend && arrayToSend.length) {
    for (let i = 0; i < arrayToSend.length; i++) {
      const report = arrayToSend[i]
      const refReport = doc(
        collection(
          db,
          `orders/${report.orderId}/${report.task.type}/${report.task.id}/reports`
        ),
        report.codeName
      )

      if (report.file) {
        const urls = await dispatch('update_pic_for_report', {
          file: report.file,
          orderId: report.orderId,
          type: report.task.type,
          taskId: report.task.id,
          id: report.id,
        })

        report.url = urls.url[0]
        report.uploadedAt = serverTimestamp()
        report.uploaded = true
      }
      const { file, ..._report } = report
      batch.set(refReport, _report)
    }
  }
  await batch.commit()
}
