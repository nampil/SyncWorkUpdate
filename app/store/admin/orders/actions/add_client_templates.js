import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function add_client_templates(_, { objectToSend }) {
  const templatesRefClient = doc(collection(db, 'admin/config/clientsList'))
  setDoc(templatesRefClient, objectToSend)
}
