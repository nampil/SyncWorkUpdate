import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '~/plugins/firebase'

export async function upload_pic_for_requirements(
  _,
  { files, orderId, type, taskId, requirementId }
) {
  const urlsPromises = []
  const snapshopPromises = []

  files.forEach((file) => {
    // const codeName =
    //   new Date().getTime() + '-' + Math.floor(1000 + Math.random() * 9000)

    // file.codeName = codeName

    const storageRef = ref(
      storage,
      `orders/${orderId}/${type}/${taskId}/requirements/${requirementId}/${file.codeName}`
    )

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
    }
  })
}
