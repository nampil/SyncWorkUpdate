import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export async function upload_file_for_chat(_, { file, roomId, type }) {
  const storageRef = ref(
    storage,
    `chatTasks/${type}/${roomId}/chatFiles/${file.codeName}`
  )

  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return {
    url: downloadURL,
    name: file.name,
    codeName: file.codeName,
    type: file.type,
  }
}
