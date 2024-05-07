import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_client_template(_, { objectToSend }) {
  const templatesRefClient = doc(
    db,
    'admin/config/clientsList',
    objectToSend.id
  )

  const _objectToSend = {
    title: objectToSend.title,
    loanTypes: objectToSend.loanTypes,
    discount: objectToSend.discount,
  }
  await updateDoc(templatesRefClient, _objectToSend)
}
