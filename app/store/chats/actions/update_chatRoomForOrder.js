import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function update_chatRoomForOrder(_, { chatRoomId, objectToSend }) {
  const chatRoomRef = doc(db, `chatRooms/${chatRoomId}`)
  return updateDoc(chatRoomRef, objectToSend)
}
