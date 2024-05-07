import { collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '~/plugins/firebase'

export async function update_oosChecked({ _ }, { requirement, task, orderId }) {
  const requirementRef = doc(
    collection(db, `orders/${orderId}/${task.type}/${task.id}/requirements`),
    requirement.id
  )
  await updateDoc(requirementRef, { oosChecked: requirement.oosChecked })
}
