import { collection, getDocs } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_reportsForTask(
  { commit },
  { orderId, type, taskId }
) {
  const reports = []
  const reportsRef = collection(
    db,
    `orders/${orderId}/${type}/${taskId}/reports`
  )
  const querySnapshot = await getDocs(reportsRef)
  querySnapshot.forEach((doc) => {
    const report = {
      ...doc.data(),
      id: doc.id,
    }
    reports.push(report)
  })
  return reports
}
