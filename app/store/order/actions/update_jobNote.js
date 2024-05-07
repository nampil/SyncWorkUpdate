import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_jobNote(
  { commit, dispatch, state, rootState },
  { orderId, jobNote }
) {
  const jobNoteBase = state.jobNotes.filter((jn) => jn.id === jobNote.id)[0]
  const user = rootState.auth.user.profile

  if (jobNote.pictures) {
    const picsToDelete = jobNoteBase.pictures.filter((pic) => {
      const index = jobNote.pictures
        .map((pic) => pic.codeName)
        .indexOf(pic.codeName)

      return index === -1
    })

    if (picsToDelete.length) {
      await dispatch('remove_pic_for_job', {
        picsToDelete,
        orderId,
      })
    }
  }
  if (jobNote.files && jobNote.files.length > 0) {
    const urls = await dispatch('upload_pic_for_job', {
      files: jobNote.files,
      orderId,
    })
    jobNote.pictures = []
    urls.forEach((url) => {
      jobNote.pictures.push(url)
    })

    jobNote.pictures = jobNote.pictures.filter((pic) => pic.codeName)
    for (let i = jobNote.currentPictures.length - 1; i >= 0; i--) {
      jobNote.pictures.push(jobNote.currentPictures[i])
    }
    delete jobNote.files
    delete jobNote.currentPictures
  }

  const orderRef = doc(db, 'orders', orderId)
  const jobNotesRef = doc(collection(orderRef, 'jobNotes'), jobNote.id)

  const { id, ..._jobNote } = jobNote

  await updateDoc(jobNotesRef, {
    ..._jobNote,
    updatedBy: user,
    updatedAt: serverTimestamp(),
  })

  commit('update_jobNote', jobNote)
  return this.$i18n.t('successNoteUpdate')
}
