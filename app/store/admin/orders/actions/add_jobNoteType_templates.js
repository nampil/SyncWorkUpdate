import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function add_jobNoteType_templates(_, { objectToSend }) {
  const templatesRef = doc(collection(db, 'admin/config/jobNoteType-templates'))

  return setDoc(templatesRef, objectToSend)
}
