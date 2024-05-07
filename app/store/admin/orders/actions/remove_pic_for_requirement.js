import { deleteObject, ref } from 'firebase/storage'
import { storage, storageReports } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function remove_pic_for_requirement(
  _,
  { picsToDelete, templateId, type, requirementId }
) {
  const promises = []

  picsToDelete.forEach((pic) => {
    const bucket = pic.url.split('/b/')[1].split('/o/')[0]

    const _storage =
      bucket === TYPES_BUCKET.daytona_system_main ? storage : storageReports

    const picRef = ref(
      _storage,
      `admin/config/${type}-templates/${templateId}/requirements/${requirementId}/${pic.codeName}`
    )
    const deleteComplete = deleteObject(picRef)
    promises.push(deleteComplete)
  })
  await Promise.all(promises)

  return 'Pics deleted'
}
