import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function get_moreChatsByChatRoom(
  { commit, state },
  { chatRoomId, lastChatLoaded }
) {
  if (!lastChatLoaded) {
    return
  }

  const chatsRef = collection(db, `chatRooms/${chatRoomId}/chats`)
  const q = query(
    chatsRef,
    orderBy('createdAt', 'desc'),
    startAfter(lastChatLoaded.createdAt),
    limit(30)
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    commit('set_hasMoreChats', { chatRoomId, value: false })
  }

  querySnapshot.forEach((doc) => {
    const chat = {
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      id: doc.id,
      timestamp: doc.data().createdAt.toDate().getTime(),
    }

    commit('add_chatToRoom', {
      chatRoomId,
      chat,
    })
  })
}
