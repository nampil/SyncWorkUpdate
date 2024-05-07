import { deleteObject, ref } from 'firebase/storage'
import { storage, storageReports } from '~/plugins/firebase'
import { TYPES_BUCKET } from '~/utils/dictionaries'

export async function remove_pic_for_avatar(_, { uid, url }) {
  const promises = []

  const bucket = url.split('/b/')[1].split('/o/')[0]

  const _storage =
    bucket === TYPES_BUCKET.daytona_system_main ? storage : storageReports

  const storageRef = ref(_storage, `users/${uid}/avatar/${uid}`)
  const deleteComplete = deleteObject(storageRef)
  promises.push(deleteComplete)

  await Promise.all(promises)

  return 'Pics deleted'
}
