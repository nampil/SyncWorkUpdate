import { doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_orderCategory_template(_, { objectToSend }) {
  const templatesRef = doc(
    db,
    'admin/config/orderCategory-templates',
    objectToSend.id
  )
  const _objectToSend = {
    title: objectToSend.title,
    desc: objectToSend.desc,
    order: objectToSend.order,
    color: objectToSend.color,
  }
  await updateDoc(templatesRef, _objectToSend)
}
