import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_requirements(
  { dispatch },
  { objectToSend, orderId, type, taskId, requirementId }
) {
  const { currentPictures, ...newRequirement } = objectToSend

  if (
    objectToSend.pictures &&
    objectToSend.pictures.length &&
    currentPictures &&
    currentPictures.length
  ) {
    const picsToDelete = currentPictures.filter((pic) => {
      const index = newRequirement.pictures
        .map((pic) => pic.codeName)
        .indexOf(pic.codeName)

      return index === -1
    })
    if (picsToDelete.length) {
      await dispatch('remove_pic_for_requirement', {
        picsToDelete,
        orderId,
        type,
        taskId,
        requirementId,
      })
    }
  }

  if (
    newRequirement &&
    newRequirement.pictures &&
    newRequirement.pictures.filter((pic) => pic.file).length
  ) {
    const urls = await dispatch('upload_pic_for_requirements', {
      orderId,
      files: newRequirement.pictures
        .filter((pic) => pic.file)
        .map((pic) => pic.file),
      type,
      taskId,
      requirementId,
    })
    newRequirement.pictures = [
      ...newRequirement.pictures.filter((pic) => !pic.file),
      ...urls,
    ]
  }

  const refRequirements = doc(
    collection(db, `orders/${orderId}/${type}/${taskId}/requirements`),
    requirementId
  )
  await updateDoc(refRequirements, newRequirement)
}
