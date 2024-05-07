import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'
import { TASK_STATUS } from '@/utils/dictionaries'

export async function handleTaskStatus(
  { rootState },
  { taskId, orderId, type, newStatus }
) {
  if (!taskId || !orderId || !type || !newStatus) {
    throw new Error('Invalid arguments')
  }
  const user = rootState.auth.user.profile
  const taskRef = doc(collection(db, `orders/${orderId}/${type}`), taskId)
  let objectToSend = {}
  if (newStatus !== TASK_STATUS.taskCompleted) {
    objectToSend = {
      taskApprovedBy: null,
      taskApprovedAt: null,
      status: newStatus,
    }
  }
  if (newStatus === TASK_STATUS.taskCompleted) {
    objectToSend = {
      status: newStatus,
      taskApprovedBy: user,
      taskApprovedAt: serverTimestamp(),
    }
  }

  await updateDoc(taskRef, objectToSend)
}
