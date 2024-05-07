import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function add_jobNote(
  { dispatch, commit, rootState },
  { orderId, jobNotes }
) {
  const user = rootState.auth.user.profile
  const arrayenviar = []
  const orderRef = doc(db, 'orders', orderId)
  const batch = writeBatch(db)

  for (let j = 0; j < jobNotes.length; j++) {
    const jobNote = jobNotes[j]
    if (jobNote.files && jobNote.files.length > 0) {
      const urls = await dispatch('upload_pic_for_job', {
        files: jobNote.files,
        orderId,
      })
      jobNote.pictures = urls
    }
  }

  for (let j = 0; j < jobNotes.length; j++) {
    const jobNoteRef = doc(collection(orderRef, 'jobNotes'))
    const _jobNote = jobNotes[j]
    const { files, ...objToSend } = _jobNote

    batch.set(jobNoteRef, {
      ...objToSend,
      updatedBy: user,
      updatedAt: serverTimestamp(),
    })

    const jobNoteState = {
      ...objToSend,
      id: jobNoteRef.id,
    }
    arrayenviar.push(jobNoteState)
  }

  await batch.commit()

  return this.$i18n.t('successNoteAdded')
}
