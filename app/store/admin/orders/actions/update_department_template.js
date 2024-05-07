import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_department_template(_, { objectToSend }) {
  const templatesRefClient = doc(
    db,
    'admin/config/departments-list',
    objectToSend.id
  )

  await updateDoc(templatesRefClient, objectToSend)
}
