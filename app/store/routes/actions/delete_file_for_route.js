import { ref, deleteObject } from 'firebase/storage'
import { storage, storageReports } from '@/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function delete_file_for_route(_, { filesToDelete, routeId }) {
  const promises = []
  for (let index = 0; index < filesToDelete.length; index++) {
    const { codeName, url } = filesToDelete[index]

    const bucket = url.split('/b/')[1].split('/o/')[0]

    const _storage =
      bucket === TYPES_BUCKET.daytona_system_main ? storage : storageReports

    const storageRef = ref(_storage, `${routeId}/${codeName}`)
    const deleteComplete = deleteObject(storageRef)
    promises.push(deleteComplete)
  }
  await Promise.all(promises)
  return 'Files deleted'
}
