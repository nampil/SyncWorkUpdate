import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export function get_chatsByChatRoom({ commit, state }, { chatRoomId }) {
  const chatsRef = collection(db, `chatRooms/${chatRoomId}/chats`)
  const user = auth.currentUser

  const q = query(chatsRef, orderBy('createdAt', 'desc'), limit(30))

  const chatListener = onSnapshot(
    q,

    (querySnapshot) => {
      if (querySnapshot.empty) {
        commit('set_hasMoreChats', { chatRoomId, value: false })
      }

      querySnapshot.docChanges().forEach((change) => {
        const chat = {
          ...change.doc.data(),
          sent: !!change.doc.data().createdAt,
          createdAt: change.doc.data().createdAt
            ? change.doc.data().createdAt.toDate()
            : new Date(),
          id: change.doc.id,

          deliveredTo: change.doc.data().deliveredTo || [],
          timestamp: change.doc.data().createdAt
            ? change.doc.data().createdAt.toDate().getTime()
            : new Date().getTime(),
        }

        if (change.type === 'added') {
          if (!chat.deliveredTo.includes(user.uid)) {
            updateDoc(change.doc.ref, { deliveredTo: arrayUnion(user.uid) })
          }
          commit('add_chatToRoom', {
            chatRoomId,
            chat,
          })
          commit('set_scrollChatZone', true)
        }
        if (change.type === 'modified') {
          commit('update_chatToRoom', {
            chatRoomId,
            chat,
          })
        }
        if (change.type === 'removed') {
          // commit('delete_chatToRoom', {
          //   chatRoomId,
          //   chat,
          // })
        }
      })
    }
  )
  commit('set_chatListener', { chatRoomId, chatListener })
}
