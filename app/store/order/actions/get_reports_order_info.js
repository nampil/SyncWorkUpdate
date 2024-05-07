import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reports_order_info(
  _,
  { arrayToSend, orderId, type, taskId }
) {
  const reports = []
  const listReportsId = []

  for (let i = 0; i < arrayToSend.length; i++) {
    const report = arrayToSend[i]
    listReportsId.push(report.id)
  }

  const chunkSize = 10
  for (let i = 0; i < listReportsId.length; i += chunkSize) {
    const chunkReports = listReportsId.slice(i, i + chunkSize)
    const reportsRef = collection(
      db,
      `orders/${orderId}/${type}/${taskId}/reports`
    )
    const q = query(reportsRef, where('id', 'in', chunkReports))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach((doc) => {
      const _reports = {
        ...doc.data(),
        id: doc.id,
      }
      reports.push(_reports)
    })
  }
  return reports
}
