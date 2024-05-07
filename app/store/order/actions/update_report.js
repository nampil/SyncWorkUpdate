import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_report(
  { commit },
  { reportId, orderId, taskType, taskId, objectToSend }
) {
  // eslint-disable-next-line
  console.log(
    'reportId, orderId, taskType, taskId, objectToSend',
    reportId,
    orderId,
    taskType,
    taskId,
    objectToSend
  )

  const reportRef = doc(
    db,
    'orders',
    orderId,
    taskType,
    taskId,
    'reports',
    reportId
  )

  await updateDoc(reportRef, objectToSend)

  // if (hasToCommitUpdate) {
  //   commit('oos/update_report', objectToSend, {root: true})
  // }
}
