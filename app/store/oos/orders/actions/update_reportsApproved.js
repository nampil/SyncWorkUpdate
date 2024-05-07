import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { PROCESS_TIME_TYPES } from '@/utils/dictionaries'

export async function update_reportsApproved(
  { rootState },
  { task, orderId, reportsApproved, typeReports, area }
) {
  const user = rootState.auth.user.profile
  const taskRef = doc(collection(db, `orders/${orderId}/${task.type}`), task.id)

  if (typeReports === PROCESS_TIME_TYPES.before) {
    await updateDoc(taskRef, {
      beforeReportsApproved: reportsApproved,
      contractorCompletedBefore: reportsApproved,
      beforeFinishedBy: reportsApproved ? user : null,
      beforeFinished: reportsApproved,
      beforeFinishedAt: reportsApproved ? serverTimestamp() : null,
    })
  } else if (typeReports === PROCESS_TIME_TYPES.during) {
    await updateDoc(taskRef, {
      duringReportsApproved: reportsApproved,
      contractorCompletedDuring: reportsApproved,
      duringFinishedBy: reportsApproved ? user : null,
      duringFinished: reportsApproved,
      duringFinishedAt: reportsApproved ? serverTimestamp() : null,
    })
  } else if (typeReports === PROCESS_TIME_TYPES.after) {
    await updateDoc(taskRef, {
      afterReportsApproved: reportsApproved,
      contractorCompletedAfter: reportsApproved,
      afterFinishedBy: reportsApproved ? user : null,
      afterFinished: reportsApproved,
      afterFinishedAt: reportsApproved ? serverTimestamp() : null,
    })
  } else if (typeReports === PROCESS_TIME_TYPES.generalReports) {
    await updateDoc(taskRef, {
      generalReportsApproved: reportsApproved,
      contractorCompleted: reportsApproved,
      finished: reportsApproved,
      finishedAt: reportsApproved ? serverTimestamp() : null,
      finishedBy: reportsApproved ? user : null,
    })
  } else if (typeReports === PROCESS_TIME_TYPES.inspection && area) {
    const objectToUpdate = {}
    objectToUpdate[`reportsApprovedByArea.${area}`] = reportsApproved
    objectToUpdate[`contractorCompletedByArea.${area}`] = reportsApproved

    objectToUpdate[`startedByArea.${area}.finished`] = reportsApproved

    objectToUpdate[`startedByArea.${area}.finishedAt`] = reportsApproved
      ? serverTimestamp()
      : null
    objectToUpdate[`startedByArea.${area}.finishedBy`] = reportsApproved
      ? user
      : null

    await updateDoc(taskRef, objectToUpdate)
  }
}
