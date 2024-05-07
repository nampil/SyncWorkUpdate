import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export async function update_pic_for_profile(_, { file, uid }) {
  const urlsPromises = []
  const snapshopPromises = []
  file.codeName = uid
  const storageRef = ref(storage, `users/${uid}/avatar/${uid}`)
  const snapshot = uploadBytes(storageRef, file)

  snapshopPromises.push(snapshot)
  const results = await Promise.all(snapshopPromises)

  results.forEach((snapshot) => {
    const downloadURL = getDownloadURL(snapshot.ref)
    urlsPromises.push(downloadURL)
  })
  const urls = await Promise.all(urlsPromises)

  return urls.map((u) => {
    return {
      url: u,
      name: file.name,
      codeName: file.codeName,
      type: file.type,
    }
  })
}
