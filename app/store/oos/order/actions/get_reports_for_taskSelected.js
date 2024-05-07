import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_reports_for_taskSelected(
  { state, commit, dispatch },
  { orderId, type, taskId }
) {
  if (!orderId || !type || !taskId) {
    return
  }
  return new Promise((resolve, reject) => {
    let firstLoaded = false
    commit('flush_reports')

    const taskReportsRef = collection(
      db,
      `orders/${orderId}/${type}/${taskId}/reports`
    )
    const unsubscribe = onSnapshot(taskReportsRef, (snapshot) => {
      const reports = []
      snapshot.forEach((doc) => {
        reports.push({
          ...doc.data(),
          id: doc.id,
        })
      })
      commit('set_taskReports', reports)
      if (!firstLoaded) {
        firstLoaded = true
        resolve()
      }
    })
    commit('set_taskReportListener', unsubscribe)
  })
}
