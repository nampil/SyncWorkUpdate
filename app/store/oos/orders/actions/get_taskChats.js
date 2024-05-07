import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function get_taskChats(
  { commit, state },
  { orderId, type, task, routeId }
) {
  const taskChatsRef = collection(
    db,
    `orders/${orderId}/${type}/${task.id}/taskChats`
  )

  const q = query(taskChatsRef, orderBy('createdAt', 'desc'))
  let firstLoaded = false

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docData = change.doc.data()
      const chat = {
        ...docData,
        id: change.doc.id,
        ...(Object.hasOwnProperty.call(docData, 'createdAt') &&
          docData.createdAt === null && {
            createdAt: Timestamp.fromDate(new Date()),
          }),
      }
      if (change.type === 'added') {
        const taskSelected = state.taskSelected
        commit('add_taskChat', {
          chat,
          orderId,
          type,
          task,
          taskSelected,
          routeId,
          isFirstLoad: !firstLoaded,
        })
      }
      if (change.type === 'modified') {
        commit('update_taskChat', { chat, orderId, type, taskId: task.id })
      }
      if (change.type === 'removed') {
        commit('remove_taskChat', { chat, orderId, type, taskId: task.id })
      }
    })
    if (!firstLoaded) {
      firstLoaded = true
    }
  })
  commit('set_taskChatUnsubscribe', { unsubscribe, taskId: task.id, orderId })
}
