import { collection, deleteDoc, doc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_requirements(
  { dispatch },
  { orderId, type, taskId, deletedRequirement, requirementId }
) {
  const refRequirement = doc(
    collection(db, `orders/${orderId}/${type}/${taskId}/requirements`),
    requirementId
  )
  if (deletedRequirement.pictures) {
    await dispatch('remove_pic_for_requirement', {
      picsToDelete: deletedRequirement.pictures,
      orderId,
      type,
      taskId,
      requirementId,
    })
  }

  /* Delete reports Requirements */
  // const q = query(
  //   collection(db, `orders/${orderId}/${type}/${taskId}/reports`),
  //   where('fromRequirement', '==', true)
  // )
  // const querySnappshots = await getDocs(q)
  // querySnappshots.forEach((doc) => {
  //   if (requirementId === doc.data().requirementId) {
  //     deleteDoc(doc.ref)
  //   }
  // })

  deleteDoc(refRequirement)
}
