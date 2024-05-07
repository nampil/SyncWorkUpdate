import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function create_chatRoom(
  { dispatch, commit, state },
  { newChatRoom }
) {
  let chatRoomRef = doc(collection(db, 'chatRooms'))
  const { file, ...objectToSend } = newChatRoom
  objectToSend.id = chatRoomRef.id

  if (!newChatRoom.isGroup) {
    const chatRoomId = newChatRoom.subscribers
      .sort((a, b) => (a > b ? -1 : 1))
      .join('-')

    const singleChatRoomRef = doc(collection(db, 'chatRooms'), chatRoomId)
    const oldChatRoom = await getDoc(singleChatRoomRef).then((doc) => {
      if (!doc.exists()) {
        return null
      }

      return { ...doc.data(), id: doc.id }
    })

    if (oldChatRoom) {
      if (!oldChatRoom.active) {
        await updateDoc(singleChatRoomRef, {
          active: true,
          createdAt: serverTimestamp(),
        })
        return finalize(chatRoomId)
      }

      return finalize(chatRoomId)
    }

    chatRoomRef = singleChatRoomRef
  }

  if (file) {
    const fileInfo = await dispatch('upload_files_for_chats_group', {
      file,
      roomId: chatRoomRef.id,
    })

    objectToSend.roomImg = fileInfo
  }

  await setDoc(chatRoomRef, objectToSend)
  finalize(chatRoomRef.id)

  function finalize(chatRoomId) {
    let counter = 0
    const waiter = setInterval(() => {
      const indexOfChatRoom = state.chatRooms.findIndex(
        (chatRoom) => chatRoom.id === chatRoomId
      )

      const chatRoom = state.chatRooms[indexOfChatRoom]
      if (chatRoom) {
        commit('set_roomSelected', chatRoom.id)
        clearInterval(waiter)
      }

      if (counter > 50) {
        clearInterval(waiter)
        // eslint-disable-next-line
        console.log('Hubo un error')
      }

      counter++
    }, 100)

    // commit('set_showChatDrawer', false)
    commit('set_drawerNewChat', false)
    commit('set_drawerNewChatGroup', false)
  }
}
