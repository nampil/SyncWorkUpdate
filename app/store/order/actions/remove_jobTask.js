import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function remove_jobTask(
  { dispatch },
  { orderId, jobTask, jobType }
) {
  const jobTaskId = jobTask.id
  // const pictures = jobTask.pictures
  // const promisesPicReports = []

  /* Eliminar Storage de los requeriemintos */
  if (jobTask.requirements && jobTask.requirements.length) {
    for (let i = 0; i < jobTask.requirements.length; i++) {
      await dispatch('remove_pic_for_requirement', {
        picsToDelete: jobTask.requirements[i].pictures,
        orderId,
        type: jobType,
        taskId: jobTask.id,
        requirementId: jobTask.requirements[i].id,
      })
    }
  }
  /* ELiminar requeriments */
  const qRequirements = query(
    collection(db, `orders/${orderId}/${jobType}/${jobTask.id}/requirements`)
  )
  const querySnapshotRequirements = await getDocs(qRequirements)
  querySnapshotRequirements.forEach((doc) => {
    deleteDoc(doc.ref)
  })
  /* ELiminar Materials Or Tools */
  const qMaterialsOrTools = query(
    collection(
      db,
      `orders/${orderId}/${jobType}/${jobTask.id}/materialsOrTools`
    )
  )
  const querySnapshotMaterialsOrTools = await getDocs(qMaterialsOrTools)
  querySnapshotMaterialsOrTools.forEach((doc) => {
    deleteDoc(doc.ref)
  })
  /* Eliminar task chats */
  const qTaskChats = query(
    collection(db, `orders/${orderId}/${jobType}/${jobTask.id}/taskChats`)
  )
  const querySnapshotTaskChats = await getDocs(qTaskChats)
  querySnapshotTaskChats.forEach((doc) => {
    deleteDoc(doc.ref)
  })
  /* Eliminar reports */
  // const qReports = query(
  //   collection(db, `orders/${orderId}/${jobType}/${jobTask.id}/reports`)
  // )
  // const querySnapshotReports = await getDocs(qReports)
  // querySnapshotReports.forEach((doc) => {
  //   deleteDoc(doc.ref)
  // })
  /* Storage reports */
  // const refReports = ref(
  //   storage,
  //   `orders/${orderId}/${jobType}/${jobTask.id}/reports`
  // )

  // listAll(refReports)
  //   .then((result) => {
  //     result.items.forEach(function (file) {
  //       const refFile = ref(storage, file.fullPath)
  //       const completeDeleteFile = deleteObject(refFile)
  //       promisesPicReports.push(completeDeleteFile)
  //     })
  //   })
  //   .catch((error) => {
  //     // eslint-disable-next-line
  //     console.log('error:', error)
  //   })
  // await Promise.all(promisesPicReports)

  // if (pictures && pictures.length) {
  //   // Delete Pictures in store

  //   await dispatch('delete_pic_for_task', {
  //     picsToDelete: pictures,
  //     orderId,
  //     jobType,
  //     taskId: jobTask.id,
  //   })
  // }

  const docRef = doc(db, `orders/${orderId}/${jobType}`, jobTaskId)
  await deleteDoc(docRef)

  return ''
}
