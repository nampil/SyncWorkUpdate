import { deleteObject, ref } from 'firebase/storage'
import { storage, storageReports } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function remove_pic_for_task_template(
  _,
  { picsToDelete, type, templateId }
) {
  const promises = []

  for (let index = 0; index < picsToDelete.length; index++) {
    const { codeName, url } = picsToDelete[index]
    const bucket = url.split('/b/')[1].split('/o/')[0]

    const _storage =
      bucket === TYPES_BUCKET.daytona_system_main ? storage : storageReports

    const storageRef = ref(
      _storage,
      `admin/config/${type}-templates/${templateId}/${codeName}`
    )

    const deleteComplete = deleteObject(storageRef).catch((error) => {
      // eslint-disable-next-line
      console.log('error', error)
    })
    promises.push(deleteComplete)
  }

  await Promise.all(promises)

  return 'Pics deleted'
}
