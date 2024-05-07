import { getDocs, collection } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_orderReports({ commit }, { orderId, tasks }) {
  try {
    if (!orderId || !tasks || tasks.length === 0)
      throw new Error('OrderId and Tasks are required to get reports.')

    const references = []

    Object.keys(tasks).forEach((key) => {
      const tasksIds = tasks[key]

      if (tasksIds && tasksIds.length > 0) {
        tasksIds.forEach((taskId) => {
          references.push(
            collection(db, `orders/${orderId}/${key}/${taskId}/reports`)
          )
        })
      }
    })

    const snapPromises = []

    references.forEach((ref) => {
      const snapshot = getDocs(ref)
      snapPromises.push(snapshot)
    })

    const results = await Promise.all(snapPromises)

    const reports = []

    results.forEach((snap) => {
      if (snap.empty) return
      snap.forEach((doc) => {
        reports.push({ ...doc.data(), id: doc.id })
      })
    })

    return reports
  } catch (error) {
    throw new Error(error)
  }
}
