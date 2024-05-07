import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_admins(
  { commit, state },
  { chatRoomId, newAdmins }
) {
  const chatRoomRef = doc(collection(db, 'chatRooms'), chatRoomId)
  await updateDoc(chatRoomRef, { admins: newAdmins })
  const indexOfChatRoom = state.chatRooms.findIndex(
    (chatRoom) => chatRoom.id === chatRoomId
  )

  const chatRoom = state.chatRooms[indexOfChatRoom]
  if (chatRoom) {
    commit('set_roomSelected', chatRoom.id)
  }
}
