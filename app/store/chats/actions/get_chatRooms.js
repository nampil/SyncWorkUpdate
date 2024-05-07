import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from '~/plugins/firebase'

export function get_chatRooms({ commit, dispatch, state }) {
  commit('clear_chatRooms')
  const user = auth.currentUser

  const chatRoomsRef = collection(db, 'chatRooms')

  const q = query(
    chatRoomsRef,
    where('active', '==', true),
    where('subscribers', 'array-contains', user.uid)
  )

  const chatRoomsListener = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const subscribers = await dispatch(
        'get_chatUserProfiles',
        change.doc.data().subscribers.filter((subs) => subs !== user.uid)
      )
      if (change.type === 'added') {
        const doc = {
          ...change.doc.data(),
          id: change.doc.id,
          chatListener: null,
          chats: [],
          subscribers,
          lastChatLoaded: null,
          firstChatsLoad: false,
          hasMoreChats: true,
        }
        dispatch('get_chatsByChatRoom', { chatRoomId: doc.id })
        commit('add_chatRoom', doc)
      }
      if (change.type === 'modified') {
        commit('update_chatRoom', {
          ...change.doc.data(),
          subscribers,
          id: change.doc.id,
        })
      }

      if (change.type === 'removed') {
        const oldChatRoomSelected = state.roomSelected
        commit('delete_chatRoom', change.doc.id)
        if (oldChatRoomSelected === change.doc.id) {
          // Cambiar room Selected
          const roomSelected = state.chatRooms[state.chatRooms.length - 1]
          if (roomSelected) {
            commit('set_roomSelected', roomSelected.id)
          }
        }
      }
    })
  })

  commit('set_chatRoomsListener', chatRoomsListener)
}
