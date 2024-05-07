import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export async function upload_files_for_chats_group(_, { file, roomId }) {
  const storageRef = ref(storage, `chatRooms/${roomId}/avatarGroup/${roomId}`)

  file.codeName = roomId
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return {
    url: downloadURL,
    name: file.name,
    codeName: roomId,
    type: file.type,
  }
}
