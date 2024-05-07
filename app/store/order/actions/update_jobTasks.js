import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_jobTasks({ rootState }, { orderId, tasks }) {
  const batch = writeBatch(db)
  const orderRef = doc(db, 'orders', orderId)
  const user = rootState.auth.user.profile
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]

    const {
      files,
      id,
      materialsOrTools,
      requirements,
      reports,
      quantityPhotosRequiredForBefore,
      quantityPhotosRequiredForDuring,
      quantityPhotosRequiredForAfter,
      quantityPhotosRequiredForGeneral,
      ...objectToSend
    } = task

    const jobTaskRef = doc(collection(orderRef, task.type), task.id)

    batch.set(jobTaskRef, {
      ...objectToSend,
      position: i + 1,
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
