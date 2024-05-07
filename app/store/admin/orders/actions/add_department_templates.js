import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function add_department_templates(_, { objectToSend }) {
  const templatesRefClient = doc(
    collection(db, 'admin/config/departments-list')
  )
  setDoc(templatesRefClient, objectToSend)
}
