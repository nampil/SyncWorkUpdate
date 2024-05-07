import { httpsCallable } from 'firebase/functions'
import { getDownloadURL, ref } from 'firebase/storage'
import { functions, storage } from '~/plugins/firebase'

export async function copy_files_service(_, { files }) {
  try {
    const copyFiles = httpsCallable(functions, 'copyFiles')

    await copyFiles({ files })

    const urlsPromises = []
    files.forEach((file) => {
      const { destinationPath } = file
      if (!destinationPath) {
        urlsPromises.push(Promise.reject(new Error('No destinationPath')))
        return
      }

      const urlPromise = getDownloadURL(ref(storage, destinationPath))
      urlsPromises.push(urlPromise)
    })

    const results = await Promise.allSettled(urlsPromises)

    return results.map((result) => {
      if (result.status === 'rejected') {
        return null
      }
      return result.value
    })
  } catch (error) {
    throw new Error(error)
  }
}
