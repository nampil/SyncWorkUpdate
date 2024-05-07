import { collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function leave_Group({ commit, state }, { chatRoomId, userId }) {
  const singleChatRoomRef = doc(collection(db, 'chatRooms'), chatRoomId)

  const chatRoom = await getDoc(singleChatRoomRef)
  if (chatRoom.exists()) {
    const _subscribers = chatRoom.data().subscribers
    const index = _subscribers.indexOf(userId)
    if (index > -1) {
      _subscribers.splice(index, 1)
      await updateDoc(singleChatRoomRef, { subscribers: _subscribers })
    }
    const roomSelected = state.chatRooms[state.chatRooms.length - 1]
    if (roomSelected) {
      commit('set_roomSelected', roomSelected.id)
    }
  } else {
    // eslint-disable-next-line
    console.log('No such document!')
  }
}
