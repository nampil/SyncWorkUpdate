import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export async function update_pic_for_documents(_, { files, uid }) {
  const urlsPromises = []
  const snapshopPromises = []

  files.forEach((file) => {
    const codeName =
      new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)

    file.codeName = codeName

    const storageRef = ref(storage, `users/${uid}/documents/${codeName}`)
    const snapshot = uploadBytes(storageRef, file)
    snapshopPromises.push(snapshot)
  })

  const results = await Promise.all(snapshopPromises)

  results.forEach((snapshot) => {
    const downloadURL = getDownloadURL(snapshot.ref)
    urlsPromises.push(downloadURL)
  })
  const urls = await Promise.all(urlsPromises)

  return urls.map((u) => {
    let _file = null
    files.forEach((file) => {
      if (u.includes(file.codeName)) {
        _file = file
      }
    })
    return {
      url: u,
      name: _file.name,
      codeName: _file.codeName,
      type: _file.type,
      documentType: _file.documentType,
    }
  })
}
