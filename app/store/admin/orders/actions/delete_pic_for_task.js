import { deleteObject, ref } from 'firebase/storage'
import { storage, storageReports } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function delete_pic_for_task(
  _,
  { picsToDelete, orderId, jobType, taskId }
) {
  const promises = []

  for (let index = 0; index < picsToDelete.length; index++) {
    const { codeName, url } = picsToDelete[index]
    const bucket = url.split('/b/')[1].split('/o/')[0]

    const _storage =
      bucket === TYPES_BUCKET.daytona_system_main ? storage : storageReports

    const storageRef = ref(
      _storage,
      `admin/config/orders-templates/${orderId}/${jobType}/${taskId}/${codeName}`
    )

    const deleteComplete = deleteObject(storageRef)
    promises.push(deleteComplete)
  }

  await Promise.all(promises)

  return 'Pics deleted'
}
