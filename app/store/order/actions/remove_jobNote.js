import { collection, deleteDoc, doc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function remove_jobNote(
  { commit, dispatch },
  { orderId, jobNote }
) {
  const pictures = jobNote.pictures
  if (pictures && pictures.length) {
    await dispatch('remove_pic_for_job', {
      picsToDelete: pictures,
      orderId,
    })
  }

  const orderRef = doc(db, 'orders', orderId)
  const jobNotesRef = doc(collection(orderRef, 'jobNotes'), jobNote.id)

  await deleteDoc(jobNotesRef)
  return this.$i18n.t('successNoteDelete')
}
