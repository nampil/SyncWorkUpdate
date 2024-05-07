import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_department_template(_, { objectDelete }) {
  const templatesRefClient = doc(
    db,
    'admin/config/departments-list',
    objectDelete.id
  )
  await deleteDoc(templatesRefClient)
}
