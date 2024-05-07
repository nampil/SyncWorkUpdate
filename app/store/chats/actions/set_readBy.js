import { collection, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export async function set_readBy({ commit }, { chatId, chatRoomId }) {
  const user = auth.currentUser
  const chatRef = doc(collection(db, `chatRooms/${chatRoomId}/chats`), chatId)
  await updateDoc(chatRef, { readBy: arrayUnion(user.uid) })
  commit('update_chat_readBy', { chatId, chatRoomId })
}
