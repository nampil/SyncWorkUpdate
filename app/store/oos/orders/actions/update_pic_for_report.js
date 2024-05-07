import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storageReports } from '~/plugins/firebase'

export async function update_pic_for_report(
  _,
  { file, id, orderId, type, taskId }
) {
  const urlsPromises = []
  const snapshopPromises = []
  const storageRef = ref(
    storageReports,
    `orders/${orderId}/${type}/${taskId}/reports/${id}`
  )

  const snapshot = uploadBytes(storageRef, file)
  snapshopPromises.push(snapshot)
  const results = await Promise.all(snapshopPromises)

  results.forEach((snapshot) => {
    const downloadURL = getDownloadURL(snapshot.ref)
    urlsPromises.push(downloadURL)
  })

  const url = await Promise.all(urlsPromises)

  return {
    url,
    name: file.name,
    codeName: file.codeName,
    type: file.type,
  }
}
