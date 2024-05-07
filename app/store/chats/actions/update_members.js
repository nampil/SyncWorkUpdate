import { collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_members(
  { dispatch, commit, state },
  { chatRoomId, newSubscribers }
) {
  const chatRoomRef = doc(collection(db, 'chatRooms'), chatRoomId)

  await updateDoc(chatRoomRef, { subscribers: newSubscribers })

  /* Si subcriber esta en admin */
  const chatRoomAdmin = await getDoc(chatRoomRef)
  let admins = chatRoomAdmin.data().admins

  admins = admins.filter((admin) => {
    if (!newSubscribers.includes(admin)) {
      return false
    } else {
      return true
    }
  })
  if (admins.length !== chatRoomAdmin.data().admins.length) {
    await dispatch('update_admins', { chatRoomId, newAdmins: admins })
  }
  const indexOfChatRoom = state.chatRooms.findIndex(
    (chatRoom) => chatRoom.id === chatRoomId
  )
  const chatRoom = state.chatRooms[indexOfChatRoom]
  if (chatRoom) {
    commit('set_roomSelected', chatRoom.id)
  }
}
