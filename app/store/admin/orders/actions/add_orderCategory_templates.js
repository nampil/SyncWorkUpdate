import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export function add_orderCategory_templates(_, { objectToSend }) {
  const templatesRef = doc(
    collection(db, 'admin/config/orderCategory-templates')
  )

  return setDoc(templatesRef, objectToSend)
}
