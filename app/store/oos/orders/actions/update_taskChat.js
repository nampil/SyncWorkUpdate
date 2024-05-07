import { arrayUnion, doc, updateDoc } from 'firebase/firestore'

import { db } from '~/plugins/firebase'

export function update_taskChat(
  _,
  { taskChatId, orderId, type, taskId, objectToUpdate }
) {
  // eslint-disable-next-line
  console.log('objectToUpdate', objectToUpdate)

  const objectToSend = {
    ...objectToUpdate,
    readBy: arrayUnion(objectToUpdate.readBy),
  }

  const taskChatsRef = doc(
    db,
    `orders/${orderId}/${type}/${taskId}/taskChats/${taskChatId}`
  )

  return updateDoc(taskChatsRef, objectToSend)
}
