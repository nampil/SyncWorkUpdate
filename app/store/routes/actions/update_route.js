import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export async function update_route(
  { state, dispatch },
  { routeId, objToUpdate }
) {
  const originalRoute = state.routes.filter((r) => r.id === routeId)

  if (originalRoute.files) {
    const filesToDelete = originalRoute.files.filter((file) => {
      const index = objToUpdate.files
        .map((f) => f.codeName)
        .indexOf(file.codeName)
      return index === -1
    })

    if (filesToDelete.length) {
      await dispatch('delete_file_for_route', {
        filesToDelete,
        routeId,
      })
    }
  }

  if (objToUpdate.rowfiles.length) {
    const _files = await dispatch('upload_files_for_routes', {
      files: objToUpdate.rowfiles,
      routeId,
    })

    _files.forEach((file) => {
      const index = objToUpdate.files
        .map((f) => f.codeName)
        .indexOf(file.codeName)

      if (index < 0) {
        objToUpdate.files.push(file)
      } else {
        objToUpdate.files.splice(index, 1, file)
      }
    })
  }

  const objToSend = {
    instructions: objToUpdate.instructions,
    files: objToUpdate.files,
  }

  const routeRef = doc(db, 'routes', routeId)

  await updateDoc(routeRef, objToSend)
  return 'Route updated succesfully'
}
