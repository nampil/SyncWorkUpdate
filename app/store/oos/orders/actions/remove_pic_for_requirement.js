import { deleteObject, ref } from 'firebase/storage'
import { storage, storageReports } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function remove_pic_for_requirement(
  { _ },
  { picsToDelete, orderId, type, taskId, requirementId }
) {
  const promises = []
  for (let index = 0; index < picsToDelete.length; index++) {
    const { codeName, url } = picsToDelete[index]
    const bucket = url.split('/b/')[1].split('/o/')[0]
    const _storage =
      bucket === TYPES_BUCKET.daytona_system_main ? storage : storageReports

    const storageRef = ref(
      _storage,
      `orders/${orderId}/${type}/${taskId}/requirements/${requirementId}/${codeName}`
    )

    const deleteComplete = deleteObject(storageRef)
    promises.push(deleteComplete)
  }
  await Promise.all(promises)
}
