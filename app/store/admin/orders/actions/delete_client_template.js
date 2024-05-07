import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function delete_client_template(_, { objectDelete }) {
  const templatesRefClient = doc(
    db,
    'admin/config/clientsList',
    objectDelete.id
  )
  await deleteDoc(templatesRefClient)
}
