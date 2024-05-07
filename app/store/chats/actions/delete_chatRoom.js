import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_chatRoom({ commit, state }, { chatRoomId }) {
  const singleChatRoomRef = doc(collection(db, 'chatRooms'), chatRoomId)
  await updateDoc(singleChatRoomRef, { active: false })
  const chatRoom = state.chatRooms[state.chatRooms.length - 1]
  if (chatRoom) {
    commit('set_roomSelected', chatRoom.id)
  }
}
