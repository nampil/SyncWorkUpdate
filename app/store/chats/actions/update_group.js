import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_group(
  { state, commit, dispatch },
  { updateGroup }
) {
  const chatRoomRef = doc(collection(db, 'chatRooms'), updateGroup.chatRoomId)
  let objectToSend = {
    name: updateGroup.name,
  }

  if (updateGroup.deleteAvatarId && updateGroup.deleteAvatarId !== '') {
    await dispatch('remove_pic_for_avatar', {
      roomId: updateGroup.chatRoomId,
      codeName: updateGroup.deleteAvatarId,
      url: updateGroup.urlDelete,
    })

    objectToSend = {
      ...objectToSend,
      roomImg: { url: null },
    }
  }
  await updateDoc(chatRoomRef, objectToSend)

  const indexOfChatRoom = state.chatRooms.findIndex(
    (chatRoom) => chatRoom.id === updateGroup.chatRoomId
  )

  const chatRoom = state.chatRooms[indexOfChatRoom]
  if (chatRoom) {
    commit('set_roomSelected', chatRoom.id)
  }

  if (updateGroup.file) {
    const fileInfo = await dispatch('upload_files_for_chats_group', {
      file: updateGroup.file,
      roomId: updateGroup.chatRoomId,
    })

    await updateDoc(chatRoomRef, { roomImg: fileInfo })
  }
}
