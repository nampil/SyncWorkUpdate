import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_jobNoteType_template(_, { objectToSend }) {
  const templatesRef = doc(
    db,
    'admin/config/jobNoteType-templates',
    objectToSend.id
  )
  const _objectToSend = {
    title: objectToSend.title,
    desc: objectToSend.desc,
  }
  await updateDoc(templatesRef, _objectToSend)
}
