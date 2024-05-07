import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export async function upload_files_for_chats(_, { files, roomId, chatId }) {
  const urlsPromises = []
  const snapshotPromises = []

  if (!files.length || !roomId || !chatId) {
    return
  }

  files.forEach((file) => {
    const storageRef = ref(
      storage,
      `chatRooms/${roomId}/chatsFiles/${chatId}/${file.codeName}`
    )

    const snapshot = uploadBytes(storageRef, file)
    snapshotPromises.push(snapshot)
  })

  const results = await Promise.all(snapshotPromises)

  results.forEach((snapshot) => {
    const downloadURL = getDownloadURL(snapshot.ref)
    urlsPromises.push(downloadURL)
  })

  const urls = await Promise.all(urlsPromises)

  return urls.map((url) => {
    const _file = files.filter((file) => url.includes(file.codeName))[0]

    return {
      url,
      name: _file.name,
      codeName: _file.codeName,
      type: _file.type,
    }
  })
}
